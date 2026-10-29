import { Router } from "express"
import {
  registerPatient,
  registerDoctor,
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "../controllers/auth.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { validateBody } from "../middlewares/validate.middleware.js"
import {
  authLimiter,
  refreshLimiter,
} from "../middlewares/rateLimit.middleware.js"
import {
  registerPatientSchema,
  registerDoctorSchema,
  loginSchema,
  refreshTokenSchema,
} from "../validators/auth.schemas.js"

const router = Router()

router.post(
  "/register/patient",
  authLimiter,
  upload.single("avatar"),
  validateBody(registerPatientSchema),
  registerPatient
)

router.post(
  "/register/doctor",
  authLimiter,
  validateBody(registerDoctorSchema),
  registerDoctor
)

router.post("/login", authLimiter, validateBody(loginSchema), loginUser)

router.post(
  "/refresh-token",
  refreshLimiter,
  validateBody(refreshTokenSchema),
  refreshAccessToken
)

router.post("/logout", verifyJWT, logoutUser)

export default router
