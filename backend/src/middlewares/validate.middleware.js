/**
 * Validate req.body (and optionally query/params) with a Zod schema.
 * Replaces req.* with parsed/coerced values on success.
 */
export const validateBody = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body)
  if (!result.success) return next(result.error)
  req.body = result.data
  next()
}

export const validateParams = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.params)
  if (!result.success) return next(result.error)
  req.params = result.data
  next()
}

export const validateQuery = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.query)
  if (!result.success) return next(result.error)
  req.query = result.data
  next()
}
