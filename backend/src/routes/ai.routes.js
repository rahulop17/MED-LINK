import { Router } from "express"
import { checkSymptoms } from "../controllers/ai.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.post("/symptom-check", verifyJWT, checkSymptoms)

export default router