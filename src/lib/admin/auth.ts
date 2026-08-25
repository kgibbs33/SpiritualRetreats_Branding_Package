import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "admin_session";

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export function getOperatorSecret(): string {
  return process.env.OPERATOR_SECRET?.trim() ?? "";
}

function getSessionSecret(): string {
  return process.env.SESSION_SECRET?.trim() ?? "";
}

export function signAdminSession(now = Date.now()): string {
  const payload = Buffer.from(
    JSON.stringify({ v: 1, iat: now, exp: now + SESSION_TTL_MS })
  ).toString("base64url");
  const sig = createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(token: string): boolean {
  const secret = getSessionSecret();
  if (!secret) return false;
  const dot = token.indexOf("."); // first dot: payload is everything before it, signature everything after
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  if (!timingSafeEqual(a, b)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof exp === "number" && Date.now() < exp;
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string): boolean {
  const secret = getOperatorSecret();
  // Always run timingSafeEqual on same-length buffers to prevent timing oracle on
  // length differences or missing secret. Return value anded with real conditions after.
  const maxLen = Math.max(password.length, secret.length, 1);
  const pwBuf = Buffer.alloc(maxLen, 0);
  const scBuf = Buffer.alloc(maxLen, 0);
  Buffer.from(password).copy(pwBuf);
  Buffer.from(secret).copy(scBuf);
  const equal = timingSafeEqual(pwBuf, scBuf);
  return equal && !!secret && !!password && password.length === secret.length;
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE)?.value ?? "";
  return verifyAdminSessionToken(session);
}

export async function requireAdminSession(): Promise<void> {
  const isValid = await getAdminSession();
  if (!isValid) {
    redirect("/admin/login");
  }
}
