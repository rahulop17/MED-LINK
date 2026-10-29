import { Router } from "express"
import { checkSymptoms } from "../controllers/ai.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { validateBody } from "../middlewares/validate.middleware.js"
import { aiLimiter } from "../middlewares/rateLimit.middleware.js"
import { symptomCheckSchema } from "../validators/ai.schemas.js"

const router = Router()

router.post(
  "/symptom-check",
  aiLimiter,
  verifyJWT,
  validateBody(symptomCheckSchema),
  checkSymptoms
)

export default router
