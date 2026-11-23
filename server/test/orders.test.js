import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
import { openStore } from "../store.js";
import { createApp } from "../app.js";

test("student checkout and kitchen pickup", async (t) => {
  const db = openStore(":memory:");
  const server = createApp(db).listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    db.close();
  });
  async function request(path, method = "GET", body, cookie = "") {
    const res = await fetch(
      "http://127.0.0.1:" + server.address().port + "/api" + path,
      {
        method,
        headers: { "Content-Type": "application/json", cookie },
        body: body ? JSON.stringify(body) : undefined,
      },
    );
    return {
      status: res.status,
      data: await res.json(),
      cookie: res.headers.get("set-cookie")?.split(";")[0],
    };
  }
  const creds = {
    email: "student@example.test",
    name: "Alex",
    password: randomUUID(),
  };
  const signup = await request("/users/signup", "POST", creds);
  assert.equal(signup.status, 200);
  assert.equal(signup.data.password, undefined);
  assert.notEqual(
    db.prepare("SELECT password FROM users").get().password,
    creds.password,
  );
  const student = signup.cookie;
  assert.equal(
    (
      await request("/users/login", "POST", {
        ...creds,
        password: "incorrect-password",
      })
    ).status,
    401,
  );
  assert.equal((await request("/users/login", "POST", creds)).status, 200);
  assert.equal((await request("/orders")).status, 401);
  assert.equal(
    (await request("/kitchen", "GET", undefined, student)).status,
    403,
  );
  const food = await request("/menu");
  assert.equal(food.data.length, 20);
  const dish = food.data.find((i) => i.inStock);
  const order = {
    items: [{ id: dish.id, quantity: 2 }],
    requestKey: randomUUID(),
  };
  const created = await request("/orders", "POST", order, student);
  assert.equal(created.status, 201);
  assert.deepEqual(
    (await request("/orders", "POST", order, student)).data,
    created.data,
  );
  const history = await request("/orders", "GET", undefined, student);
  assert.equal(history.data.length, 1);
  assert.equal(history.data[0].total, 2 * dish.price);
  const operator = await request("/users/signup", "POST", {
    ...creds,
    email: "staff@example.test",
  });
  const staff = operator.cookie;
  db.prepare("UPDATE users SET role='staff' WHERE id=?").run(operator.data.id);
  assert.deepEqual(
    (await request("/orders", "GET", undefined, staff)).data,
    [],
  );
  const ticket = created.data.id;
  assert.equal(
    (await request("/orders/" + ticket + "/cancel", "PATCH", {}, staff)).status,
    409,
  );
  for (const from of ["PLACED", "PREPARING", "READY"]) {
    assert.equal(
      (await request("/kitchen/" + ticket, "PATCH", { from }, staff)).status,
      200,
    );
    assert.equal(
      (await request("/kitchen/" + ticket, "PATCH", { from }, staff)).status,
      409,
    );
  }
  assert.equal(
    (await request("/orders", "GET", undefined, student)).data[0].status,
    "COMPLETED",
  );
  assert.deepEqual(
    (await request("/kitchen", "GET", undefined, staff)).data,
    [],
  );
  const cancellable = await request(
    "/orders",
    "POST",
    { ...order, requestKey: randomUUID() },
    student,
  );
  assert.equal(
    (
      await request(
        "/orders/" + cancellable.data.id + "/cancel",
        "PATCH",
        {},
        student,
      )
    ).status,
    200,
  );
  assert.equal(
    (await request("/menu/" + dish.id, "PATCH", { available: false }, staff))
      .status,
    200,
  );
  assert.equal(
    (
      await request(
        "/orders",
        "POST",
        { ...order, requestKey: randomUUID() },
        student,
      )
    ).status,
    409,
  );
  assert.equal(
    (await request("/feedback", "POST", { message: "Enjoyed lunch" }, student))
      .status,
    201,
  );
  assert.equal(
    (await request("/feedback", "GET", undefined, staff)).data[0].message,
    "Enjoyed lunch",
  );
  await request("/logout", "POST", {}, student);
  assert.equal(
    (await request("/session", "GET", undefined, student)).data,
    null,
  );
});
