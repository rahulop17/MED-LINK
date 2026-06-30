import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Doctor } from "../models/doctor.model.js"

// -------------------- GET PENDING DOCTORS --------------------
const getPendingDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find({ isVerified: false }).select(
    "-password -refreshToken"
  )

  return res.status(200).json(
    new ApiResponse(200, doctors, "Pending doctors fetched successfully")
  )
})

// -------------------- VERIFY DOCTOR --------------------
const verifyDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { action } = req.body // "approve" ya "reject"

  const doctor = await Doctor.findById(id)

  if (!doctor) {
    throw new ApiError(404, "Doctor not found")
  }

  if (action === "approve") {
    doctor.isVerified = true
    await doctor.save()
    return res.status(200).json(
      new ApiResponse(200, {}, "Doctor approved successfully")
    )
  } else if (action === "reject") {
    await Doctor.findByIdAndDelete(id)
    return res.status(200).json(
      new ApiResponse(200, {}, "Doctor rejected and removed")
    )
  } else {
    throw new ApiError(400, "Invalid action — use approve or reject")
  }
})

// -------------------- GET ALL USERS --------------------
const getAllUsers = asyncHandler(async (req, res) => {
  const { User } = await import("../models/user.model.js")
  const users = await User.find({ role: "patient" }).select(
    "-password -refreshToken"
  )

  return res.status(200).json(
    new ApiResponse(200, users, "Users fetched successfully")
  )
})

export { getPendingDoctors, verifyDoctor, getAllUsers }