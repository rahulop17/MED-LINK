import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { Doctor } from "../models/doctor.model.js"
import { uploadOnCloudinary } from "../config/cloudinary.js"

// -------------------- PATIENT REGISTER --------------------
const registerPatient = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body

  // validation
  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required")
  }

  // already exists check
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new ApiError(409, "Email already registered")
  }

  // avatar upload (optional)
  let avatarUrl = ""
  if (req.file) {
    const uploaded = await uploadOnCloudinary(req.file.path)
    avatarUrl = uploaded?.secure_url || ""
  }

  // user create karo
  const user = await User.create({
    name,
    email,
    password,
    phone,
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
    name, email, password, phone,
    mciNumber, specialization, experience,
    clinicName, city, consultationFee, bio
  } = req.body

  // validation
  if (!name || !email || !password || !mciNumber || !specialization || !experience || !consultationFee) {
    throw new ApiError(400, "All required fields must be filled")
  }

  // already exists check
  const existingDoctor = await Doctor.findOne({
    $or: [{ email }, { mciNumber }]
  })
  if (existingDoctor) {
    throw new ApiError(409, "Email or MCI number already registered")
  }


  

  // doctor create karo
  const doctor = await Doctor.create({
    name, email, password, phone,
    mciNumber, specialization,
    experience: Number(experience),
    clinicName, city,
    consultationFee: Number(consultationFee),
    bio,
    
    isVerified: true,
  })

  const createdDoctor = await Doctor.findById(doctor._id).select(
    "-password -refreshToken"
  )

  return res.status(201).json(
    new ApiResponse(201, createdDoctor, "Doctor registered! Wait for admin verification.")
  )
})

// -------------------- LOGIN --------------------
const loginUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body

  if (!email || !password || !role) {
    throw new ApiError(400, "Email, password and role are required")
  }

  // role ke hisaab se dhundo
  let user
  if (role === "doctor") {
    user = await Doctor.findOne({ email })
  } else {
    user = await User.findOne({ email })
  }

  if (!user) {
    throw new ApiError(404, "User not found")
  }

  // doctor verified hai ya nahi
  if (role === "doctor" && !user.isVerified) {
    throw new ApiError(403, "Your account is pending admin verification")
  }

  // password check
  const isPasswordValid = await user.isPasswordCorrect(password)
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials")
  }

  // tokens banao
  const accessToken = user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()

  // refresh token save karo
  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  // cookie options
  const options = {
    httpOnly: true,
    secure: true,
  }

  let loggedInUser
  if (role === "doctor") {
  loggedInUser = await Doctor.findById(user._id).select("-password -refreshToken")
  }else {
  loggedInUser = await User.findById(user._id).select("-password -refreshToken")
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { loggedInUser, accessToken, refreshToken },
        "Login successful"
      )
    )
})

// -------------------- LOGOUT --------------------
const logoutUser = asyncHandler(async (req, res) => {
  // role ke hisaab se update karo
  if (req.user.mciNumber) {
    await Doctor.findByIdAndUpdate(req.user._id, {
      $unset: { refreshToken: 1 },
    })
  } else {
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { refreshToken: 1 },
    })
  }

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logged out successfully"))
})

export { registerPatient, registerDoctor, loginUser, logoutUser }