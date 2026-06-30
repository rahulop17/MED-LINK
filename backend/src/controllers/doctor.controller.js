import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Doctor } from "../models/doctor.model.js"
import { uploadOnCloudinary } from "../config/cloudinary.js"

// -------------------- GET ALL DOCTORS --------------------
const getAllDoctors = asyncHandler(async (req, res) => {
  const { specialization, city, minFee, maxFee } = req.query

  const filter = { isVerified: true }

  if (specialization) {
    filter.specialization = { $regex: specialization, $options: "i" }
  }
  if (city) {
    filter.city = { $regex: city, $options: "i" }
  }
  if (minFee || maxFee) {
    filter.consultationFee = {}
    if (minFee) filter.consultationFee.$gte = Number(minFee)
    if (maxFee) filter.consultationFee.$lte = Number(maxFee)
  }

  const doctors = await Doctor.find(filter).select(
    "-password -refreshToken -degreeDoc"
  )

  return res.status(200).json(
    new ApiResponse(200, doctors, "Doctors fetched successfully")
  )
})

// -------------------- GET SINGLE DOCTOR --------------------
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .select("-password -refreshToken -degreeDoc")

  if (!doctor) {
    throw new ApiError(404, "Doctor not found")
  }

  if (!doctor.isVerified) {
    throw new ApiError(403, "Doctor is not verified yet")
  }

  return res.status(200).json(
    new ApiResponse(200, doctor, "Doctor fetched successfully")
  )
})

// -------------------- UPDATE DOCTOR PROFILE --------------------
const updateDoctorProfile = asyncHandler(async (req, res) => {
  const {
    name, phone, specialization,
    experience, clinicName, city,
    consultationFee, bio, availableSlots
  } = req.body

  let avatarUrl
  if (req.file) {
    const uploaded = await uploadOnCloudinary(req.file.path)
    avatarUrl = uploaded?.secure_url
  }

  const updatedDoctor = await Doctor.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(specialization && { specialization }),
        ...(experience && { experience: Number(experience) }),
        ...(clinicName && { clinicName }),
        ...(city && { city }),
        ...(consultationFee && { consultationFee: Number(consultationFee) }),
        ...(bio && { bio }),
        ...(availableSlots && { availableSlots }),
        ...(avatarUrl && { avatar: avatarUrl }),
      },
    },
    { new: true }
  ).select("-password -refreshToken")

  return res.status(200).json(
    new ApiResponse(200, updatedDoctor, "Profile updated successfully")
  )
})

// -------------------- ADD/UPDATE SLOTS (poora array replace karta hai) --------------------
const addSlot = asyncHandler(async (req, res) => {
  const { slots } = req.body

  if (!Array.isArray(slots)) {
    throw new ApiError(400, "Slots must be an array")
  }

  const updatedDoctor = await Doctor.findByIdAndUpdate(
    req.user._id,
    { $set: { availableSlots: slots } },
    { new: true }
  ).select("-password -refreshToken")

  if (!updatedDoctor) {
    throw new ApiError(404, "Doctor not found")
  }

  return res.status(200).json(
    new ApiResponse(200, updatedDoctor, "Slots updated successfully")
  )
})

// -------------------- FOLLOW / UNFOLLOW --------------------
const toggleFollow = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)

  if (!doctor) {
    throw new ApiError(404, "Doctor not found")
  }

  const userId = req.user._id
  const isFollowing = doctor.followers.includes(userId)

  if (isFollowing) {
    doctor.followers = doctor.followers.filter(
      (id) => id.toString() !== userId.toString()
    )
    await doctor.save()
    return res.status(200).json(
      new ApiResponse(200, {}, "Unfollowed successfully")
    )
  } else {
    doctor.followers.push(userId)
    await doctor.save()
    return res.status(200).json(
      new ApiResponse(200, {}, "Followed successfully")
    )
  }
})

export {
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  toggleFollow,
  addSlot,
}