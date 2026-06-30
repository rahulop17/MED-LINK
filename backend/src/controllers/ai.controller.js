import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import Groq from "groq-sdk"

const checkSymptoms = asyncHandler(async (req, res) => {
  const { symptoms } = req.body

  if (!symptoms) {
    throw new ApiError(400, "Symptoms are required")
  }

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  })

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a medical assistant. Based on symptoms provided, suggest the most appropriate medical specialist and urgency level.
        Always respond in this exact JSON format, no extra text:
        {
          "specialist": "specialist name",
          "urgency": "low/medium/high",
          "reason": "brief reason",
          "advice": "general advice"
        }`,
      },
      {
        role: "user",
        content: `My symptoms are: ${symptoms}`,
      },
    ],
  })

  const text = response.choices[0].message.content
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new ApiError(500, "AI response format error")
  }

  const result = JSON.parse(jsonMatch[0])

  return res.status(200).json(
    new ApiResponse(200, result, "Symptom analysis complete")
  )
})

export { checkSymptoms }