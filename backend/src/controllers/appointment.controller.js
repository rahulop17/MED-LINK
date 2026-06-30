import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Appointment } from "../models/appointment.model.js"
import { Doctor } from "../models/doctor.model.js"

// -------------------- BOOK APPOINTMENT --------------------
const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, slot, symptoms } = req.body

  if (!doctorId || !slot) {
    throw new ApiError(400, "Doctor and slot are required")
  }

  // doctor exist aur verified hai?
  const doctor = await Doctor.findById(doctorId)
  if (!doctor || !doctor.isVerified) {
    throw new ApiError(404, "Doctor not found or not verified")
  }

  // slot available hai?
  if (!doctor.availableSlots.includes(slot)) {
    throw new ApiError(400, "Selected slot is not available")
  }

  // already booked toh nahi?
  const existingAppointment = await Appointment.findOne({
    doctor: doctorId,
    slot,
    status: { $in: ["pending", "confirmed"] },
  })
  if (existingAppointment) {
    throw new ApiError(409, "This slot is already booked")
  }

  const appointment = await Appointment.create({
    patient: req.user._id,
    doctor: doctorId,
    slot,
    symptoms,
    status: "pending",
  })

  return res.status(201).json(
    new ApiResponse(201, appointment, "Appointment booked successfully")
  )
})

// -------------------- GET PATIENT APPOINTMENTS --------------------
const getPatientAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({
    patient: req.user._id,
  }).populate("doctor", "name specialization clinicName city consultationFee avatar")

  return res.status(200).json(
    new ApiResponse(200, appointments, "Appointments fetched successfully")
  )
})

// -------------------- GET DOCTOR APPOINTMENTS --------------------
const getDoctorAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({
    doctor: req.user._id,
  }).populate("patient", "name email phone avatar")

  return res.status(200).json(
    new ApiResponse(200, appointments, "Appointments fetched successfully")
  )
})

// -------------------- UPDATE APPOINTMENT STATUS --------------------
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  const { id } = req.params

  const validStatuses = ["confirmed", "completed", "cancelled"]
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status")
  }

  const appointment = await Appointment.findById(id)
  if (!appointment) {
    throw new ApiError(404, "Appointment not found")
  }

  // sirf us doctor ka appointment update ho
  if (appointment.doctor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to update this appointment")
  }

  appointment.status = status
  await appointment.save()

  return res.status(200).json(
    new ApiResponse(200, appointment, "Appointment status updated")
  )
})

export {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
}