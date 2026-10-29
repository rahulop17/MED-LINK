import crypto from "crypto"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { getRazorpay } from "../config/razorpay.js"
import { Appointment } from "../models/appointment.model.js"
import {
  PAYMENT_HOLD_MS,
  releaseExpiredUnpaidHolds,
} from "../utils/appointmentHold.js"
import {
  assertRazorpayPayment,
  findAppointmentForOrder,
  markAppointmentPaid,
} from "../utils/paymentConfirm.js"

async function assertPayable(appointment, userId) {
  if (!appointment) {
    throw new ApiError(404, "Appointment not found")
  }
  if (appointment.patient.toString() !== userId.toString()) {
    throw new ApiError(403, "Not authorized")
  }
  if (appointment.status === "cancelled") {
    throw new ApiError(
      400,
      "Payment window expired. Slot was released — please book again."
    )
  }
  if (appointment.isPaid) {
    throw new ApiError(400, "Appointment already paid")
  }

  const ageMs = Date.now() - new Date(appointment.createdAt).getTime()
  if (ageMs > PAYMENT_HOLD_MS) {
    appointment.status = "cancelled"
    await appointment.save()
    throw new ApiError(
      400,
      "Payment window expired. Slot was released — please book again."
    )
  }
}

async function reuseOrCreateOrder(appointment) {
  const razorpay = getRazorpay()
  const amountPaise = appointment.doctor.consultationFee * 100

  // Reuse open order bound to this appointment
  if (appointment.razorpayOrderId) {
    try {
      const existing = await razorpay.orders.fetch(appointment.razorpayOrderId)
      if (existing.status === "paid") {
        throw new ApiError(
          400,
          "Order already paid at Razorpay — refresh appointments"
        )
      }
      if (existing.status === "created" || existing.status === "attempted") {
        // amount locked on order; keep local amount in sync if missing
        if (!appointment.orderAmountPaise) {
          appointment.orderAmountPaise = existing.amount
          await appointment.save()
        }
        return {
          orderId: existing.id,
          amount: existing.amount,
          currency: existing.currency || "INR",
          reused: true,
        }
      }
    } catch (err) {
      if (err instanceof ApiError) throw err
      // stale/missing order — create a fresh one below
    }
  }

  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: `rcpt_${String(appointment._id).slice(-12)}_${Date.now()
      .toString()
      .slice(-6)}`,
    notes: { appointmentId: String(appointment._id) },
  })

  appointment.razorpayOrderId = order.id
  appointment.orderAmountPaise = order.amount
  await appointment.save()

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    reused: false,
  }
}

// -------------------- CREATE ORDER --------------------
const createOrder = asyncHandler(async (req, res) => {
  const { appointmentId } = req.body

  await releaseExpiredUnpaidHolds({ _id: appointmentId })

  const appointment = await Appointment.findById(appointmentId).populate(
    "doctor",
    "consultationFee name"
  )

  await assertPayable(appointment, req.user._id)

  const order = await reuseOrCreateOrder(appointment)

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        appointmentId,
        doctorName: appointment.doctor.name,
        reused: order.reused,
      },
      order.reused ? "Existing order reused" : "Order created successfully"
    )
  )
})

// -------------------- VERIFY PAYMENT (client callback) --------------------
const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    appointmentId,
  } = req.body

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !appointmentId
  ) {
    throw new ApiError(400, "Missing payment verification fields")
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex")

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Invalid payment signature")
  }

  const appointment = await Appointment.findById(appointmentId)
  if (!appointment) {
    throw new ApiError(404, "Appointment not found")
  }
  if (appointment.patient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized")
  }

  // Bind: client order must be the one we stored
  if (
    appointment.razorpayOrderId &&
    appointment.razorpayOrderId !== razorpay_order_id
  ) {
    throw new ApiError(400, "Order does not match this appointment")
  }

  if (!appointment.razorpayOrderId) {
    appointment.razorpayOrderId = razorpay_order_id
    await appointment.save()
  }

  await assertRazorpayPayment({
    paymentId: razorpay_payment_id,
    expectedOrderId: razorpay_order_id,
    expectedAmountPaise: appointment.orderAmountPaise,
  })

  const { alreadyPaid } = await markAppointmentPaid({
    appointmentId,
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
  })

  return res.status(200).json(
    new ApiResponse(
      200,
      { alreadyPaid },
      alreadyPaid ? "Payment already confirmed" : "Payment verified successfully"
    )
  )
})

// -------------------- WEBHOOK (Razorpay → server) --------------------
const paymentWebhook = asyncHandler(async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) {
    console.warn("RAZORPAY_WEBHOOK_SECRET not set — ignoring webhook")
    return res.status(503).json({ message: "Webhook not configured" })
  }

  const signature = req.headers["x-razorpay-signature"]
  const rawBody = Buffer.isBuffer(req.body)
    ? req.body
    : Buffer.from(typeof req.body === "string" ? req.body : JSON.stringify(req.body))

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")

  if (expected !== signature) {
    throw new ApiError(400, "Invalid webhook signature")
  }

  const event = JSON.parse(rawBody.toString("utf8"))
  const eventName = event.event

  if (eventName !== "payment.captured" && eventName !== "payment.authorized") {
    return res.status(200).json({ status: "ignored" })
  }

  const paymentEntity = event.payload?.payment?.entity
  if (!paymentEntity?.id || !paymentEntity?.order_id) {
    return res.status(200).json({ status: "ignored" })
  }

  const appointment = await findAppointmentForOrder(
    paymentEntity.order_id,
    paymentEntity.notes?.appointmentId
  )

  if (!appointment) {
    console.warn("Webhook: no appointment for order", paymentEntity.order_id)
    return res.status(200).json({ status: "no_appointment" })
  }

  try {
    await assertRazorpayPayment({
      paymentId: paymentEntity.id,
      expectedOrderId: paymentEntity.order_id,
      expectedAmountPaise:
        appointment.orderAmountPaise ?? paymentEntity.amount,
    })

    await markAppointmentPaid({
      appointmentId: appointment._id,
      orderId: paymentEntity.order_id,
      paymentId: paymentEntity.id,
    })
  } catch (err) {
    // Already paid with same/other id — acknowledge so Razorpay stops retrying
    if (err.statusCode === 400 && /already paid/i.test(err.message)) {
      return res.status(200).json({ status: "already_paid" })
    }
    throw err
  }

  return res.status(200).json({ status: "ok" })
})

export { createOrder, verifyPayment, paymentWebhook }
