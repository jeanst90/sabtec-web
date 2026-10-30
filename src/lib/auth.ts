import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE = "sabtec_session";
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 dias

function sign(payload: string) {
  const secret = process.env.AUTH_SECRET || "sabtec-default-secret-change-me";
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function encode(obj: Record<string, unknown>) {
  const json = JSON.stringify(obj);
  const b64 = Buffer.from(json).toString("base64url");
  const sig = sign(b64);
  return `${b64}.${sig}`;
}

function decode(token: string) {
  try {
    const [b64, sig] = token.split(".");
    if (!b64 || !sig) return null;
    if (sign(b64) !== sig) return null;
    const json = Buffer.from(b64, "base64url").toString("utf8");
    return JSON.parse(json) as { userId: string; email: string; name: string; role: string; exp: number };
  } catch {
    return null;
  }
}

export async function createSession(user: { id: string; email: string; name: string; role: string }) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL;
  const token = encode({ userId: user.id, email: user.email, name: user.name, role: user.role, exp });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = decode(token);
  if (!session) return null;
  if (session.exp < Math.floor(Date.now() / 1000)) return null;
  return session;
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}
