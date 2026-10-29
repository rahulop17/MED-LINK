import { Router } from "express"
import {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
} from "../controllers/appointment.controller.js"
import { verifyJWT, verifyDoctor } from "../middlewares/auth.middleware.js"
import {
  validateBody,
  validateParams,
} from "../middlewares/validate.middleware.js"
import {
  bookAppointmentSchema,
  updateAppointmentStatusSchema,
  mongoIdParamSchema,
} from "../validators/appointment.schemas.js"

const router = Router()

router.post(
  "/",
  verifyJWT,
  validateBody(bookAppointmentSchema),
  bookAppointment
)

router.get("/my", verifyJWT, getPatientAppointments)

router.get("/doctor", verifyJWT, verifyDoctor, getDoctorAppointments)

router.patch(
  "/:id/status",
  verifyJWT,
  verifyDoctor,
  validateParams(mongoIdParamSchema),
  validateBody(updateAppointmentStatusSchema),
  updateAppointmentStatus
)

export default router
