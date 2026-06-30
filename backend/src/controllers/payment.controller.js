import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { getRazorpay } from "../config/razorpay.js"
import { Appointment } from "../models/appointment.model.js"
import crypto from "crypto"

// -------------------- CREATE ORDER --------------------
const createOrder = asyncHandler(async (req, res) => {
  const { appointmentId } = req.body

  const appointment = await Appointment.findById(appointmentId).populate(
    "doctor",
    "consultationFee name"
  )

  if (!appointment) {
    throw new ApiError(404, "Appointment not found")
  }

  // sirf us patient ka appointment ho
  if (appointment.patient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized")
  }

  if (appointment.isPaid) {
    throw new ApiError(400, "Appointment already paid")
  }

  // razorpay order banao
  const razorpay = getRazorpay()
  const order = await razorpay.orders.create({
    amount: appointment.doctor.consultationFee * 100, // paise mein
    currency: "INR",
    receipt: `receipt_${appointmentId}`,
  })

  return res.status(200).json(
    new ApiResponse(200, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      appointmentId,
      doctorName: appointment.doctor.name,
    }, "Order created successfully")
  )
})

// -------------------- VERIFY PAYMENT --------------------
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = req.body

  // signature verify karo
  const body = razorpay_order_id + "|" + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex")

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Invalid payment signature")
  }

  // appointment update karo
  await Appointment.findByIdAndUpdate(appointmentId, {
    $set: {
      isPaid: true,
      paymentId: razorpay_payment_id,
      status: "confirmed",
    },
  })

  return res.status(200).json(
    new ApiResponse(200, {}, "Payment verified successfully")
  )
})

export { createOrder, verifyPayment }