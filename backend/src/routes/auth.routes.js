import { Router } from "express"
import {
  registerPatient,
  registerDoctor,
  loginUser,
  logoutUser,
} from "../controllers/auth.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

// patient register
router.post("/register/patient", upload.single("avatar"), registerPatient)

// doctor register —  degree doc not  required
router.post("/register/doctor", registerDoctor)

// login — dono ke liye same route
router.post("/login", loginUser)

// logout — JWT verify hoga pehle
router.post("/logout", verifyJWT, logoutUser)

export default router