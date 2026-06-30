import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Footer from "../components/common/Footer"

const specialities = [
  { name: "General Physician", emoji: "🩺" },
  { name: "Gynecologist", emoji: "🤰" },
  { name: "Dermatologist", emoji: "✨" },
  { name: "Pediatrician", emoji: "👶" },
  { name: "Neurologist", emoji: "🧠" },
  { name: "Cardiologist", emoji: "❤️" },
  { name: "Gastroenterologist", emoji: "🫁" },
  { name: "Orthopedist", emoji: "🦴" },
]

const stats = [
  { value: "98%", label: "Patient Satisfaction" },
  { value: "5,000+", label: "Verified Doctors" },
  { value: "24/7", label: "AI Support" },
  { value: "15min", label: "Avg. Wait Time" },
]

const featuredDoctors = [
  {
    name: "Dr. Sarah Jenkins",
    specialization: "Cardiologist",
    bio: "Specializing in preventive cardiology and heart health management.",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=500&fit=crop&crop=face",
  },
  {
    name: "Dr. Michael Chen",
    specialization: "Neurologist",
    bio: "Expert in neurological disorders and cognitive health assessments.",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=500&fit=crop&crop=face",
  },
  {
    name: "Dr. Emily Rodriguez",
    specialization: "Pediatrician",
    bio: "Dedicated to comprehensive care for infants, children, and adolescents.",
    rating: "5.0",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=500&fit=crop&crop=face",
  },
  {
    name: "Dr. James Wilson",
    specialization: "Dermatologist",
    bio: "Advanced treatments for skin conditions and cosmetic dermatology.",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=500&fit=crop&crop=face",
  },
]

function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.append("specialization", searchQuery.trim())
    navigate(`/doctors${params.toString() ? `?${params.toString()}` : ""}`)
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-forest)] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[var(--color-forest)] tracking-tight">MedLink</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link to="/doctors" className="hover:text-[var(--color-forest)] transition-colors">Find Doctors</Link>
            <Link to="/symptom-checker" className="hover:text-[var(--color-forest)] transition-colors">AI Checker</Link>
            <Link to="/feed" className="hover:text-[var(--color-forest)] transition-colors">Resources</Link>
          </div>

          <div className="flex gap-2 sm:gap-3 items-center">
            {user ? (
              <>
                <Link
                  to={user.role === "doctor" ? "/doctor/dashboard" : "/my-appointments"}
                  className="hidden sm:inline text-sm font-medium text-[var(--color-forest)] hover:underline"
                >
                  {user.role === "doctor" ? "Dashboard" : "My Appointments"}
                </Link>
                <button
                  onClick={logout}
                  className="btn-primary !py-2.5 !px-5 !rounded-xl text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:text-[var(--color-forest)] px-3 py-2 transition-colors"
                >
                  Login
                </Link>
                <Link to="/register" className="btn-primary !py-2.5 !px-5 !rounded-xl text-sm">
                  Join Now
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-[var(--color-cream)] pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-50/60 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-10 pt-12 pb-20 md:pt-16 md:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-[var(--color-forest)] text-xs font-semibold tracking-wide uppercase mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-forest)] animate-pulse" />
                AI-Powered Healthcare
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-slate-900 leading-[1.1] mb-6">
                Find the right care,{" "}
                <span className="text-[var(--color-forest)]">powered by AI</span>
              </h1>

              <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
                Simply browse through our verified doctors, describe your symptoms, and let AI guide you to the right specialist — hassle free.
              </p>

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by specialty, symptom, or doctor name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]/20 focus:border-[var(--color-forest)] shadow-sm transition"
                  />
                </div>
                <button type="submit" className="btn-primary !py-4 !px-8 !rounded-2xl whitespace-nowrap">
                  Find Doctor
                </button>
              </form>

              <div className="flex items-center gap-3 text-sm text-slate-500">
                <div className="flex -space-x-2">
                  {["S", "M", "E"].map((l) => (
                    <div
                      key={l}
                      className="w-8 h-8 rounded-full bg-[var(--color-forest)] border-2 border-white flex items-center justify-center text-xs text-white font-semibold"
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <span>Trusted by <strong className="text-slate-700 font-semibold">10k+ patients</strong> worldwide</span>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-[var(--shadow-card)] border border-slate-200/60">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop"
                  alt="Healthcare technology"
                  className="w-full h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-forest)]/20 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -left-4 card-premium !rounded-2xl px-5 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">AI Analysis Complete</p>
                  <p className="text-xs text-slate-500">Specialist recommended</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <p className="text-3xl md:text-4xl font-bold text-[var(--color-forest)] mb-1">{stat.value}</p>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Designed for Patients &amp; Professionals
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Whether you&apos;re seeking care or providing it, MedLink streamlines the entire healthcare journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Patient Card */}
          <div className="card-premium p-8 md:p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/4 opacity-60" />
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-[var(--color-forest)] mb-4">
              For Patients
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Seamless Care Journey</h3>
            <ul className="space-y-4 mb-8 relative">
              {[
                { icon: "🧠", text: "Smart Symptom Mapping" },
                { icon: "📅", text: "Instant Appointment Booking" },
                { icon: "📋", text: "Unified Health Records" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3 text-slate-600">
                  <span className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-base shrink-0">
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.text}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/symptom-checker"
              className="btn-outline !rounded-xl relative"
            >
              Try Symptom Checker
            </Link>
          </div>

          {/* Doctor Card */}
          <div className="rounded-[1.25rem] p-8 md:p-10 relative overflow-hidden bg-[var(--color-forest)] text-white shadow-[var(--shadow-card)] group">
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/3 translate-x-1/4" />
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-blue-200 mb-4">
              For Doctors
            </span>
            <h3 className="text-2xl font-bold mb-6">Optimized Practice</h3>
            <ul className="space-y-4 mb-8 relative">
              {[
                { icon: "📊", text: "Automated Scheduling" },
                { icon: "💬", text: "Patient Communication Hub" },
                { icon: "📈", text: "Practice Analytics" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3 text-blue-100">
                  <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-base shrink-0">
                    {item.icon}
                  </span>
                  <span className="font-medium text-white">{item.text}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-forest)] font-semibold text-sm px-6 py-3 rounded-xl hover:bg-blue-50 transition-all hover:-translate-y-0.5 relative"
            >
              Register Practice
            </Link>
          </div>
        </div>
      </section>

      {/* AI CTA Banner */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
        <div className="rounded-3xl bg-gradient-to-r from-[var(--color-forest)] to-[#0066FF] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[var(--shadow-card)]">
          <div className="text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Powered by Healthcare-Specific LLMs
            </h3>
            <p className="text-blue-100 max-w-md leading-relaxed">
              Our AI models are trained on millions of clinical records to provide accurate, safe preliminary assessments.
            </p>
          </div>
          <Link
            to="/symptom-checker"
            className="shrink-0 inline-flex items-center gap-2 bg-white text-[var(--color-forest)] font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-all hover:-translate-y-0.5 shadow-lg"
          >
            Check Symptoms
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Featured Medical Experts */}
      <section className="bg-white border-t border-slate-200/80 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Featured Medical Experts</h2>
              <p className="text-slate-500">Top-rated specialists available for consultation today.</p>
            </div>
            <Link
              to="/doctors"
              className="text-sm font-semibold text-[var(--color-forest)] hover:underline inline-flex items-center gap-1"
            >
              View all doctors
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDoctors.map((doctor) => (
              <div
                key={doctor.name}
                className="card-premium overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-white/95 text-xs font-semibold text-slate-700 shadow-sm">
                    <svg className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {doctor.rating}
                  </div>
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-[var(--color-forest)] text-white text-xs font-semibold">
                    {doctor.specialization}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 mb-1">{doctor.name}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">{doctor.bio}</p>
                  <Link
                    to={`/doctors?specialization=${doctor.specialization}`}
                    className="block w-full text-center py-2.5 rounded-xl border border-blue-100 text-[var(--color-forest)] text-sm font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Find by Speciality */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Find by Speciality</h2>
          <p className="text-slate-500">Browse through our extensive list of verified doctors.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {specialities.map((s) => (
            <Link
              key={s.name}
              to={`/doctors?specialization=${s.name}`}
              className="flex flex-col items-center gap-2 bg-white border border-slate-200 rounded-2xl px-5 py-4 hover:border-[var(--color-forest)]/30 hover:shadow-[var(--shadow-soft)] hover:-translate-y-0.5 transition-all min-w-[110px] group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{s.emoji}</span>
              <span className="text-xs font-semibold text-slate-600 text-center leading-tight group-hover:text-[var(--color-forest)] transition-colors">
                {s.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-16">
        <div className="rounded-3xl bg-slate-900 p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-forest)]/30 to-transparent pointer-events-none" />
          <div className="relative">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Book Appointment With 100+ Trusted Doctors
            </h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Join thousands of patients who found the right care through MedLink.
            </p>
            <Link to="/register" className="btn-primary !rounded-xl !px-8">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home
