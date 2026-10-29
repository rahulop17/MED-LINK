import rateLimit from "express-rate-limit"

const jsonHandler = (message) => (_req, res) => {
  res.status(429).json({
    success: false,
    message,
    errors: [],
  })
}

/** Login / register — stop credential stuffing */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler("Too many auth attempts. Try again in 15 minutes."),
})

/** Payment create-order / verify */
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler("Too many payment requests. Try again later."),
})

/** AI symptom checker — cost control */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler("Too many AI requests. Slow down."),
})

/** Refresh token endpoint */
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler("Too many token refresh attempts."),
})
