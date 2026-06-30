import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import axiosInstance from "../utils/axiosInstance"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/common/Navbar"

// Reusable UI components
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Avatar } from "../components/ui/Avatar"

function DoctorProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [doctor, setDoctor] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [booking, setBooking] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await axiosInstance.get(`/doctors/${id}`)
        setDoctor(response.data.data)
      } catch (error) {
        console.log("Error fetching doctor:", error)
      } finally {
        setLoading(false)
      }
    }

    const fetchDoctorPosts = async () => {
      try {
        const response = await axiosInstance.get(`/posts/doctor/${id}`)
        setPosts(response.data.data)
      } catch (error) {
        console.log("Error fetching posts:", error)
      }
    }

    fetchDoctor()
    fetchDoctorPosts()
  }, [id])

  const handleBooking = async () => {
    if (!user) {
      navigate("/login")
      return
    }

    if (!selectedSlot) {
      setMessage("Please select a slot")
      return
    }

    setBooking(true)
    setMessage("")

    try {
      await axiosInstance.post(
        "/appointments",
        { doctorId: id, slot: selectedSlot, symptoms },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      )
      setMessage("Appointment booked. Check your appointments page to pay and confirm.")
      setSelectedSlot("")
      setSymptoms("")
    } catch (error) {
      setMessage(error.response?.data?.message || "Booking failed")
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest"></div>
          <p className="text-slate-400 text-xs font-bold mt-4 tracking-wider uppercase">Loading clinical profile...</p>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-2xl mb-4">🩺</div>
          <h3 className="font-extrabold text-slate-800 text-lg">Practitioner Profile Not Found</h3>
          <p className="text-slate-400 text-xs mt-1.5 font-bold">This link might have expired or the doctor profile is inactive.</p>
          <Link to="/doctors" className="mt-5">
            <Button size="sm" variant="outline" className="rounded-xl text-xs font-black">← Back to marketplace</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Deterministic mock variables for premium clinical UI feel
  const mockRating = ((id.charCodeAt(0) % 5) / 10 + 4.5).toFixed(1)
  const mockReviewsCount = (id.charCodeAt(1) % 120 + 38)

  const mockQualifications = [
    "MBBS, MD - General Medicine",
    "Fellowship in Advanced Clinical Therapeutics",
    "Board Certified Clinical Practitioner",
  ]

  const mockReviewsList = [
    { name: "Amit Sharma", rating: 5, date: "1 week ago", text: `Dr. ${doctor.name} is extremely patient. Listened to my symptoms and explained the diagnostic parameters in plain terms. Highly recommend!` },
    { name: "Priya Patel", rating: 4, date: "3 weeks ago", text: "Very professional consultation. The clinic team was organized, and the waiting queue was minimal. Bookings flow was very smooth." }
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased">
      <Navbar />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-8 py-10">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center gap-2.5 text-xs font-semibold text-slate-400 uppercase tracking-widest text-left">
          <Link to="/doctors" className="hover:text-forest transition">Marketplace</Link>
          <span className="text-slate-350">/</span>
          <span className="text-slate-500">Dr. {doctor.name}</span>
        </div>

        {/* Two Column Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: Hero, Bio, Certifications, Reviews, Posts (8 Cols) */}
          <div className="lg:col-span-8 space-y-6 text-left">
            
            {/* Large Doctor Hero Card */}
            <Card className="bg-white border-slate-200/50 rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgb(0,82,204,0.02)]">
              {/* Backing gradient banner */}
              <div className="h-32 bg-gradient-to-r from-forest to-blue-600/90 relative" />
              
              <CardContent className="p-6 sm:p-8 -mt-14 relative">
                <div className="flex flex-col sm:flex-row sm:items-end gap-5 mb-6">
                  <Avatar
                    src={doctor.avatar}
                    name={doctor.name}
                    size="xl"
                    className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-white shadow-md bg-white rounded-3xl shrink-0"
                  />
                  
                  <div className="min-w-0 pb-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                        Dr. {doctor.name}
                      </h1>
                      <Badge variant="success" className="text-[9px] font-black rounded-lg py-0.5 px-2">Verified Expert</Badge>
                    </div>
                    
                    <p className="text-xs text-forest font-bold mt-2 uppercase tracking-wide">
                      {doctor.specialization}
                    </p>
                    
                    <div className="flex items-center gap-2.5 mt-3 text-xs text-slate-500 font-semibold">
                      <span className="text-amber-500 font-extrabold flex items-center gap-0.5">★ {mockRating}</span>
                      <span className="text-slate-300">•</span>
                      <span>{mockReviewsCount} Patient Ratings</span>
                    </div>
                  </div>
                </div>

                {/* KPI stats bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 mt-6 text-xs font-semibold text-slate-600">
                  <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Experience</span>
                    <p className="font-extrabold text-slate-800 text-sm mt-1">{doctor.experience} Years</p>
                  </div>
                  <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Consultation Fee</span>
                    <p className="font-extrabold text-slate-800 text-sm mt-1">₹{doctor.consultationFee}</p>
                  </div>
                  <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Location</span>
                    <p className="font-extrabold text-slate-800 text-sm mt-1 truncate">{doctor.city || "Primary Center"}</p>
                  </div>
                  <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Clinic Name</span>
                    <p className="font-extrabold text-slate-800 text-sm mt-1 truncate">{doctor.clinicName || "MedLink Clinic"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About / Clinical Biography */}
            <Card className="bg-white border-slate-200/50 rounded-[24px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,82,204,0.02)]">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-widest pb-3.5 border-b border-slate-100 mb-5">
                Clinical Biography
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed font-semibold">
                {doctor.bio || `Dr. ${doctor.name} is a dedicated healthcare specialist committed to providing world-class diagnostics and treatment paths. With a strong track record of advanced clinical therapies, Dr. ${doctor.name} ensures all patient diagnostics are delivered with clinical accuracy and comprehensive care coordination.`}
              </p>
            </Card>

            {/* Qualifications & Certifications */}
            <Card className="bg-white border-slate-200/50 rounded-[24px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,82,204,0.02)]">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-widest pb-3.5 border-b border-slate-100 mb-5">
                Qualifications & Credentials
              </h3>
              <ul className="space-y-3.5 text-xs text-slate-600 font-semibold">
                {mockQualifications.map((q, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-forest shrink-0" />
                    <span>{q}</span>
                  </li>
                ))}
                {doctor.mciNumber && (
                  <li className="flex items-center gap-3 pt-3 border-t border-slate-100 mt-3 text-slate-450 text-[11px]">
                    <span>MCI Registry Registration ID:</span>
                    <span className="font-black text-slate-700">{doctor.mciNumber}</span>
                  </li>
                )}
              </ul>
            </Card>

            {/* Medical Insights Publisher Posts */}
            {posts.length > 0 && (
              <div className="space-y-5">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-widest">
                  Insights Published by Dr. {doctor.name}
                </h3>
                
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card key={post._id} className="bg-white border-slate-200/50 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,82,204,0.02)]">
                      <p className="text-slate-700 text-xs font-semibold leading-relaxed whitespace-pre-line mb-4">
                        {post.content}
                      </p>
                      
                      {post.image && (
                        <div className="rounded-xl overflow-hidden border border-slate-100 max-h-72 bg-slate-50 mb-3">
                          <img
                            src={post.image}
                            alt="insight overview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span>❤️ {post.likes?.length || 0} likes</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <Card className="bg-white border-slate-200/50 rounded-[24px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,82,204,0.02)]">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-widest pb-3.5 border-b border-slate-100 mb-5">
                Patient Reviews
              </h3>
              
              <div className="space-y-6">
                {mockReviewsList.map((rev, idx) => (
                  <div key={idx} className="pb-5 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar name={rev.name} size="sm" className="rounded-lg w-7 h-7" />
                        <h5 className="font-extrabold text-slate-800 text-xs">{rev.name}</h5>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">{rev.date}</span>
                    </div>
                    
                    <div className="text-amber-500 text-xs mb-2">
                      {"★".repeat(rev.rating)}
                    </div>
                    
                    <p className="text-slate-650 text-xs leading-relaxed font-medium">
                      {rev.text}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          {/* RIGHT SIDEBAR: Sticky Booking Widget (4 Cols) */}
          <div className="lg:col-span-4 sticky top-24">
            
            <Card className="bg-white border-slate-200/50 rounded-[28px] p-6 shadow-[0_12px_40px_rgba(0,82,204,0.04)] text-left">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-widest pb-3 border-b border-slate-100 mb-5">
                Book A Consultation
              </h3>

              {message && (
                <div
                  className={`text-xs p-3.5 font-bold rounded-xl mb-5 leading-relaxed ${
                    message.includes("booked")
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-rose-50 text-rose-700 border border-rose-100"
                  }`}
                >
                  {message}
                </div>
              )}

              {doctor.availableSlots?.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                  <p>No slots open right now.</p>
                  <p className="text-[10px] mt-1 text-slate-400 font-bold uppercase tracking-wider">Please check back later</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">1. Choose availability slot</span>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {doctor.availableSlots?.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all duration-150 ${
                            selectedSlot === slot
                              ? "bg-forest border-forest text-white shadow-sm"
                              : "border-slate-200 text-slate-600 hover:border-forest/40 hover:bg-slate-50/50"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">2. Patient Notes (Optional)</span>
                    <textarea
                      placeholder="List any symptoms, current medications, or consultation goals..."
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-forest/40 focus:ring-1 focus:ring-forest/20 rounded-xl focus:outline-none transition-all text-xs font-semibold text-slate-800 resize-none p-3.5 leading-relaxed mt-2.5"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">Total Consultation rate:</span>
                    <span className="text-slate-900 font-black text-sm">₹{doctor.consultationFee}</span>
                  </div>

                  <Button
                    onClick={handleBooking}
                    disabled={booking}
                    className="w-full rounded-xl py-3 text-xs font-black shadow-md shadow-forest/15"
                  >
                    {booking ? "Booking Appointment..." : `Request Visit (₹${doctor.consultationFee})`}
                  </Button>
                  
                  <p className="text-[9px] text-center text-slate-400 font-semibold leading-relaxed">
                    By requesting, you agree to complete the payment after approval to confirm the visit time.
                  </p>
                </div>
              )}
            </Card>

          </div>

        </div>

      </div>
    </div>
  )
}

export default DoctorProfile