import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axiosInstance from "../utils/axiosInstance"
import { useAuth } from "../context/AuthContext"

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [role, setRole] = useState("patient")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await axiosInstance.post("/auth/login", {
        email: formData.email,
        password: formData.password,
        role,
      })

      const { loggedInUser, accessToken } = response.data.data

      login({ ...loggedInUser, role, accessToken })

      if (role === "doctor") {
        navigate("/doctor/dashboard")
      } else {
        navigate("/")
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    "w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]/20 focus:border-[var(--color-forest)] transition"

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="px-6 md:px-10 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-forest)] flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-[var(--color-forest)] tracking-tight">MedLink</span>
        </Link>
        <Link to="/" className="text-sm font-medium text-slate-500 hover:text-[var(--color-forest)] transition-colors">
          Need Help?
        </Link>
      </header>

      {/* Main card */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-[var(--shadow-card)] border border-slate-200/80 overflow-hidden">
          <div className="flex flex-col md:flex-row min-h-[560px]">
            {/* Left panel — branding */}
            <div className="hidden md:flex md:w-[42%] bg-[var(--color-forest)] text-white flex-col justify-between p-10 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10" />
              <div className="absolute bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5" />

              <div className="relative">
                <Link to="/" className="text-xl font-bold text-white tracking-tight">
                  MedLink
                </Link>
              </div>

              <div className="relative">
                <h2 className="text-3xl font-bold leading-tight mb-4">
                  Connected Healthcare for Everyone
                </h2>
                <p className="text-blue-100 text-sm leading-relaxed mb-8">
                  Join thousands of medical professionals and patients using MedLink to streamline diagnostics and appointment management.
                </p>

                <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-4 mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-sm">HIPAA Compliant</p>
                  </div>
                  <p className="text-xs text-blue-100/80 leading-relaxed">
                    Your data is secured with bank-grade encryption.
                  </p>
                  <div className="mt-3 h-1 rounded-full bg-white/20 overflow-hidden">
                    <div className="h-full w-4/5 rounded-full bg-white/60" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {["A", "B", "C"].map((l) => (
                      <div
                        key={l}
                        className="w-8 h-8 rounded-full bg-white/20 border-2 border-[var(--color-forest)] flex items-center justify-center text-xs font-semibold"
                      >
                        {l}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-blue-100">Trusted by 500+ clinics</p>
                </div>
              </div>

              <p className="relative text-xs text-blue-200/60">
                Built for real care, not just convenience.
              </p>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex items-center justify-center p-8 sm:p-10 md:p-12">
              <div className="w-full max-w-sm">
                <Link
                  to="/"
                  className="md:hidden flex items-center gap-2 mb-8"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-forest)] flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-lg font-bold text-[var(--color-forest)]">MedLink</span>
                </Link>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                  Welcome Back
                </h1>
                <p className="text-slate-500 text-sm mb-8">
                  Please enter your details to access your account.
                </p>

                {/* Role toggle */}
                <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
                  <button
                    type="button"
                    onClick={() => setRole("patient")}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      role === "patient"
                        ? "bg-white text-[var(--color-forest)] shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Patient Access
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("doctor")}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      role === "doctor"
                        ? "bg-white text-[var(--color-forest)] shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Doctor Access
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3.5 rounded-xl mb-4 border border-red-100">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <input
                        type="email"
                        name="email"
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Password
                      </label>
                      <span className="text-xs font-medium text-[var(--color-forest)] hover:underline cursor-pointer">
                        Forgot password?
                      </span>
                    </div>
                    <div className="relative">
                      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className={`${inputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary !py-3.5 !rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? "Logging in..." : "Sign In to Dashboard"}
                  </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-8">
                  Don&apos;t have an account?{" "}
                  <Link to="/register" className="text-[var(--color-forest)] font-semibold hover:underline">
                    Create Account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 md:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-200/80 bg-white">
        <p>© 2026 MedLink Healthcare. All rights reserved.</p>
        <div className="flex items-center gap-5">
          <span className="hover:text-slate-600 cursor-pointer transition">Privacy Policy</span>
          <span className="hover:text-slate-600 cursor-pointer transition">Terms of Service</span>
          <span className="hover:text-slate-600 cursor-pointer transition">Contact Support</span>
        </div>
      </footer>
    </div>
  )
}

export default Login
