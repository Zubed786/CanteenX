import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { digest, hashPassword, matches, session } from "./auth.js";

const publicUser = ({ id, name, email, role }) => ({ id, name, email, role });
const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
const orderQuery =
  "SELECT o.id, u.name, o.items, o.total, o.status, o.created, o.instructions, o.pickup_at AS pickupAt, o.ready_at AS readyAt FROM orders o JOIN users u ON u.id=o.user_id";
const format = (row) => ({ ...row, items: JSON.parse(row.items) });
const next = { PLACED: "PREPARING", PREPARING: "READY", READY: "COMPLETED" };
const credentials = z.object({
  email: z.string().trim().max(254).email().toLowerCase(),
  password: z.string().min(10).max(128),
});
const signup = credentials.extend({ name: z.string().trim().min(1).max(80) });
const checkout = z.object({
  requestKey: z.string().regex(/^[\w-]{16,80}$/),
  items: z
    .array(
      z.object({
        id: z.number().int().positive(),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(100),
  instructions: z.string().trim().max(240).default(""),
  pickupMinutes: z
    .union([z.literal(0), z.literal(15), z.literal(30)])
    .default(0),
});
const dishDetails = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(400),
  price: z.number().int().min(1).max(10000),
  type: z.enum(["veg", "non-veg"]),
  category: z
    .array(z.enum(["Meals", "Snacks", "Sandwiches", "Salads", "Drinks"]))
    .length(1),
});
const transition = z.object({
  from: z.enum(["PLACED", "PREPARING", "READY"]),
  estimateMinutes: z.number().int().min(1).max(120).optional(),
});
const readInput = (schema, body, message) => {
  const parsed = schema.safeParse(body);
  if (!parsed.success) fail(400, message);
  return parsed.data;
};
const menuQuery =
  "SELECT m.id, m.details, s.available FROM menu_items m JOIN stock s ON s.id=m.id";
const dishFromRow = (row) => ({
  ...JSON.parse(row.details),
  id: row.id,
  inStock: Boolean(row.available),
});

export function createApp(db) {
  const app = express();
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
          upgradeInsecureRequests:
            process.env.COOKIE_SECURE === "true" ? [] : null,
        },
      },
      strictTransportSecurity:
        process.env.COOKIE_SECURE === "true" ? undefined : false,
    }),
  );
  app.use("/api", express.json({ limit: "24kb" }), (req, res, go) => {
    res.set("Cache-Control", "no-store");
    if (!["GET", "HEAD"].includes(req.method)) {
      if (req.get("Sec-Fetch-Site") === "cross-site")
        return res
          .status(403)
          .json({ message: "Open CanteenX to submit this request." });
      if (!req.is("application/json"))
        return res.status(415).json({ message: "Send JSON." });
    }
    const token = /(?:^|;\s*)cx_session=([a-f0-9]{64})(?:;|$)/.exec(
      req.headers.cookie || "",
    )?.[1];
    if (token) {
      req.token = digest(token);
      req.user = db
        .prepare(
          "SELECT u.id, u.name, u.email, u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE token=? AND expires>?",
        )
        .get(req.token, Date.now());
    }
    go();
  });
  const signedIn = (req, res, go) =>
    req.user ? go() : res.status(401).json({ message: "Please sign in." });
  const staff = (req, res, go) =>
    ["staff", "admin"].includes(req.user?.role)
      ? go()
      : res.status(403).json({ message: "Kitchen access required." });
  app.get("/api/session", (req, res) =>
    res.json(req.user ? publicUser(req.user) : null),
  );
  app.get("/api/menu", (req, res) => {
    res.json(
      db
        .prepare(menuQuery + " ORDER BY m.id")
        .all()
        .map(dishFromRow),
    );
  });
  const acceptingOrders = () =>
    Boolean(
      db
        .prepare("SELECT accepting_orders FROM kitchen_settings WHERE id=1")
        .get().accepting_orders,
    );
  app.get("/api/kitchen/settings", (req, res) =>
    res.json({ acceptingOrders: acceptingOrders() }),
  );
  app.patch("/api/kitchen/settings", staff, (req, res) => {
    const { acceptingOrders } = readInput(
      z.object({ acceptingOrders: z.boolean() }),
      req.body,
      "Choose whether to accept orders.",
    );
    db.prepare("UPDATE kitchen_settings SET accepting_orders=? WHERE id=1").run(
      Number(acceptingOrders),
    );
    res.json({ acceptingOrders });
  });
  const authLimit = rateLimit({
    windowMs: 600_000,
    limit: 60,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many attempts. Try again in ten minutes." },
  });
  app.post(
    ["/api/users/signup", "/api/users/login"],
    authLimit,
    async (req, res, go) => {
      try {
        const creating = req.path.endsWith("/signup");
        const { email, password, name } = readInput(
          creating ? signup : credentials,
          req.body,
          "Check your email and password. New accounts also need a name.",
        );
        let user;
        if (creating) {
          const hash = await hashPassword(password);
          const inserted = db
            .prepare(
              "INSERT OR IGNORE INTO users(email,name,password) VALUES (?,?,?)",
            )
            .run(email, name, hash);
          if (!inserted.changes)
            fail(409, "An account already uses that email.");
          user = db
            .prepare("SELECT id, name, email, role FROM users WHERE id=?")
            .get(inserted.lastInsertRowid);
        } else {
          user = db
            .prepare(
              "SELECT id, name, email, role, password FROM users WHERE email=?",
            )
            .get(email);
          if (!user || !(await matches(password, user.password)))
            fail(401, "Email or password is incorrect.");
        }
        session(db, res, user.id);
        res.json(publicUser(user));
      } catch (err) {
        go(err);
      }
    },
  );
  app.post("/api/logout", (req, res) => {
    if (req.token)
      db.prepare("DELETE FROM sessions WHERE token=?").run(req.token);
    res.clearCookie("cx_session").json({ ok: true });
  });
  app.get("/api/orders", signedIn, (req, res) =>
    res.json(
      db
        .prepare(orderQuery + " WHERE user_id=? ORDER BY o.id DESC")
        .all(req.user.id)
        .map(format),
    ),
  );
  app.post("/api/orders", signedIn, (req, res) => {
    const { items, requestKey, instructions, pickupMinutes } = readInput(
      checkout,
      req.body,
      "Check the tray quantities, pickup time, and instructions.",
    );
    db.exec("BEGIN IMMEDIATE");
    try {
      const existing = db
        .prepare("SELECT id FROM orders WHERE user_id=? AND request_key=?")
        .get(req.user.id, requestKey);
      if (existing) {
        db.exec("COMMIT");
        return res.json(existing);
      }
      if (!acceptingOrders()) fail(409, "The kitchen has paused new orders.");
      const readDish = db.prepare(menuQuery + " WHERE m.id=?");
      const seen = new Set();
      const lines = items.map((line) => {
        const row = readDish.get(line.id);
        if (!row || seen.has(line.id))
          fail(400, "Unknown or repeated menu item.");
        const item = dishFromRow(row);
        if (!item.inStock) fail(409, item.name + " is sold out.");
        seen.add(item.id);
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: line.quantity,
        };
      });
      const total = lines.reduce((sum, i) => sum + i.quantity * i.price, 0);
      const now = Date.now();
      const pickupAt = pickupMinutes
        ? new Date(now + pickupMinutes * 60000).toISOString()
        : null;
      const result = db
        .prepare(
          "INSERT INTO orders(user_id,request_key,items,total,created,instructions,pickup_at) VALUES (?,?,?,?,?,?,?)",
        )
        .run(
          req.user.id,
          requestKey,
          JSON.stringify(lines),
          total,
          new Date(now).toISOString(),
          instructions,
          pickupAt,
        );
      db.exec("COMMIT");
      res.status(201).json({ id: Number(result.lastInsertRowid) });
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }
  });
  app.patch("/api/orders/:id/cancel", signedIn, (req, res) => {
    const result = db
      .prepare(
        "UPDATE orders SET status='CANCELLED' WHERE id=? AND user_id=? AND status='PLACED'",
      )
      .run(req.params.id, req.user.id);
    if (!result.changes) fail(409, "Only your queued orders can be cancelled.");
    res.json({ ok: true });
  });
  app.get("/api/kitchen", staff, (req, res) =>
    res.json(
      db
        .prepare(
          orderQuery +
            " WHERE status IN ('PLACED','PREPARING','READY') ORDER BY o.id",
        )
        .all()
        .map(format),
    ),
  );
  app.patch(
    ["/api/kitchen/:id", "/api/orders/:id/status"],
    staff,
    (req, res) => {
      const { from, estimateMinutes } = readInput(
        transition,
        req.body,
        "Choose a valid status and estimate.",
      );
      const readyAt =
        from === "PLACED" && estimateMinutes
          ? new Date(Date.now() + estimateMinutes * 60000).toISOString()
          : null;
      if (
        !db
          .prepare(
            "UPDATE orders SET status=?, ready_at=COALESCE(?,ready_at) WHERE id=? AND status=?",
          )
          .run(next[from], readyAt, req.params.id, from).changes
      )
        fail(409, "This ticket has changed. Refresh the queue.");
      res.json({ ok: true });
    },
  );
  app.patch("/api/menu/:id", staff, (req, res) => {
    if (
      typeof req.body.available !== "boolean" ||
      !db
        .prepare("UPDATE stock SET available=? WHERE id=?")
        .run(Number(req.body.available), req.params.id).changes
    )
      fail(400, "Unknown item or availability.");
    res.json({ ok: true });
  });
  app.put("/api/menu/:id", staff, (req, res) => {
    const changes = readInput(
      dishDetails,
      req.body,
      "Check the dish name, description, price, and category.",
    );
    const row = db
      .prepare("SELECT details FROM menu_items WHERE id=?")
      .get(req.params.id);
    if (!row) fail(404, "Dish not found.");
    db.prepare("UPDATE menu_items SET details=? WHERE id=?").run(
      JSON.stringify({ ...JSON.parse(row.details), ...changes }),
      req.params.id,
    );
    res.json({ ok: true });
  });
  app.post("/api/menu", staff, (req, res) => {
    const dish = readInput(
      dishDetails,
      req.body,
      "Check the dish name, description, price, and category.",
    );
    db.exec("BEGIN IMMEDIATE");
    try {
      const { lastInsertRowid } = db
        .prepare("INSERT INTO menu_items(details) VALUES (?)")
        .run(JSON.stringify(dish));
      db.prepare("INSERT INTO stock VALUES (?, 1)").run(lastInsertRowid);
      db.exec("COMMIT");
      res.status(201).json({ id: Number(lastInsertRowid) });
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }
  });
  app.post("/api/feedback", signedIn, (req, res) => {
    const message = req.body.message;
    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.trim().length > 1000
    )
      fail(400, "Write 1–1000 characters.");
    db.prepare("INSERT INTO feedback(user_id,message) VALUES (?,?)").run(
      req.user.id,
      message.trim(),
    );
    res.status(201).json({ ok: true });
  });
  app.get("/api/feedback", staff, (req, res) =>
    res.json(
      db
        .prepare(
          "SELECT f.id,u.name,f.message FROM feedback f JOIN users u ON u.id=f.user_id ORDER BY f.id DESC LIMIT 100",
        )
        .all(),
    ),
  );
  app.use("/api", (req, res) =>
    res.status(404).json({ message: "Unknown API route." }),
  );
  app.use((err, req, res, go) => {
    if (!err.status) console.error(err);
    res.status(err.status || 500).json({
      message: err.status ? err.message : "Something went wrong. Please retry.",
    });
  });
  return app;
}
