import { z } from "zod"

const indianPhone = z
  .string()
  .trim()
  .refine((phone) => {
    const digits = phone.replace(/\D/g, "")
    const local =
      digits.length === 12 && digits.startsWith("91")
        ? digits.slice(2)
        : digits.length === 11 && digits.startsWith("0")
          ? digits.slice(1)
          : digits
    return /^[6-9]\d{9}$/.test(local)
  }, "Enter a valid 10-digit Indian phone number")

const optionalPhone = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  indianPhone.optional()
)

export const registerPatientSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: optionalPhone,
})

export const registerDoctorSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: optionalPhone,
  mciNumber: z.string().trim().min(3, "MCI number is required"),
  specialization: z.string().trim().min(2, "Specialization is required"),
  experience: z.coerce.number().int().min(0).max(60),
  clinicName: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().trim().optional()
  ),
  city: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().trim().optional()
  ),
  consultationFee: z.coerce.number().positive("Consultation fee must be > 0"),
  bio: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().trim().optional()
  ),
})

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["patient", "doctor", "admin"]),
})

export const refreshTokenSchema = z
  .object({
    refreshToken: z.string().min(1).optional(),
  })
  .passthrough()
