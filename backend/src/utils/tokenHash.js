import crypto from "crypto"

/** Hash refresh tokens before storing (never store raw JWT). */
export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export function tokensMatch(rawToken, storedHash) {
  if (!rawToken || !storedHash) return false
  const a = Buffer.from(hashToken(rawToken))
  const b = Buffer.from(storedHash)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
