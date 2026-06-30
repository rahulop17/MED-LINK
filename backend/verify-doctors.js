import dotenv from "dotenv"
import mongoose from "mongoose"
import { Doctor } from "./src/models/doctor.model.js"

dotenv.config()

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")
    
    const result = await Doctor.updateMany({}, { $set: { isVerified: true } })
    console.log(`Successfully verified all doctors! Matches: ${result.matchedCount}, Modified: ${result.modifiedCount}`)
    
  } catch (error) {
    console.error("Error verifying doctors:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
    process.exit(0)
  }
}

run()
