import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Doctor } from "../models/doctor.model.js"

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "")

  if (!token) {
    throw new ApiError(401, "Unauthorized request")
  }

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

  // role ke hisaab se user ya doctor dhundo
  let user

  if (decodedToken.role === "doctor") {
    user = await Doctor.findById(decodedToken._id).select(
      "-password -refreshToken"
    )
  } else {
    user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    )
  }

  if (!user) {
    throw new ApiError(401, "Invalid access token")
  }

  req.user = user
  next()
})

// sirf doctor allow karo
export const verifyDoctor = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "doctor") {
    throw new ApiError(403, "Only doctors can access this route")
  }
  next()
})

// sirf admin allow karo
export const verifyAdmin = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only admin can access this route")
  }
  next()
})