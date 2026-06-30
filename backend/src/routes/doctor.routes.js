import { Router } from "express"
import {
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  toggleFollow,
  addSlot,
} from "../controllers/doctor.controller.js"
import { verifyJWT, verifyDoctor } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

// public routes – koi bhi dekh sakta hai
router.get("/", getAllDoctors)
router.get("/:id", getDoctorById)

// protected routes – login hona chahiye
router.patch(
  "/profile/update",
  verifyJWT,
  verifyDoctor,
  upload.single("avatar"),
  updateDoctorProfile
)

router.patch("/slots/add", verifyJWT, verifyDoctor, addSlot)

router.post("/:id/follow", verifyJWT, toggleFollow)

export default router