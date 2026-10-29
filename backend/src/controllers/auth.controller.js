import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { Doctor } from "../models/doctor.model.js"
import { uploadOnCloudinary } from "../config/cloudinary.js"
import { hashToken, tokensMatch } from "../utils/tokenHash.js"

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
}

async function findAccountByRole(id, role) {
  if (role === "doctor") {
    return Doctor.findById(id)
  }
  return User.findById(id)
}

async function issueTokenPair(account) {
  const accessToken = account.generateAccessToken()
  const refreshToken = account.generateRefreshToken()
  account.refreshToken = hashToken(refreshToken)
  await account.save({ validateBeforeSave: false })
  return { accessToken, refreshToken }
}

async function clearRefresh(account) {
  account.refreshToken = undefined
  await account.save({ validateBeforeSave: false })
}

// -------------------- PATIENT REGISTER --------------------
const registerPatient = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new ApiError(409, "Email already registered")
  }

  let avatarUrl = ""
  if (req.file) {
    const uploaded = await uploadOnCloudinary(req.file.path)
    avatarUrl = uploaded?.secure_url || ""
  }

  const user = await User.create({
    name,
    email,
    password,
    phone: phone || undefined,
    avatar: avatarUrl,
    role: "patient",
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  return res.status(201).json(
    new ApiResponse(201, createdUser, "Patient registered successfully")
  )
})

// -------------------- DOCTOR REGISTER --------------------
const registerDoctor = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    mciNumber,
    specialization,
    experience,
    clinicName,
    city,
    consultationFee,
    bio,
  } = req.body

  const existingDoctor = await Doctor.findOne({
    $or: [{ email }, { mciNumber }],
  })
  if (existingDoctor) {
    throw new ApiError(409, "Email or MCI number already registered")
  }

  const doctor = await Doctor.create({
    name,
    email,
    password,
    phone: phone || undefined,
    mciNumber,
    specialization,
    experience,
    clinicName,
    city,
    consultationFee,
    bio,
    isVerified: true,
  })

  const createdDoctor = await Doctor.findById(doctor._id).select(
    "-password -refreshToken"
  )

  return res.status(201).json(
    new ApiResponse(
      201,
      createdDoctor,
      "Doctor registered! Wait for admin verification."
    )
  )
})

// -------------------- LOGIN --------------------
const loginUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body

  let user
  if (role === "doctor") {
    user = await Doctor.findOne({ email })
  } else {
    user = await User.findOne({ email })
  }

  if (!user) {
    throw new ApiError(404, "User not found")
  }

  if (role === "doctor" && !user.isVerified) {
    throw new ApiError(403, "Your account is pending admin verification")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials")
  }

  const { accessToken, refreshToken } = await issueTokenPair(user)

  const loggedInUser =
    role === "doctor"
      ? await Doctor.findById(user._id).select("-password -refreshToken")
      : await User.findById(user._id).select("-password -refreshToken")

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { loggedInUser, accessToken, refreshToken },
        "Login successful"
      )
    )
})

// -------------------- REFRESH (rotation + reuse detection) --------------------
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incoming =
    req.body?.refreshToken ||
    req.cookies?.refreshToken ||
    req.header("Authorization")?.replace("Bearer ", "")

  if (!incoming) {
    throw new ApiError(401, "Refresh token required")
  }

  let decoded
  try {
    decoded = jwt.verify(incoming, process.env.REFRESH_TOKEN_SECRET)
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token")
  }

  const role = decoded.role || "patient"
  const account = await findAccountByRole(decoded._id, role)
  if (!account) {
    throw new ApiError(401, "Invalid refresh token")
  }

  // Reuse detection: valid JWT but not the current stored hash → stolen/old token
  if (!tokensMatch(incoming, account.refreshToken)) {
    await clearRefresh(account)
    throw new ApiError(
      401,
      "Refresh token reuse detected — please log in again"
    )
  }

  const { accessToken, refreshToken } = await issueTokenPair(account)

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Token refreshed successfully"
      )
    )
})

// -------------------- LOGOUT --------------------
const logoutUser = asyncHandler(async (req, res) => {
  if (req.user.mciNumber) {
    await Doctor.findByIdAndUpdate(req.user._id, {
      $unset: { refreshToken: 1 },
    })
  } else {
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { refreshToken: 1 },
    })
  }

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"))
})

export {
  registerPatient,
  registerDoctor,
  loginUser,
  logoutUser,
  refreshAccessToken,
}
