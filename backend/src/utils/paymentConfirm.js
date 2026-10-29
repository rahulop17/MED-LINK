import { Appointment } from "../models/appointment.model.js"
import { getRazorpay } from "../config/razorpay.js"
import { ApiError } from "./ApiError.js"

/**
 * Fetch payment from Razorpay and assert it matches our order + amount.
 */
export async function assertRazorpayPayment({
  paymentId,
  expectedOrderId,
  expectedAmountPaise,
}) {
  const razorpay = getRazorpay()
  const payment = await razorpay.payments.fetch(paymentId)

  if (!payment) {
    throw new ApiError(400, "Payment not found at Razorpay")
  }

  if (payment.order_id !== expectedOrderId) {
    throw new ApiError(400, "Payment does not belong to this order")
  }

  if (!["captured", "authorized"].includes(payment.status)) {
    throw new ApiError(400, `Payment not successful (status: ${payment.status})`)
  }

  if (
    expectedAmountPaise != null &&
    Number(payment.amount) !== Number(expectedAmountPaise)
  ) {
    throw new ApiError(400, "Payment amount mismatch")
  }

  return payment
}

/**
 * Atomically mark appointment paid. Idempotent if same paymentId already applied.
 * Returns { appointment, alreadyPaid }.
 */
export async function markAppointmentPaid({
  appointmentId,
  orderId,
  paymentId,
}) {
  const existing = await Appointment.findById(appointmentId)
  if (!existing) {
    throw new ApiError(404, "Appointment not found")
  }

  if (existing.isPaid) {
    if (existing.paymentId === paymentId) {
      return { appointment: existing, alreadyPaid: true }
    }
    throw new ApiError(400, "Appointment already paid")
  }

  if (orderId && existing.razorpayOrderId && existing.razorpayOrderId !== orderId) {
    throw new ApiError(400, "Order does not match this appointment")
  }

  const appointment = await Appointment.findOneAndUpdate(
    {
      _id: appointmentId,
      isPaid: false,
      ...(existing.razorpayOrderId
        ? { razorpayOrderId: existing.razorpayOrderId }
        : {}),
    },
    {
      $set: {
        isPaid: true,
        paymentId,
        razorpayOrderId: orderId || existing.razorpayOrderId,
        status: "confirmed",
      },
    },
    { new: true }
  )

  if (!appointment) {
    // lost race — re-read
    const again = await Appointment.findById(appointmentId)
    if (again?.isPaid && again.paymentId === paymentId) {
      return { appointment: again, alreadyPaid: true }
    }
    throw new ApiError(409, "Could not confirm payment — retry or refresh")
  }

  return { appointment, alreadyPaid: false }
}

export async function findAppointmentForOrder(orderId, notesAppointmentId) {
  let appointment = await Appointment.findOne({ razorpayOrderId: orderId })
  if (!appointment && notesAppointmentId) {
    appointment = await Appointment.findById(notesAppointmentId)
  }
  return appointment
}
