import mongoose from "mongoose"

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    slot: {
      type: String,
      required: true, // "Mon 10AM"
    },
    symptoms: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    paymentId: {
      type: String, // Razorpay payment ID
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    prescription: {
      type: String, // PDF Cloudinary URL
    },
  },
  { timestamps: true }
)

export const Appointment = mongoose.model("Appointment", appointmentSchema)