import { Router } from "express"
import {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
} from "../controllers/appointment.controller.js"
import { verifyJWT, verifyDoctor } from "../middlewares/auth.middleware.js"

const router = Router()

// patient — appointment book karo
router.post("/", verifyJWT, bookAppointment)

// patient — apne appointments dekho
router.get("/my", verifyJWT, getPatientAppointments)

// doctor — apne appointments dekho
router.get("/doctor", verifyJWT, verifyDoctor, getDoctorAppointments)

// doctor — status update karo
router.patch("/:id/status", verifyJWT, verifyDoctor, updateAppointmentStatus)

export default router