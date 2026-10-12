/**
 * Tiny signed-cookie session. Works in both the Node runtime and the proxy
 * because it only uses Web Crypto.
 *
 * Cookie value: "<expiresAtMs>.<hex HMAC-SHA256 of expiresAtMs>"
 */
export const SESSION_COOKIE = "gritta_session";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("SESSION_SECRET must be set to at least 16 characters");
  return s;
}

async function hmac(message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionValue() {
  const expires = String(Date.now() + SESSION_TTL_MS);
  return `${expires}.${await hmac(expires)}`;
}

export async function isValidSession(value: string | undefined) {
  if (!value) return false;
  const [expires, sig] = value.split(".");
  if (!expires || !sig || Number(expires) < Date.now()) return false;
  return safeEqual(sig, await hmac(expires));
}

export function passwordMatches(input: string) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) return false;
  return safeEqual(input, expected);
}
