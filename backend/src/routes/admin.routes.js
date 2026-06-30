import { Router } from "express"
import {
  getPendingDoctors,
  verifyDoctor,
  getAllUsers,
} from "../controllers/admin.controller.js"
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js"

const router = Router()

// sab routes pe verifyJWT + verifyAdmin lagega
router.use(verifyJWT, verifyAdmin)

router.get("/pending-doctors", getPendingDoctors)
router.patch("/verify/:id", verifyDoctor)
router.get("/users", getAllUsers)

export default router