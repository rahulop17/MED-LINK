/**
 * Seed verified doctors: every speciality × major metro (2 doctors each).
 * Default password for all: Doctor@123
 *
 * Usage: node scripts/seedDoctors.js
 */
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import { Doctor } from "../src/models/doctor.model.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, "../.env") })

const SPECIALITIES = [
  "General Physician",
  "Gynecologist",
  "Dermatologist",
  "Pediatrician",
  "Neurologist",
  "Cardiologist",
  "Gastroenterologist",
  "Orthopedist",
]

const CITIES = [
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Chandigarh",
  "Lucknow",
  "Kochi",
]

const FIRST = [
  "Aarav", "Vihaan", "Aditya", "Arjun", "Reyansh", "Vivaan", "Krishna", "Ishaan",
  "Ananya", "Aisha", "Diya", "Ira", "Kiara", "Meera", "Myra", "Saanvi",
  "Rohan", "Kabir", "Neha", "Priya", "Rahul", "Sneha", "Amit", "Pooja",
]

const LAST = [
  "Sharma", "Verma", "Patel", "Reddy", "Nair", "Iyer", "Singh", "Gupta",
  "Khan", "Das", "Mehta", "Joshi", "Malhotra", "Chopra", "Banerjee", "Pillai",
]

const CLINICS = [
  "City Care Clinic",
  "Apollo Health Hub",
  "Fortis Wellness",
  "Medanta Centre",
  "Max Healthcare",
  "Manipal Clinic",
  "Rainbow Care",
  "Aster Medical",
]

const SLOT_SETS = [
  ["Mon 10AM", "Mon 2PM", "Tue 11AM", "Wed 3PM"],
  ["Tue 9AM", "Wed 1PM", "Thu 4PM", "Fri 10AM"],
  ["Mon 11AM", "Thu 10AM", "Fri 2PM", "Sat 9AM"],
  ["Tue 3PM", "Wed 10AM", "Fri 11AM", "Sat 12PM"],
]

function pick(arr, i) {
  return arr[i % arr.length]
}

function buildDoctors(passwordHash) {
  const docs = []
  let n = 0

  for (const city of CITIES) {
    for (const specialization of SPECIALITIES) {
      for (let copy = 0; copy < 2; copy++) {
        const first = pick(FIRST, n)
        const last = pick(LAST, n * 3 + copy)
        const name = `Dr. ${first} ${last}`
        const slug = `${city}-${specialization}-${copy}-${n}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")

        docs.push({
          name,
          email: `seed.${slug}@medlink.test`,
          password: passwordHash,
          phone: `9${String(100000000 + n).slice(0, 9)}`,
          mciNumber: `MCI-SEED-${String(n).padStart(5, "0")}`,
          specialization,
          experience: 5 + (n % 20),
          clinicName: `${pick(CLINICS, n)} ${city}`,
          city,
          consultationFee: 299 + (n % 8) * 100,
          availableSlots: pick(SLOT_SETS, n),
          bio: `${specialization} based in ${city} with ${5 + (n % 20)} years of clinical experience. Seeded for MedLink demos.`,
          isVerified: true,
        })
        n += 1
      }
    }
  }

  return docs
}

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI missing in backend/.env")
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)
  console.log("Connected to MongoDB")

  const passwordHash = await bcrypt.hash("Doctor@123", 10)
  const docs = buildDoctors(passwordHash)
  console.log(`Prepared ${docs.length} doctors (${SPECIALITIES.length} specialities × ${CITIES.length} cities × 2)`)

  // Idempotent: remove previous seed batch, keep real accounts
  const deleted = await Doctor.deleteMany({
    email: { $regex: /^seed\./i },
  })
  console.log(`Removed old seed doctors: ${deleted.deletedCount}`)

  try {
    const inserted = await Doctor.insertMany(docs, { ordered: false })
    console.log(`Inserted ${inserted.length} doctors`)
  } catch (err) {
    if (err?.writeErrors?.length) {
      console.warn(`Partial insert: ${err.insertedDocs?.length ?? "?"} ok, ${err.writeErrors.length} errors`)
    } else {
      throw err
    }
  }

  const counts = await Doctor.aggregate([
    { $match: { email: { $regex: /^seed\./i }, isVerified: true } },
    { $group: { _id: { city: "$city", specialization: "$specialization" }, n: { $sum: 1 } } },
    { $sort: { "_id.city": 1, "_id.specialization": 1 } },
  ])
  console.log(`Seed coverage groups: ${counts.length} (expect ${CITIES.length * SPECIALITIES.length})`)
  console.log("Login password for all seed doctors: Doctor@123")
}

run()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
    console.log("Disconnected")
  })
