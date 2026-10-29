import { ApiError } from "../utils/ApiError.js"

const isProd = () => process.env.NODE_ENV === "production"

export const notFoundHandler = (_req, _res, next) => {
  next(new ApiError(404, "Route not found"))
}

export const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || "Internal Server Error"
  let errors = Array.isArray(err.errors) ? err.errors : []

  // Zod
  if (err?.name === "ZodError") {
    statusCode = 400
    message = "Validation failed"
    errors = (err.issues || []).map((issue) => ({
      path: issue.path?.join(".") || "",
      message: issue.message,
    }))
  }

  // Mongoose bad ObjectId
  if (err?.name === "CastError") {
    statusCode = 400
    message = `Invalid ${err.path || "id"}`
  }

  // Duplicate key
  if (err?.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || "field"
    message = `${field} already exists`
  }

  // JWT
  if (err?.name === "JsonWebTokenError") {
    statusCode = 401
    message = "Invalid token"
  }
  if (err?.name === "TokenExpiredError") {
    statusCode = 401
    message = "Token expired"
  }

  // Mongo transaction / transient
  if (err?.errorLabels?.includes("TransientTransactionError")) {
    statusCode = 503
    message = "Temporary conflict — please retry"
  }

  if (!isProd()) {
    console.error("[error]", statusCode, message, err?.stack || err)
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(!isProd() && err?.stack ? { stack: err.stack } : {}),
  })
}
