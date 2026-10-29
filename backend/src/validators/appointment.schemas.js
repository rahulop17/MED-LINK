import { z } from "zod"

export const bookAppointmentSchema = z.object({
  doctorId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid doctor id"),
  slot: z.string().trim().min(1, "Slot is required"),
  symptoms: z.string().trim().max(2000).optional().or(z.literal("")),
})

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(["confirmed", "completed", "cancelled"]),
})

export const mongoIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid id"),
})
