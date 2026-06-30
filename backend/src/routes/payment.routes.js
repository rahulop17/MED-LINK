import { Router } from "express"
import { createOrder, verifyPayment } from "../controllers/payment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

// order banao
router.post("/create-order", verifyJWT, createOrder)

// payment verify karo
router.post("/verify", verifyJWT, verifyPayment)

export default router