import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js"
import doctorRouter from "./routes/doctor.routes.js"
import adminRouter from "./routes/admin.routes.js"
import appointmentRouter from "./routes/appointment.routes.js"
import postRouter from "./routes/post.routes.js"
import paymentRouter from "./routes/payment.routes.js"
import aiRouter from "./routes/ai.routes.js"

const app = express()

// middlewares
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://med-link-puce.vercel.app"
    
  ],
  credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())
app.use("/api/auth", authRouter)
app.use("/api/doctors", doctorRouter)
app.use("/api/admin", adminRouter)
app.use("/api/appointments", appointmentRouter)
app.use("/api/posts", postRouter)
app.use("/api/payments", paymentRouter)
app.use("/api/ai", aiRouter)
// test route
app.get("/", (req, res) => {
  res.send("MedLink API is running!")
})

export { app }