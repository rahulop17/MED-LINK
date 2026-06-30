import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axiosInstance from "../utils/axiosInstance"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/common/Navbar"

// Reusable UI components
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Avatar } from "../components/ui/Avatar"

const commonSymptoms = [
  { text: "Headache and fever", emoji: "🤒" },
  { text: "Shortness of breath and chest tightness", emoji: "🫁" },
  { text: "Severe lower back pain", emoji: "🦴" },
  { text: "Fatigue, dry cough, and sore throat", emoji: "😫" },
]

function SymptomChecker() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [symptoms, setSymptoms] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  
  // Custom local state to fetch real matching doctors based on specialist recommendation
  const [recommendedDocs, setRecommendedDocs] = useState([])
  const [fetchingDocs, setFetchingDocs] = useState(false)
  const [rationaleExpanded, setRationaleExpanded] = useState(false)

  // Map urgency levels to premium color configurations and health score index
  const urgencyConfig = {
    low: {
      score: 15,
      severity: "Mild / Routine",
      colorClass: "from-emerald-500 to-teal-500",
      bgClass: "bg-emerald-50/70 border-emerald-200/50 text-emerald-800",
      glowClass: "shadow-[0_0_20px_rgba(16,185,129,0.1)]",
      progressBg: "stroke-emerald-100",
      progressColor: "stroke-emerald-500",
      dot: "bg-emerald-500",
      title: "Low Urgency",
      desc: "Monitor your symptoms and schedule a routine checkup if they persist."
    },
    medium: {
      score: 48,
      severity: "Moderate / Non-Emergency",
      colorClass: "from-amber-500 to-orange-500",
      bgClass: "bg-amber-50/70 border-amber-200/50 text-amber-900",
      glowClass: "shadow-[0_0_20px_rgba(245,158,11,0.1)]",
      progressBg: "stroke-amber-100",
      progressColor: "stroke-amber-500",
      dot: "bg-amber-500",
      title: "Moderate Urgency",
      desc: "It is recommended to seek medical advice soon to address these issues."
    },
    high: {
      score: 78,
      severity: "Severe / Urgent Case",
      colorClass: "from-orange-500 to-red-500",
      bgClass: "bg-orange-50/70 border-orange-200/50 text-orange-900",
      glowClass: "shadow-[0_0_25px_rgba(249,115,22,0.15)]",
      progressBg: "stroke-orange-100",
      progressColor: "stroke-orange-500",
      dot: "bg-orange-500",
      title: "High Urgency",
      desc: "Please consult with a specialist promptly to avoid further complications."
    },
    emergency: {
      score: 96,
      severity: "Critical Emergency",
      colorClass: "from-red-650 to-rose-650",
      bgClass: "bg-red-50/70 border-red-200/50 text-red-950",
      glowClass: "shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse",
      progressBg: "stroke-red-100",
      progressColor: "stroke-red-600",
      dot: "bg-red-500 animate-ping",
      title: "Critical / Emergency",
      desc: "Immediate clinical attention required. Visit an ER or contact emergency service."
    }
  }

  const handleCheck = async (e) => {
    e.preventDefault()

    if (!user) {
      navigate("/login")
      return
    }

    if (!symptoms.trim()) {
      setError("Please describe your symptoms")
      return
    }

    setError("")
    setLoading(true)
    setResult(null)
    setRecommendedDocs([])

    try {
      const response = await axiosInstance.post(
        "/ai/symptom-check",
        { symptoms },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      )
      
      const analysisData = response.data.data
      setResult(analysisData)
      
      // Fetch matching doctors from backend for the recommended specialist
      if (analysisData.specialist) {
        setFetchingDocs(true)
        try {
          const docResponse = await axiosInstance.get(
            `/doctors?specialization=${encodeURIComponent(analysisData.specialist)}`
          )
          setRecommendedDocs(docResponse.data.data.slice(0, 2))
        } catch (docErr) {
          console.log("Error fetching matching doctors:", docErr)
        } finally {
          setFetchingDocs(false)
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // Pre-fill symptom text when quick chip is clicked
  const handleQuickChip = (text) => {
    setSymptoms(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-slate-50/50 to-blue-50/30 flex flex-col font-sans antialiased">
      <Navbar />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-8 py-10 flex flex-col">
        
        {/* Page Title Header */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-forest/10 text-forest mb-3">
            ✨ Powered by Advanced Clinical AI
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
            Symptom Assessment Center
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm md:text-base max-w-2xl font-medium leading-relaxed">
            Provide a details of how you feel, and our AI will evaluate urgency indices and connect you directly with qualified medical consultants.
          </p>
        </div>

        {/* Dashboard Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1">
          
          {/* Left Panel: Symptoms Description Form (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col h-full">
            <Card className="flex flex-col h-full bg-white border-slate-200/60 p-6 sm:p-8 rounded-[28px] shadow-[0_10px_35px_rgba(0,82,204,0.02)] justify-between">
              
              {/* Header Box */}
              <div className="mb-6">
                <div className="flex items-center gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center text-lg shadow-sm">
                    🤖
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">MedLink AI Assistant</h3>
                    <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online & Analysing
                    </p>
                  </div>
                </div>
                
                <h4 className="text-slate-800 font-extrabold text-sm mb-2">Describe what you are experiencing</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Be as specific as possible (e.g. details of pain intensity, timeline, associated symptoms). Minimum 10 words.
                </p>
              </div>

              {/* Input Form */}
              <form onSubmit={handleCheck} className="flex-1 flex flex-col justify-between">
                <div>
                  {error && (
                    <div className="bg-rose-50 text-rose-700 border border-rose-100 text-xs font-bold p-3 rounded-xl mb-4 flex items-center gap-2">
                      <span>⚠️</span>
                      {error}
                    </div>
                  )}

                  <textarea
                    placeholder="Describe your current symptoms here..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-4 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-forest/40 focus:ring-1 focus:ring-forest/20 rounded-2xl focus:outline-none transition-all duration-200 text-sm font-medium text-slate-800 mb-5 resize-none leading-relaxed"
                  />

                  {/* Quick Symptoms Tags */}
                  <div className="mb-6">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-2">Common Quick Prompts</p>
                    <div className="flex flex-wrap gap-2">
                      {commonSymptoms.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuickChip(chip.text)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-150 text-slate-600 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 active:scale-95"
                        >
                          <span>{chip.emoji}</span>
                          <span>{chip.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 text-sm font-black shadow-lg shadow-forest/20 rounded-2xl hover:shadow-xl hover:shadow-forest/30 transition-all duration-200 flex items-center justify-center gap-2.5 uppercase tracking-wider"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>Analyzing Clinical Profiles...</span>
                    </>
                  ) : (
                    <>
                      <span>🔮</span>
                      <span>Initialize AI Diagnostics</span>
                    </>
                  )}
                </Button>
              </form>

            </Card>
          </div>

          {/* Right Panel: AI Diagnostic Report & Doctors (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col h-full">
            
            {/* Empty Awaiting Input State */}
            {!loading && !result && (
              <Card className="flex flex-col items-center justify-center p-10 text-center bg-white/50 backdrop-blur-md border border-slate-200/50 rounded-[28px] shadow-sm flex-1 h-full">
                <div className="w-20 h-20 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl mb-6 shadow-inner">
                  🔮
                </div>
                <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">Diagnostic Feed Awaiting</h3>
                <p className="text-slate-400 mt-2 max-w-xs text-xs font-semibold leading-relaxed">
                  Enter your physical parameters and symptoms on the left to start the instant clinical intelligence scan.
                </p>
              </Card>
            )}

            {/* Scanning State Loader */}
            {/* Scanning State Loader */}
            {loading && (
              <Card className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-[28px] border border-slate-200/60 shadow-xl flex-1 h-full justify-between relative overflow-hidden group">
                {/* Glowing scanner pulse background */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 to-transparent pointer-events-none" />
                
                {/* Moving scan bar */}
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-forest to-transparent opacity-60 animate-bounce top-1/4 pointer-events-none" />

                <div className="flex-1 flex flex-col items-center justify-center py-10">
                  <div className="relative w-28 h-28 flex items-center justify-center mb-8">
                    {/* Ring pulsations */}
                    <div className="absolute inset-0 rounded-full border-4 border-forest/10 animate-ping opacity-75" />
                    <div className="absolute inset-2 rounded-full border-2 border-forest/30 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-forest border-r-forest animate-spin" />
                    <span className="text-4xl">🧠</span>
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">Clinical Core Analyzing</h3>
                  <p className="text-slate-400 mt-2 max-w-xs text-xs font-semibold leading-relaxed">
                    Analyzing symptom density, severity descriptors, and matching with specialty clinical nodes...
                  </p>
                </div>
                
                {/* Micro Steps Indicator */}
                <div className="w-full bg-slate-50 p-4.5 rounded-2xl border border-slate-150 text-left space-y-3 mt-4">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-450">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
                      <span>Parsing vocabulary tokens...</span>
                    </div>
                    <span className="text-forest">OK</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-450">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
                      <span>Querying clinical directory...</span>
                    </div>
                    <span className="text-forest">ACTIVE</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Results State */}
            {!loading && result && (
              <div className="flex flex-col gap-6 flex-1">
                
                {/* Primary Diagnostics Card */}
                {(() => {
                  const config = urgencyConfig[result.urgency] || urgencyConfig.low
                  return (
                    <Card className={`bg-white border-slate-200/50 rounded-[28px] p-6 shadow-xl flex-col transition-all duration-300 relative overflow-hidden border ${config.glowClass}`}>
                      
                      {/* Subtle top banner background gradient */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${config.colorClass}`} />
                      
                      {/* Header metadata row */}
                      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5 text-left">
                        <div>
                          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">MedLink Intelligence</span>
                          <p className="text-xs text-slate-450 font-bold mt-0.5">Automated Clinical Analysis</p>
                        </div>
                        
                        {/* Glowing Urgency badge */}
                        <Badge className={`rounded-xl py-1 px-3 text-xs font-black shrink-0 ${config.bgClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0 mr-1.5`} />
                          {config.title}
                        </Badge>
                      </div>

                      {/* Health Score Gauge & Speciality Details Row */}
                      <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 text-left">
                        
                        {/* Circular Progress Gauge */}
                        <div className="shrink-0 flex items-center justify-center">
                          <div className="relative w-28 h-28 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                              {/* Inner circle track */}
                              <circle
                                cx="56"
                                cy="56"
                                r="46"
                                className="stroke-2 fill-none stroke-slate-100"
                              />
                              {/* Progress arc */}
                              <circle
                                cx="56"
                                cy="56"
                                r="46"
                                className={`stroke-[6] fill-none transition-all duration-1000 ${config.progressColor}`}
                                strokeDasharray={2 * Math.PI * 46}
                                strokeDashoffset={2 * Math.PI * 46 * (1 - config.score / 100)}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                              <span className="text-2xl font-black tracking-tight text-slate-800">
                                {config.score}
                              </span>
                              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Urgency Index</span>
                            </div>
                          </div>
                        </div>

                        {/* Specialist field details */}
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Recommended Consultant</span>
                          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5 truncate">{result.specialist}</h2>
                          
                          <div className="mt-2.5 flex flex-wrap gap-2 items-center">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-md">
                              Severity: {config.severity}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                            {config.desc}
                          </p>
                        </div>

                      </div>

                      {/* Diagnostic Report Cards */}
                      <div className="space-y-4 pt-5 border-t border-slate-100 text-left">
                        
                        {/* Clinical Rationale (Expandable) */}
                        <Card className="bg-slate-50 border-slate-200/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                          <button
                            type="button"
                            onClick={() => setRationaleExpanded(!rationaleExpanded)}
                            className="w-full flex items-center justify-between text-left focus:outline-none"
                          >
                            <div>
                              <p className="text-[9px] uppercase font-black tracking-widest text-slate-400">Clinical Rationale</p>
                              <p className="text-xs text-slate-700 font-extrabold mt-0.5">Why the AI reached this assessment</p>
                            </div>
                            <span className="text-slate-455 font-bold transition-transform duration-200">
                              {rationaleExpanded ? "▲" : "▼"}
                            </span>
                          </button>
                          
                          {rationaleExpanded && (
                            <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs text-slate-600 leading-relaxed font-semibold">
                              {result.reason}
                            </div>
                          )}
                        </Card>

                        {/* Suggested Next Steps */}
                        <Card className="bg-slate-50 border-slate-200/60 rounded-2xl p-4 shadow-sm">
                          <div>
                            <p className="text-[9px] uppercase font-black tracking-widest text-slate-400">Suggested Next Steps</p>
                            <p className="text-xs text-slate-800 font-extrabold mt-0.5 leading-snug">Immediate Action Plan</p>
                            <p className="text-xs text-slate-600 leading-relaxed font-semibold mt-2.5">
                              {result.advice}
                            </p>
                          </div>
                        </Card>

                        {/* Emergency Alert Protocol if high/emergency */}
                        {(result.urgency === "high" || result.urgency === "emergency") && (
                          <div className="bg-rose-50 border border-rose-200/60 rounded-2xl p-4 flex gap-3 shadow-sm">
                            <span className="text-xl shrink-0">🚨</span>
                            <div>
                              <h5 className="font-extrabold text-rose-800 text-xs">Emergency Alert Protocol</h5>
                              <p className="text-[11px] text-rose-600 font-semibold leading-relaxed mt-1">
                                Your symptom pattern indicates potential high clinical risk. Please do not wait. Call emergency services or get a ride to the ER.
                              </p>
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Primary CTA */}
                      <Link
                        to={`/doctors?specialization=${encodeURIComponent(result.specialist)}`}
                        className="block text-center w-full mt-6 bg-forest hover:bg-forest-light text-white text-xs font-black py-4 rounded-xl transition duration-150 shadow-md shadow-forest/15 hover:scale-[1.01] active:scale-[0.99] uppercase tracking-wider"
                      >
                        🔍 Consult {result.specialist}s Online Now
                      </Link>

                      <p className="text-[9px] text-slate-400 font-semibold text-center mt-3.5 leading-normal max-w-[285px] mx-auto">
                        AI recommendation framework, not a formal diagnosis. Consult a qualified professional.
                      </p>

                    </Card>
                  )
                })()}

                {/* Match Doctors Section */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest px-1">
                    Available specialists to consult
                  </h4>

                  {fetchingDocs ? (
                    <div className="bg-white border border-slate-200/50 p-6 rounded-2xl flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4.5 w-4.5 border-b-2 border-forest"></div>
                      <span className="text-xs font-bold text-slate-400">Matching nearest consultants...</span>
                    </div>
                  ) : recommendedDocs.length === 0 ? (
                    <div className="bg-white border border-slate-200/50 p-5 rounded-2xl text-center text-xs text-slate-400 font-semibold">
                      No doctors matching this speciality currently online.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recommendedDocs.map((doc) => (
                        <Card key={doc._id} className="p-4 border-slate-200/60 bg-white hover:border-forest/40 transition-all duration-300">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <Avatar src={doc.avatar} name={doc.name} size="md" />
                              <div className="min-w-0">
                                <h5 className="font-extrabold text-slate-800 text-sm truncate">
                                  Dr. {doc.name}
                                </h5>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate mt-0.5">
                                  {doc.experience} Years • {doc.city || "Clinic"}
                                </p>
                              </div>
                            </div>
                            
                            <div className="shrink-0 flex flex-col items-end gap-1.5">
                              <span className="text-xs font-black text-slate-800">₹{doc.consultationFee}</span>
                              <Link to={`/doctors/${doc._id}`}>
                                <Button size="sm" className="rounded-xl text-[10px] font-bold px-3 py-1.5">
                                  Book Consultation
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  )
}

export default SymptomChecker