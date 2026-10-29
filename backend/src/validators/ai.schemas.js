import { z } from "zod"

export const symptomCheckSchema = z.object({
  symptoms: z.string().trim().min(3, "Describe your symptoms").max(2000),
})
