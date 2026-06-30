import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String, // cloudinary URL
    },
    mciNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: Number,
      required: true,
    },
    clinicName: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    consultationFee: {
      type: Number,
      required: true,
    },
    availableSlots: {
      type: [String], // ["Mon 10AM", "Tue 2PM"]
    },
    bio: {
      type: String,
      trim: true,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false, // admin approve karega
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
)

// password hash karo save se pehle
doctorSchema.pre("save", async function () {
  if (!this.isModified("password")) return
  this.password = await bcrypt.hash(this.password, 10)
})

// password check karo
doctorSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}

// access token banao
doctorSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, role: "doctor" },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  )
}

// refresh token banao
doctorSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  )
}

export const Doctor = mongoose.model("Doctor", doctorSchema)