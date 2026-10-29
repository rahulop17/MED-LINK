import mongoose from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Appointment } from "../models/appointment.model.js"
import { Doctor } from "../models/doctor.model.js"
import {
  PAYMENT_HOLD_MS,
  paymentDueAt,
  releaseExpiredUnpaidHolds,
} from "../utils/appointmentHold.js"

// -------------------- BOOK APPOINTMENT (transactional) --------------------
const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, slot, symptoms } = req.body

  const doctor = await Doctor.findById(doctorId)
  if (!doctor || !doctor.isVerified) {
    throw new ApiError(404, "Doctor not found or not verified")
  }

  if (!doctor.availableSlots?.includes(slot)) {
    throw new ApiError(400, "Selected slot is not available")
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  let appointment
  try {
    await releaseExpiredUnpaidHolds({ doctor: doctorId, slot }, { session })

    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      slot,
      status: { $in: ["pending", "confirmed"] },
    }).session(session)

    if (existingAppointment) {
      throw new ApiError(409, "This slot is already booked")
    }

    const created = await Appointment.create(
      [
        {
          patient: req.user._id,
          doctor: doctorId,
          slot,
          symptoms: symptoms || undefined,
          status: "pending",
        },
      ],
      { session }
    )
    appointment = created[0]

    await session.commitTransaction()
  } catch (err) {
    await session.abortTransaction()
    // Unique partial index race → friendly conflict
    if (err?.code === 11000) {
      throw new ApiError(409, "This slot is already booked")
    }
    throw err
  } finally {
    session.endSession()
  }

  const payload = {
    ...appointment.toObject(),
    paymentDueAt: paymentDueAt(appointment.createdAt),
    paymentHoldMs: PAYMENT_HOLD_MS,
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      payload,
      "Appointment reserved. Complete payment within 10 minutes to confirm."
    )
  )
})

// -------------------- GET PATIENT APPOINTMENTS --------------------
const getPatientAppointments = asyncHandler(async (req, res) => {
  await releaseExpiredUnpaidHolds({ patient: req.user._id })

  const appointments = await Appointment.find({
    patient: req.user._id,
  }).populate(
    "doctor",
    "name specialization clinicName city consultationFee avatar"
  )

  const data = appointments.map((a) => {
    const obj = a.toObject()
    if (!obj.isPaid && obj.status !== "cancelled") {
      obj.paymentDueAt = paymentDueAt(obj.createdAt)
    }
    return obj
  })

  return res.status(200).json(
    new ApiResponse(200, data, "Appointments fetched successfully")
  )
})

// -------------------- GET DOCTOR APPOINTMENTS --------------------
const getDoctorAppointments = asyncHandler(async (req, res) => {
  await releaseExpiredUnpaidHolds({ doctor: req.user._id })

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

  const appointment = await Appointment.findById(id)
  if (!appointment) {
    throw new ApiError(404, "Appointment not found")
  }

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
