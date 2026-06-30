import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import dotenv from "dotenv"

dotenv.config()




cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})


const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null

    // cloudinary pe upload karo
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // image ya pdf dono handle karega
    })

    // local temp file delete karo upload ke baad
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath)
    }

    return response
  } catch (error) {
    // debug ke liye actual error print karo
    console.error("Cloudinary upload failed:", error.message)

    // upload fail hone pe bhi local file delete karo (agar exist karti ho)
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath)
    }

    return null
  }
}

export { uploadOnCloudinary }