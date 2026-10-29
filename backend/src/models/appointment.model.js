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
    razorpayOrderId: {
      type: String,
      sparse: true,
      unique: true,
    },
    paymentId: {
      type: String, // Razorpay payment ID
      sparse: true,
      unique: true,
    },
    orderAmountPaise: {
      type: Number, // locked amount when order was created
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

// One active booking per doctor+slot (pending/confirmed only)
appointmentSchema.index(
  { doctor: 1, slot: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "confirmed"] },
    },
    name: "uniq_active_doctor_slot",
  }
)
appointmentSchema.index({ patient: 1, createdAt: -1 })
appointmentSchema.index({ doctor: 1, status: 1, createdAt: -1 })
appointmentSchema.index({ isPaid: 1, status: 1, createdAt: 1 })

export const Appointment = mongoose.model("Appointment", appointmentSchema)
