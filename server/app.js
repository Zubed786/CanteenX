import express from "express";
import { catalog } from "./store.js";
import {
  digest,
  hashPassword,
  matches,
  session,
  validPassword,
} from "./auth.js";

const publicUser = ({ id, name, email, role }) => ({ id, name, email, role });
const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
const orderQuery =
  "SELECT o.id, u.name, o.items, o.total, o.status, o.created FROM orders o JOIN users u ON u.id=o.user_id";
const format = (row) => ({ ...row, items: JSON.parse(row.items) });
const next = { PLACED: "PREPARING", PREPARING: "READY", READY: "COMPLETED" };

export function createApp(db) {
  const app = express();
  app.disable("x-powered-by");
  app.use("/api", express.json({ limit: "24kb" }), (req, res, go) => {
    res.set("Cache-Control", "no-store");
    if (!["GET", "HEAD"].includes(req.method) && !req.is("application/json"))
      return res.status(415).json({ message: "Send JSON." });
    const token = /(?:^|;\s*)cx_session=([a-f0-9]{64})(?:;|$)/.exec(
      req.headers.cookie || "",
    )?.[1];
    if (token) {
      req.token = digest(token);
      req.user = db
        .prepare(
          "SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE token=? AND expires>?",
        )
        .get(req.token, Date.now());
    }
    go();
  });
  const signedIn = (req, res, go) =>
    req.user ? go() : res.status(401).json({ message: "Please sign in." });
  const staff = (req, res, go) =>
    req.user?.role === "staff"
      ? go()
      : res.status(403).json({ message: "Kitchen access required." });
  app.get("/api/session", (req, res) =>
    res.json(req.user ? publicUser(req.user) : null),
  );
  app.get("/api/menu", (req, res) => {
    const stock = new Map(
      db
        .prepare("SELECT * FROM stock")
        .all()
        .map((s) => [s.id, !!s.available]),
    );
    res.json(catalog.map((i) => ({ ...i, inStock: stock.get(i.id) })));
  });
  const attempts = new Map();
  app.post(["/api/users/signup", "/api/users/login"], async (req, res, go) => {
    try {
      const now = Date.now();
      for (const [ip, window] of attempts)
        if (window.until <= now) attempts.delete(ip);
      const window = attempts.get(req.ip) || { count: 0, until: now + 600000 };
      attempts.set(req.ip, window);
      if (++window.count > 60)
        fail(429, "Too many attempts. Try again in ten minutes.");
      const { name, password } = req.body;
      const email = String(req.body.email || "")
        .trim()
        .toLowerCase();
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        email.length > 254 ||
        !validPassword(password)
      )
        fail(400, "Enter a valid email and a 10–128 character password.");
      let user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
      if (req.path.endsWith("/signup")) {
        if (typeof name !== "string" || !name.trim() || name.trim().length > 80)
          fail(400, "Enter a name of 1–80 characters.");
        const hash = await hashPassword(password);
        const inserted = db
          .prepare(
            "INSERT OR IGNORE INTO users(email,name,password) VALUES (?,?,?)",
          )
          .run(email, name.trim(), hash);
        if (!inserted.changes) fail(409, "An account already uses that email.");
        user = db
          .prepare("SELECT * FROM users WHERE id=?")
          .get(inserted.lastInsertRowid);
      } else if (!user || !(await matches(password, user.password)))
        fail(401, "Email or password is incorrect.");
      session(db, res, user.id);
      res.json(publicUser(user));
    } catch (err) {
      go(err);
    }
  });
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
    const { items, requestKey } = req.body;
    if (typeof requestKey !== "string" || !/^[\w-]{16,80}$/.test(requestKey))
      fail(400, "Missing checkout reference.");
    db.exec("BEGIN IMMEDIATE");
    try {
      const existing = db
        .prepare("SELECT id FROM orders WHERE user_id=? AND request_key=?")
        .get(req.user.id, requestKey);
      if (existing) {
        db.exec("COMMIT");
        return res.json(existing);
      }
      if (
        !Array.isArray(items) ||
        !items.length ||
        items.length > catalog.length
      )
        fail(400, "Choose at least one menu item.");
      const seen = new Set();
      const lines = items.map((line) => {
        const item = catalog.find((i) => i.id === line?.id);
        if (
          !item ||
          seen.has(item.id) ||
          !Number.isInteger(line.quantity) ||
          line.quantity < 1 ||
          line.quantity > 20
        )
          fail(400, "Invalid item or quantity.");
        if (
          !db.prepare("SELECT available FROM stock WHERE id=?").get(item.id)
            .available
        )
          fail(409, item.name + " is sold out.");
        seen.add(item.id);
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: line.quantity,
        };
      });
      const total = lines.reduce((sum, i) => sum + i.quantity * i.price, 0);
      const result = db
        .prepare(
          "INSERT INTO orders(user_id,request_key,items,total,created) VALUES (?,?,?,?,?)",
        )
        .run(
          req.user.id,
          requestKey,
          JSON.stringify(lines),
          total,
          new Date().toISOString(),
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
  app.patch("/api/kitchen/:id", staff, (req, res) => {
    const { from } = req.body;
    if (
      !Object.hasOwn(next, from) ||
      !db
        .prepare("UPDATE orders SET status=? WHERE id=? AND status=?")
        .run(next[from], req.params.id, from).changes
    )
      fail(409, "This ticket has changed. Refresh the queue.");
    res.json({ ok: true });
  });
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
    res
      .status(err.status || 500)
      .json({
        message: err.status
          ? err.message
          : "Something went wrong. Please retry.",
      });
  });
  return app;
}
