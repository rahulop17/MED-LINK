import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axiosInstance from "../utils/axiosInstance"

function Register() {
  const navigate = useNavigate()
  const [role, setRole] = useState("patient")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    mciNumber: "",
    specialization: "",
    experience: "",
    clinicName: "",
    city: "",
    consultationFee: "",
    bio: "",
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const endpoint =
        role === "patient" ? "/auth/register/patient" : "/auth/register/doctor"

      const payload =
        role === "patient"
          ? {
              name: formData.name,
              email: formData.email,
              password: formData.password,
              phone: formData.phone,
            }
          : formData

      await axiosInstance.post(endpoint, payload)

      if (role === "doctor") {
        alert("Registration successful! Wait for admin verification before logging in.")
      } else {
        alert("Registration successful! Please login.")
      }

      navigate("/login")
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    "w-full px-4 py-3 bg-white border border-[var(--color-ink)]/10 rounded-xl focus:outline-none focus:border-[var(--color-forest)] transition"

  return (
    <div className="min-h-screen bg-[var(--color-cream)] flex">
      {/* Left panel - branding */}
      <div className="hidden md:flex md:w-2/5 bg-[var(--color-forest)] text-[var(--color-cream)] flex-col justify-between p-12">
        <Link to="/" className="font-display text-2xl font-semibold">
          MedLink
        </Link>
        <div>
          <p className="font-display text-3xl leading-snug mb-4">
            Whether you're seeking care or giving it, you start here.
          </p>
          <p className="text-sm text-[var(--color-cream)]/60">
            Doctors are verified by registration number before they go live.
          </p>
        </div>
        <p className="text-xs text-[var(--color-cream)]/40">
          Built for real care, not just convenience.
        </p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="md:hidden font-display text-2xl font-semibold text-[var(--color-forest)] block mb-8">
            MedLink
          </Link>

          <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)] mb-2">
            Create your account
          </h1>
          <p className="text-[var(--color-ink)]/60 mb-8">
            Join as a patient or a verified doctor.
          </p>

          {/* Role toggle */}
          <div className="flex bg-[var(--color-sand)] rounded-full p-1 mb-6">
            <button
              onClick={() => setRole("patient")}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                role === "patient"
                  ? "bg-[var(--color-forest)] text-[var(--color-cream)]"
                  : "text-[var(--color-ink)]/60"
              }`}
            >
              Patient
            </button>
            <button
              onClick={() => setRole("doctor")}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                role === "doctor"
                  ? "bg-[var(--color-forest)] text-[var(--color-cream)]"
                  : "text-[var(--color-ink)]/60"
              }`}
            >
              Doctor
            </button>
          </div>

          {error && (
            <div className="bg-[var(--color-coral)]/10 text-[var(--color-coral-dark)] text-sm p-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={formData.name}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputClass}
            />

            {role === "doctor" && (
              <>
                <div className="h-px bg-[var(--color-ink)]/10 my-2" />
                <input
                  type="text"
                  name="mciNumber"
                  placeholder="MCI registration number"
                  value={formData.mciNumber}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
                <input
                  type="text"
                  name="specialization"
                  placeholder="Specialization (e.g. Cardiologist)"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
                <input
                  type="number"
                  name="experience"
                  placeholder="Years of experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
                <input
                  type="text"
                  name="clinicName"
                  placeholder="Clinic / hospital name"
                  value={formData.clinicName}
                  onChange={handleChange}
                  className={inputClass}
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className={inputClass}
                />
                <input
                  type="number"
                  name="consultationFee"
                  placeholder="Consultation fee (₹)"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
                <textarea
                  name="bio"
                  placeholder="Short bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass}
                />
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-coral)] text-white font-medium py-3 rounded-xl hover:bg-[var(--color-coral-dark)] transition disabled:opacity-50 mt-2"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--color-ink)]/60 mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-[var(--color-forest)] font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register