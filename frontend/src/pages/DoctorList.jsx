import { useState, useEffect, useRef } from "react"
import { Link, useSearchParams } from "react-router-dom"
import axiosInstance from "../utils/axiosInstance"
import Navbar from "../components/common/Navbar"
import Footer from "../components/common/Footer"

// Reusable UI imports
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Avatar } from "../components/ui/Avatar"
import { formatDoctorName } from "../utils/formatDoctorName"

const specialities = [
  { name: "General Physician", emoji: "🩺", desc: "Primary care, wellness, common cold" },
  { name: "Gynecologist", emoji: "🤰", desc: "Women's health, pregnancy, maternity" },
  { name: "Dermatologist", emoji: "✨", desc: "Skin care, acne, hair fall, rash" },
  { name: "Pediatrician", emoji: "👶", desc: "Child care, vaccinations, growth" },
  { name: "Neurologist", emoji: "🧠", desc: "Brain, nerves, migraine, tremors" },
  { name: "Cardiologist", emoji: "❤️", desc: "Heart health, blood pressure, ECG" },
  { name: "Gastroenterologist", emoji: "🫁", desc: "Digestion, stomach ache, acidity" },
  { name: "Orthopedist", emoji: "🦴", desc: "Bones, joints, arthritis, sprains" },
]

// Helper to generate deterministic ratings to keep visual look premium
const getRating = (name) => {
  const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0)
  return ((code % 5) * 0.1 + 4.5).toFixed(1)
}

const getReviewCount = (name) => {
  const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0)
  return (code % 80) + 30
}

async function reverseGeocodeCity(lat, lon) {
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
  )
  if (!res.ok) return ""
  const data = await res.json()
  return data.city || data.locality || data.principalSubdivision || ""
}

async function fetchCitySuggestions(query) {
  const res = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6&lang=en`
  )
  if (!res.ok) return []
  const data = await res.json()
  const seen = new Set()
  return (data.features || [])
    .map((f) => {
      const p = f.properties || {}
      const city = p.city || p.name || ""
      if (!city) return null
      const key = city.toLowerCase()
      if (seen.has(key)) return null
      seen.add(key)
      const detail = [p.state, p.country].filter(Boolean).join(", ")
      return { city, detail }
    })
    .filter(Boolean)
}

function DoctorList() {
  const [searchParams] = useSearchParams()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [locating, setLocating] = useState(true)
  const [activeSpec, setActiveSpec] = useState(searchParams.get("specialization") || "")
  const [cityInput, setCityInput] = useState("")
  const [appliedCity, setAppliedCity] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const cityBoxRef = useRef(null)

  const fetchDoctors = async (spec, cityFilter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (spec) params.append("specialization", spec)
      if (cityFilter) params.append("city", cityFilter)
      const response = await axiosInstance.get(`/doctors?${params.toString()}`)
      setDoctors(response.data.data)
    } catch (error) {
      console.log("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Detect current city once from browser location
  useEffect(() => {
    let cancelled = false

    const finish = () => {
      if (!cancelled) setLocating(false)
    }

    if (!navigator.geolocation) {
      finish()
      return
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const detected = await reverseGeocodeCity(coords.latitude, coords.longitude)
          if (!cancelled && detected) {
            setCityInput(detected)
            setAppliedCity(detected)
          }
        } catch (err) {
          console.log("Location lookup failed:", err)
        } finally {
          finish()
        }
      },
      () => finish(),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    )

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    // Wait for geo attempt so we don't flash an unfiltered list first
    if (locating) return
    fetchDoctors(activeSpec, appliedCity)
  }, [activeSpec, appliedCity, locating])

  // Debounced city autocomplete
  useEffect(() => {
    if (!showSuggestions || locating) return
    const q = cityInput.trim()
    if (q.length < 2) {
      setSuggestions([])
      return
    }

    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const results = await fetchCitySuggestions(q)
        if (!cancelled) setSuggestions(results)
      } catch (err) {
        console.log("City suggest failed:", err)
        if (!cancelled) setSuggestions([])
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [cityInput, showSuggestions, locating])

  useEffect(() => {
    const onPointerDown = (e) => {
      if (cityBoxRef.current && !cityBoxRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setShowSuggestions(false)
    setAppliedCity(cityInput.trim())
  }

  const pickSuggestion = (city) => {
    setCityInput(city)
    setAppliedCity(city)
    setSuggestions([])
    setShowSuggestions(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-slate-50/50 to-blue-50/30 flex flex-col font-sans antialiased">
      <Navbar />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-8 py-12">
        
        {/* Header Breadcrumb & Title */}
        <div className="mb-10 text-left">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            <Link to="/" className="hover:text-forest transition-colors duration-150">Home</Link>
            <span className="text-slate-300">/</span>
            <span className="text-forest font-bold">Find Doctor</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight sm:text-5xl leading-none">
            Consult Best Medical Experts
          </h1>
          <p className="text-slate-500 mt-3 max-w-2xl text-sm md:text-base leading-relaxed font-medium">
            Discover verified doctors near you. Select a speciality to filter, search by your city, and instantly book an appointment.
          </p>
        </div>

        {/* Layout Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Sidebar - Specialities Filter */}
          <div className="lg:col-span-1 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,82,204,0.02)] sticky top-24">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-xs uppercase tracking-widest">
                By Speciality
              </h2>
              {activeSpec && (
                <button
                  onClick={() => setActiveSpec("")}
                  className="text-xs text-forest hover:text-forest-light font-bold transition-colors duration-150"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[62vh] overflow-y-auto pr-1 scrollbar-thin">
              {specialities.map((s) => {
                const isSelected = activeSpec === s.name
                return (
                  <button
                    key={s.name}
                    onClick={() => setActiveSpec(isSelected ? "" : s.name)}
                    className={`w-full text-left px-3 py-2.5 rounded-2xl transition-all duration-300 group flex items-center gap-3 border ${
                      isSelected
                        ? "bg-forest text-white border-forest shadow-[0_4px_20px_rgba(0,82,204,0.15)] scale-[1.02]"
                        : "bg-white/40 border-slate-100 text-slate-700 hover:bg-slate-50/80 hover:border-slate-200"
                    }`}
                  >
                    <span className={`text-xl p-2 rounded-xl transition-all duration-300 shrink-0 ${
                      isSelected ? "bg-white/10" : "bg-slate-100/70 group-hover:scale-110"
                    }`}>
                      {s.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate leading-tight ${
                        isSelected ? "text-white" : "text-slate-800"
                      }`}>
                        {s.name}
                      </p>
                      <p className={`text-[10px] truncate mt-0.5 font-medium ${
                        isSelected ? "text-blue-100" : "text-slate-400"
                      }`}>
                        {s.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            
            {/* Search Toolbar */}
            <form onSubmit={handleSearch} className="relative z-50 bg-white/80 backdrop-blur-md p-4 border border-slate-200/60 rounded-[24px] shadow-[0_8px_30px_rgb(0,82,204,0.02)] flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative z-50" ref={cityBoxRef}>
                <div className="relative flex items-center">
                  <svg className="absolute left-4.5 w-4 h-4 text-slate-400 pointer-events-none z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder={locating ? "Detecting your city..." : "Search by city or location..."}
                    value={cityInput}
                    onChange={(e) => {
                      setCityInput(e.target.value)
                      setShowSuggestions(true)
                    }}
                    onFocus={() => {
                      if (cityInput.trim().length >= 2) setShowSuggestions(true)
                    }}
                    disabled={locating}
                    autoComplete="off"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-forest/40 focus:ring-1 focus:ring-forest/20 rounded-2xl focus:outline-none transition-all duration-200 text-sm font-medium text-slate-800 disabled:opacity-70"
                  />
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute left-0 right-0 top-full mt-2 z-[100] bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                    {suggestions.map((s) => (
                      <li key={`${s.city}-${s.detail}`}>
                        <button
                          type="button"
                          onClick={() => pickSuggestion(s.city)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 transition flex flex-col gap-0.5"
                        >
                          <span className="text-sm font-bold text-slate-800">{s.city}</span>
                          {s.detail && (
                            <span className="text-[11px] text-slate-400 font-medium">{s.detail}</span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Button type="submit" disabled={locating} className="sm:w-36 h-12.5 shrink-0 rounded-2xl text-sm font-bold shadow-md hover:shadow-lg">
                Search
              </Button>
            </form>
            {appliedCity && (
              <p className="-mt-5 text-xs text-slate-400 font-medium px-1">
                Showing doctors in <span className="text-forest font-bold">{appliedCity}</span>
                {" · "}edit the city above and hit Search to change
              </p>
            )}

            {/* Doctor Cards / Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-28 bg-white/60 border border-slate-200/50 rounded-[32px] backdrop-blur-md">
                <div className="relative flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
                  <span className="absolute text-xs font-bold text-forest">🩺</span>
                </div>
                <p className="text-slate-400 text-xs font-bold mt-5 tracking-wider uppercase">Loading clinical specialists...</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="bg-white/80 rounded-[32px] p-20 text-center border border-slate-200/60 shadow-[0_8px_30px_rgb(0,82,204,0.02)] flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-3xl mb-5 shadow-sm">
                  🔍
                </div>
                <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">No specialists matching your criteria</h3>
                <p className="text-slate-400 mt-2 max-w-sm text-sm font-medium leading-relaxed">
                  Try searching a different location or check other medical fields in the left filter panel.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-6 rounded-xl text-xs font-bold"
                  onClick={() => {
                    setCityInput("")
                    setAppliedCity("")
                    setActiveSpec("")
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="relative z-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {doctors.map((doctor) => {
                  const rating = getRating(doctor.name)
                  const reviews = getReviewCount(doctor.name)
                  const totalSlots = doctor.availableSlots?.length || 0

                  return (
                    <Card
                      key={doctor._id}
                      className="flex flex-col h-full overflow-hidden border border-slate-200/50 bg-white hover:scale-[1.02] hover:shadow-[0_20px_40px_-5px_rgba(0,82,204,0.12)] rounded-[24px] transition-all duration-300"
                    >
                      {/* Doctor Portrait Header */}
                      <div className="p-4 pb-0 bg-white shrink-0">
                        <div className="h-48 w-full bg-slate-50/50 rounded-2xl relative overflow-hidden group border border-slate-100">
                          <Avatar
                            src={doctor.avatar}
                            name={doctor.name}
                            size="xl"
                            className="w-full h-full object-cover rounded-none border-0"
                          />
                          
                          {/* Badges Overlay */}
                          <div className="absolute top-3 left-3 flex flex-wrap gap-2.5">
                            <Badge variant="success" className="bg-emerald-50/90 text-emerald-700 border border-emerald-100/50 backdrop-blur-sm shadow-sm py-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                              Available
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Content details */}
                      <CardContent className="p-5 pt-4 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Rating Row */}
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="flex items-center text-amber-400 text-xs">
                              {"★"}
                            </div>
                            <span className="text-xs font-black text-slate-800">{rating}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">({reviews} reviews)</span>
                          </div>

                          <h3 className="font-extrabold text-slate-900 text-lg tracking-tight group-hover:text-forest transition line-clamp-1">
                            {formatDoctorName(doctor.name)}
                          </h3>
                          
                          <p className="text-xs text-forest font-bold mt-0.5">
                            {doctor.specialization}
                          </p>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100">
                            <div className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-100 flex flex-col">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Experience</span>
                              <span className="font-extrabold text-slate-800 text-xs mt-1">{doctor.experience} Years</span>
                            </div>
                            
                            <div className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-100 flex flex-col">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Availability</span>
                              <span className={`font-extrabold text-xs mt-1 truncate ${totalSlots > 0 ? "text-forest" : "text-slate-400"}`}>
                                {totalSlots > 0 ? `${totalSlots} slots open` : "No slots"}
                              </span>
                            </div>
                          </div>

                          {/* Location Detail */}
                          <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-500 font-medium">
                            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="truncate">{doctor.clinicName || "MedLink Healthcare Center"}</span>
                          </div>
                        </div>

                        {/* Booking CTA row */}
                        <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Consultation Fee</span>
                            <p className="text-xl font-black text-slate-900 leading-tight">
                              ₹{doctor.consultationFee}
                            </p>
                          </div>
                          
                          <Link to={`/doctors/${doctor._id}`} className="shrink-0">
                            <Button className="rounded-xl text-xs font-bold px-4 py-2.5 shadow-[0_4px_12px_rgba(0,82,204,0.15)] hover:shadow-[0_6px_20px_rgba(0,82,204,0.25)] hover:scale-[1.02] active:scale-[0.98]">
                              Book Appointment
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      <Footer />
    </div>
  )
}

export default DoctorList