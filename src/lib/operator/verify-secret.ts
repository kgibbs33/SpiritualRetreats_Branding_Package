import { timingSafeEqual } from "node:crypto";

/**
 * Validates operator routes using `OPERATOR_SECRET`.
 * Prefer `Authorization: Bearer <secret>` or `x-operator-secret: <secret>`.
 */
export function verifyOperatorSecret(request: Request): boolean {
  const secret = process.env.OPERATOR_SECRET?.trim();
  if (!secret) {
    return false;
  }

  const auth = request.headers.get("authorization");
  const bearer =
    auth?.startsWith("Bearer ") === true ? auth.slice(7).trim() : "";
  const headerSecret = request.headers.get("x-operator-secret")?.trim() ?? "";
  const candidate = bearer || headerSecret;

  if (!candidate || candidate.length !== secret.length) {
    return false;
  }

  try {
    return timingSafeEqual(Buffer.from(candidate), Buffer.from(secret));
  } catch {
    return false;
  }
}
