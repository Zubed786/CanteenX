import "dotenv/config";
import express from "express";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { openStore } from "./store.js";

const db = openStore();
const app = createApp(db);
app.use(
  express.static(fileURLToPath(new URL("../client/dist", import.meta.url))),
);
const server = app.listen(process.env.PORT || 5000, () =>
  console.log(
    "CanteenX listening on http://localhost:" + server.address().port,
  ),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.once(signal, () => server.close(() => db.close()));
