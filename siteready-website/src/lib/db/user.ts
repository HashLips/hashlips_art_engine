import { D1DatabaseLike } from "./client";
import { hashPassword, verifyPassword } from "../auth/pbkdf2";

export type UserRecord = {
  user_id: string;
  email: string | null;
  password_hash: string | null;
  role: "client" | "worker" | "staff";
  admin_level?: "admin" | "super_admin" | null;
};

async function ensureUserColumns(db: D1DatabaseLike) {
  try {
    await db.prepare("ALTER TABLE users ADD COLUMN admin_level TEXT").run();
  } catch {
    // Column likely exists; ignore.
  }
}

export async function getUserByEmail(db: D1DatabaseLike, email: string): Promise<UserRecord | null> {
  await ensureUserColumns(db);
  const stmt = db
    .prepare("SELECT user_id, email, password_hash, role, admin_level FROM users WHERE email = ? LIMIT 1")
    .bind(email);
  const row = (await stmt.first()) as UserRecord | undefined;
  return row ?? null;
}

export async function verifyUserPassword(db: D1DatabaseLike, email: string, password: string) {
  const user = await getUserByEmail(db, email);
  if (!user || !user.password_hash) return null;
  const ok = await verifyPassword(user.password_hash, password);
  return ok ? user : null;
}

export async function createUserIfNotExists(
  db: D1DatabaseLike,
  email: string,
  role: "client" | "worker" | "staff",
  password?: string,
) {
  await ensureUserColumns(db);
  const existing = await getUserByEmail(db, email);
  if (existing) return existing;
  const user_id = crypto.randomUUID();
  const password_hash = password ? await hashPassword(password) : null;
  await db
    .prepare("INSERT INTO users (user_id, email, password_hash, role, admin_level) VALUES (?, ?, ?, ?, ?)")
    .bind(user_id, email, password_hash, role, null)
    .run();
  return { user_id, email, password_hash, role, admin_level: null };
}

export async function upsertOAuthUser(
  db: D1DatabaseLike,
  email: string,
  role: "client" | "worker" | "staff" = "client",
) {
  const existing = await getUserByEmail(db, email);
  if (existing) {
    if (existing.role === "staff") return existing;
    if (role === "worker" && existing.role !== "worker") {
      await updateUserRole(db, existing.user_id, "worker");
      return (await getUserByEmail(db, email)) ?? existing;
    }
    return existing;
  }
  return createUserIfNotExists(db, email, role, undefined);
}

export async function updateUserAdminLevel(db: D1DatabaseLike, email: string, level: "admin" | "super_admin" | null) {
  await ensureUserColumns(db);
  await db.prepare("UPDATE users SET admin_level = ? WHERE email = ?").bind(level, email).run();
  return getUserByEmail(db, email);
}

export async function updateUserRole(db: D1DatabaseLike, user_id: string, role: "client" | "worker" | "staff") {
  await ensureUserColumns(db);
  await db.prepare("UPDATE users SET role = ? WHERE user_id = ?").bind(role, user_id).run();
}

export async function updateUserPassword(db: D1DatabaseLike, user_id: string, password: string) {
  const password_hash = await hashPassword(password);
  await db.prepare("UPDATE users SET password_hash = ? WHERE user_id = ?").bind(password_hash, user_id).run();
}
