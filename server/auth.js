import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
const derive = promisify(scrypt);
export const digest = (value) =>
  createHash("sha256").update(value).digest("hex");
export const validPassword = (value) =>
  typeof value === "string" && value.length >= 10 && value.length <= 128;
export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = await derive(password, salt, 64);
  return salt + "." + key.toString("hex");
}
export async function matches(password, stored) {
  const [salt, key] = stored.split(".");
  const actual = await derive(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(key, "hex"));
}
export function session(db, res, userId) {
  const token = randomBytes(32).toString("hex");
  const maxAge = 7 * 86400000;
  db.prepare("DELETE FROM sessions WHERE expires <= ?").run(Date.now());
  db.prepare("INSERT INTO sessions VALUES (?, ?, ?)").run(
    digest(token),
    userId,
    Date.now() + maxAge,
  );
  res.cookie("cx_session", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.COOKIE_SECURE === "true",
    maxAge,
  });
}
