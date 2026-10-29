import { Router } from "express"
import { createOrder, verifyPayment } from "../controllers/payment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { validateBody } from "../middlewares/validate.middleware.js"
import { paymentLimiter } from "../middlewares/rateLimit.middleware.js"
import {
  createOrderSchema,
  verifyPaymentSchema,
} from "../validators/payment.schemas.js"

const router = Router()

router.post(
  "/create-order",
  paymentLimiter,
  verifyJWT,
  validateBody(createOrderSchema),
  createOrder
)

router.post(
  "/verify",
  paymentLimiter,
  verifyJWT,
  validateBody(verifyPaymentSchema),
  verifyPayment
)

export default router
