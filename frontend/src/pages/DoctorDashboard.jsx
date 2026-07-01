import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import axiosInstance from "../utils/axiosInstance"
import { useAuth } from "../context/AuthContext"

// Reusable UI components
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Avatar } from "../components/ui/Avatar"

const { user, logout, updateUser } = useAuth()

function DoctorDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [activeTab, setActiveTab] = useState("appointments")
  const [appointments, setAppointments] = useState([])
  const [slots, setSlots] = useState([])
  const [newSlot, setNewSlot] = useState("")
  const [posts, setPosts] = useState([])
  const [newPostContent, setNewPostContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [avatar, setAvatar] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [profile, setProfile] = useState(null)
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    specialization: "",
    experience: "",
    clinicName: "",
    city: "",
    consultationFee: "",
    bio: "",
  })

  useEffect(() => {
    if (!user || user.role !== "doctor") {
      navigate("/login")
      return
    }
    fetchAppointments()
    fetchProfile()
    fetchMyPosts()
  }, [user])

  const fetchAppointments = async () => {
    try {
      const response = await axiosInstance.get("/appointments/doctor", {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      })
      setAppointments(response.data.data)
    } catch (error) {
      console.log("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get(`/doctors/${user._id}`)
      const docData = response.data.data
      setProfile(docData)
      setSlots(docData.availableSlots || [])
      setAvatar(docData.avatar || null)
      setProfileForm({
        name: docData.name || "",
        phone: docData.phone || "",
        specialization: docData.specialization || "",
        experience: docData.experience || "",
        clinicName: docData.clinicName || "",
        city: docData.city || "",
        consultationFee: docData.consultationFee || "",
        bio: docData.bio || "",
      })
    } catch (error) {
      console.log("Error:", error)
    }
  }

  

// handleUpdateProfile mein success ke baad ye line add karo
const handleUpdateProfile = async (e) => {
  e.preventDefault()
  setMessage("")
  try {
    const response = await axiosInstance.patch(
      "/doctors/profile/update",
      profileForm,
      { headers: { Authorization: `Bearer ${user.accessToken}` } }
    )
    const updatedData = response.data.data
    setProfile(updatedData)
    
    // Context + localStorage dono update karo
    updateUser({ name: updatedData.name })
    
    setMessage("Profile details updated successfully!")
  } catch (error) {
    setMessage("Failed to update profile details")
  }
}

  const fetchMyPosts = async () => {
    try {
      const response = await axiosInstance.get(`/posts/doctor/${user._id}`)
      setPosts(response.data.data)
    } catch (error) {
      console.log("Error:", error)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append("avatar", file)

    try {
      const response = await axiosInstance.patch(
        "/doctors/profile/update",
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )
      setAvatar(response.data.data.avatar)
      setMessage("Profile photo updated successfully!")
    } catch (error) {
      setMessage("Failed to upload photo")
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await axiosInstance.patch(
        `/appointments/${appointmentId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      )
      fetchAppointments()
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update")
    }
  }

  const handleAddSlot = async () => {
    if (!newSlot.trim()) return
    const updatedSlots = [...slots, newSlot.trim()]
    try {
      await axiosInstance.patch(
        "/doctors/slots/add",
        { slots: updatedSlots },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      )
      setSlots(updatedSlots)
      setNewSlot("")
      setMessage("Slot added successfully!")
    } catch (error) {
      setMessage("Failed to add slot")
    }
  }

  const handleRemoveSlot = async (slotToRemove) => {
    const updatedSlots = slots.filter((s) => s !== slotToRemove)
    try {
      await axiosInstance.patch(
        "/doctors/slots/add",
        { slots: updatedSlots },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      )
      setSlots(updatedSlots)
    } catch (error) {
      setMessage("Failed to remove slot")
    }
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return
    try {
      await axiosInstance.post(
        "/posts",
        { content: newPostContent },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      )
      setNewPostContent("")
      fetchMyPosts()
      setMessage("Insight published successfully!")
    } catch (error) {
      setMessage("Failed to publish post")
    }
  }

  const handleDeletePost = async (postId) => {
    try {
      await axiosInstance.delete(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      })
      fetchMyPosts()
    } catch (error) {
      console.log("Error:", error)
    }
  }

  const statusStyles = {
    pending: "bg-amber-50 text-amber-800 border border-amber-100",
    confirmed: "bg-blue-50 text-forest border border-blue-100",
    completed: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    cancelled: "bg-rose-50 text-rose-700 border border-rose-100",
  }

  // Calculate actual dynamic stats from appointments data
  const totalPatients = new Set(appointments.map(a => a.patient?._id)).size
  const pendingRequests = appointments.filter(a => a.status === "pending").length
  const confirmedSchedule = appointments.filter(a => a.status === "confirmed")
  
  // Total Revenue calculation based on paid completed/confirmed bookings
  const revenueTotal = appointments
    .filter(a => a.isPaid && a.status !== "cancelled")
    .reduce((sum, a) => sum + (profile?.consultationFee || user?.consultationFee || 150), 0)

  const sideMenu = [
    { id: "appointments", label: "Dashboard", icon: "📊" },
    { id: "slots", label: "Schedule Slots", icon: "🗓️" },
    { id: "posts", label: "Medical Insights", icon: "✍️" },
    { id: "profile", label: "Clinic Profile", icon: "⚙️" },
  ]

  return (
    <div className="min-h-screen bg-slate-50/50 flex font-sans antialiased">
      
      {/* 1. Left Sidebar Navigation */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-950 text-white shrink-0 hidden md:flex flex-col justify-between p-6 border-r border-slate-800/85 sticky top-0 h-screen shadow-xl">
        <div>
          {/* Logo brand */}
          <Link to="/" className="flex items-center gap-3 mb-8 px-1">
            <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center text-white text-lg shadow-[0_4px_15px_rgba(0,82,204,0.3)]">
              🩺
            </div>
            <span className="text-xl font-black text-white tracking-tight">MedLink</span>
          </Link>

          {/* Practitioner Profile Widget (Glassmorphic) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 text-center flex flex-col items-center backdrop-blur-md shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-forest/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            <div className="relative mb-3">
              <Avatar
                src={avatar}
                name={user?.name}
                size="lg"
                className="border-2 border-slate-700 shadow-md rounded-2xl w-14 h-14"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-forest hover:bg-forest-light text-white rounded-full flex items-center justify-center text-xs shadow-md transition-all duration-200 hover:scale-105 active:scale-90"
                title="Update photo"
              >
                ＋
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <h4 className="font-extrabold text-slate-100 text-sm truncate w-full">Dr. {user?.name}</h4>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1 truncate w-full">
              {profile?.specialization || user?.specialization || "Clinical Consultant"}
            </p>
          </div>

          {/* Nav items */}
          <nav className="space-y-1.5">
            {sideMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-[1.01] ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-forest to-blue-600/90 text-white shadow-lg shadow-forest/20 scale-[1.02] border border-blue-400/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Support & Logout Section */}
        <div className="space-y-3">
          <Link
            to="/feed"
            className="block text-center w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-black uppercase tracking-wider text-slate-350 rounded-xl transition duration-150 active:scale-95"
          >
            Public Community
          </Link>
          <button
            onClick={logout}
            className="w-full py-3 bg-rose-950/20 hover:bg-rose-900/30 text-[10px] font-black uppercase tracking-wider text-rose-300 rounded-xl transition border border-rose-900/30 active:scale-95"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Main Dashboard Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-8 py-5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Clinical Workspace</h1>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Welcome back, your schedule metrics and patients are active.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Mobile Log-out Trigger */}
            <button
              onClick={logout}
              className="md:hidden text-xs bg-rose-50 text-rose-600 px-3.5 py-2 rounded-xl font-bold transition active:scale-95"
            >
              Logout
            </button>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Verified Portal</span>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="p-8 max-w-6xl w-full mx-auto space-y-8">
          
          {message && (
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold p-3.5 rounded-xl shadow-sm flex items-center gap-2">
              <span>✅</span>
              {message}
            </div>
          )}

          {/* 3. Analytics KPI row */}
          {activeTab === "appointments" && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              
              <Card className="border-slate-200/40 bg-gradient-to-b from-white to-slate-50/50 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_15px_40px_rgba(0,82,204,0.03)] hover:scale-[1.01] transition-all duration-300">
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-xl bg-forest/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <Badge variant="success" className="py-0.5 px-2 text-[8px] font-black rounded-lg">+12%</Badge>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Total Patients</span>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">{totalPatients || appointments.length}</h3>
                    </div>
                    
                    {/* Weekly trend sparkline chart mock */}
                    <svg className="w-16 h-8 text-emerald-500 shrink-0" viewBox="0 0 100 30" fill="none">
                      <path d="M0 25 C 20 20, 40 10, 60 15, 80 5, 100 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200/40 bg-gradient-to-b from-white to-slate-50/50 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_15px_40px_rgba(0,82,204,0.03)] hover:scale-[1.01] transition-all duration-300">
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                      </svg>
                    </div>
                    <Badge variant="success" className="py-0.5 px-2 text-[8px] font-black rounded-lg">+8%</Badge>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Revenue (MTD)</span>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">₹{revenueTotal.toLocaleString()}</h3>
                    </div>
                    
                    {/* Weekly trend sparkline chart mock */}
                    <svg className="w-16 h-8 text-emerald-400 shrink-0" viewBox="0 0 100 30" fill="none">
                      <path d="M0 28 C 20 22, 40 18, 60 10, 80 8, 100 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200/40 bg-gradient-to-b from-white to-slate-50/50 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_15px_40px_rgba(0,82,204,0.03)] hover:scale-[1.01] transition-all duration-300">
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 01-18 0z" />
                      </svg>
                    </div>
                    <Badge variant="danger" className="py-0.5 px-2 text-[8px] font-black rounded-lg">Action</Badge>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Pending Bookings</span>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">{pendingRequests}</h3>
                    </div>
                    
                    {/* Weekly trend sparkline chart mock */}
                    <svg className="w-16 h-8 text-amber-400 shrink-0" viewBox="0 0 100 30" fill="none">
                      <path d="M0 15 C 20 18, 40 10, 60 20, 80 12, 100 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200/40 bg-gradient-to-b from-white to-slate-50/50 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_15px_40px_rgba(0,82,204,0.03)] hover:scale-[1.01] transition-all duration-300">
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.252.583 1.833l-3.978 2.892a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.892a1 1 0 00-1.17 0l-3.976 2.892c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 8.72c-.783-.58-.38-1.833.582-1.833h4.908a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <Badge variant="info" className="py-0.5 px-2 text-[8px] font-black rounded-lg">Top 5%</Badge>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Satisfaction</span>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">4.9/5</h3>
                    </div>
                    
                    {/* Weekly trend sparkline chart mock */}
                    <svg className="w-16 h-8 text-blue-500 shrink-0" viewBox="0 0 100 30" fill="none">
                      <path d="M0 5 C 20 2, 40 8, 60 3, 80 6, 100 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </CardContent>
              </Card>

            </div>
          )}

          {/* 4. Appointments Tab: Split Layout for Schedule & Pending */}
          {activeTab === "appointments" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Col: Today's Schedule Timeline (8 Cols) */}
              <div className="lg:col-span-8 space-y-6">
                <Card className="bg-white border-slate-200/50 rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
                  
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm">Today's Schedule</h3>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Chronological active consultations</p>
                    </div>
                    <div className="flex bg-slate-100 rounded-xl p-1 shrink-0 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <span className="bg-white text-forest px-3 py-1 rounded-lg shadow-sm">Timeline</span>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
                    </div>
                  ) : confirmedSchedule.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                      <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-450 mb-4 shadow-inner">
                        <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-sm">All Caught Up!</h4>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 max-w-[240px] leading-relaxed">
                        No confirmed consultations scheduled for today.
                      </p>
                      <button
                        onClick={() => setActiveTab("slots")}
                        className="mt-5 px-4.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-forest text-[11px] font-black rounded-xl transition duration-150 active:scale-95 uppercase tracking-wider"
                      >
                        Open Slots Manager
                      </button>
                    </div>
                  ) : (
                    <div className="relative pl-6 border-l border-slate-200 space-y-6">
                      {confirmedSchedule.map((appt) => (
                        <div key={appt._id} className="relative group">
                          
                          {/* Dot accent indicator on the timeline line */}
                          <span className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full border-4 border-white bg-forest shadow-sm shrink-0" />
                          
                          {/* Card details */}
                          <div className="bg-slate-50/40 hover:bg-slate-50 border border-slate-150 p-5 rounded-2xl transition duration-200 hover:shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                            
                            <div className="space-y-2 flex-1 min-w-0">
                              
                              <div className="flex items-center gap-3.5">
                                <span className="text-xs font-black text-forest bg-blue-50/70 px-2.5 py-1 rounded-lg shrink-0">
                                  {appt.slot}
                                </span>
                                <h4 className="font-extrabold text-slate-800 text-sm truncate">
                                  {appt.patient?.name}
                                </h4>
                                <Badge className={`py-0 px-2 text-[9px] font-bold shrink-0 ${statusStyles[appt.status]}`}>
                                  {appt.status}
                                </Badge>
                              </div>

                              {appt.symptoms && (
                                <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2">
                                  {appt.symptoms}
                                </p>
                              )}

                              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                <span>📱 {appt.patient?.phone || "No contact"}</span>
                                <span>•</span>
                                <span className={appt.isPaid ? "text-emerald-600" : "text-amber-600"}>
                                  {appt.isPaid ? "Paid" : "Payment Pending"}
                                </span>
                              </div>

                            </div>

                            {/* Actions block */}
                            <div className="shrink-0 flex gap-2">
                              {appt.status === "confirmed" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(appt._id, "completed")}
                                  className="rounded-xl text-[10px] font-bold px-3 py-2"
                                >
                                  Complete Visit
                                </Button>
                              )}
                              {appt.status !== "completed" && appt.status !== "cancelled" && (
                                <button
                                  onClick={() => handleStatusUpdate(appt._id, "cancelled")}
                                  className="px-3 py-2 border border-rose-200 text-rose-700 text-[10px] font-black rounded-xl hover:bg-rose-50 transition active:scale-95 uppercase tracking-wider"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>

                          </div>

                        </div>
                      ))}
                    </div>
                  )}

                </Card>
              </div>

              {/* Right Col: Pending Requests Panel & Earnings (4 Cols) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Pending requests card */}
                <Card className="bg-white border-slate-200/50 rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
                  <div className="pb-4 border-b border-slate-100 mb-5">
                    <h3 className="font-extrabold text-slate-800 text-sm">Pending Bookings</h3>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Awaiting schedule slot confirmations</p>
                  </div>

                  {appointments.filter(a => a.status === "pending").length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-450 mb-3 shadow-inner">
                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414a1 1 0 00-.707-.293H4" />
                        </svg>
                      </div>
                      <h4 className="font-extrabold text-slate-700 text-xs">Inbox Clean</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                        No new booking requests
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {appointments
                        .filter(a => a.status === "pending")
                        .map((appt) => (
                          <div key={appt._id} className="bg-slate-50/40 p-4 border border-slate-150 rounded-2xl flex flex-col justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <Avatar src={appt.patient?.avatar} name={appt.patient?.name} size="sm" className="rounded-lg w-9 h-9" />
                              <div className="min-w-0">
                                <h4 className="font-extrabold text-slate-800 text-xs truncate">{appt.patient?.name}</h4>
                                <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mt-0.5">
                                  Requested: {appt.slot}
                                </p>
                              </div>
                            </div>

                            {appt.symptoms && (
                              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold italic bg-white p-2.5 rounded-xl border border-slate-150/70 truncate">
                                "{appt.symptoms}"
                              </p>
                            )}

                            <div className="flex items-center justify-between gap-2 border-t border-slate-100/80 pt-2.5 mt-1">
                              <span className="text-[9px] uppercase font-bold text-slate-450 font-extrabold">
                                {appt.isPaid ? "Paid" : "Unpaid"}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleStatusUpdate(appt._id, "confirmed")}
                                  className="p-1.5 bg-forest hover:bg-forest-light text-white rounded-lg text-xs font-bold transition-all duration-150 active:scale-90"
                                  title="Approve & Confirm"
                                >
                                  ✓ Confirm
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(appt._id, "cancelled")}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all duration-150 active:scale-90"
                                  title="Decline request"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                </Card>

                {/* Practice settings card (Stripe style) */}
                <Card className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 border border-slate-800 text-white rounded-[28px] p-6 shadow-xl relative overflow-hidden">
                  
                  {/* Backdrop graphic */}
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none text-9xl">
                    🩺
                  </div>
                  
                  <div className="pb-4 border-b border-white/10 mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-white text-sm">Practice Details</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Consultation metrics</p>
                    </div>
                    
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live
                    </span>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Default Consultation Fee</span>
                      <div className="flex items-center mt-1">
                        <p className="text-3xl font-black text-white tracking-tight leading-none">
                          ₹{profile?.consultationFee || user?.consultationFee || 150}
                        </p>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ml-2.5 shadow-sm">
                          Per Session
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-white/10 text-xs leading-relaxed space-y-3">
                      <div className="flex items-center justify-between text-slate-400 font-semibold">
                        <span>Clinic Name:</span>
                        <span className="text-white font-extrabold truncate max-w-[150px]">{profile?.clinicName || user?.clinicName || "MedLink Healthcare"}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 font-semibold">
                        <span>Location:</span>
                        <span className="text-white font-extrabold">{profile?.city || user?.city || "Primary Center"}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 font-semibold">
                        <span>Active Slots:</span>
                        <span className="text-white font-extrabold bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg text-[10px]">{slots.length} open</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setActiveTab("profile")}
                        className="py-2.5 bg-slate-800 hover:bg-slate-750 text-white border border-slate-700/80 rounded-xl text-[10px] font-black uppercase tracking-wider transition active:scale-95 text-center"
                      >
                        Clinic Setup
                      </button>
                      <button
                        onClick={() => setActiveTab("slots")}
                        className="py-2.5 bg-forest hover:bg-forest-light text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition active:scale-95 text-center shadow-md shadow-forest/10"
                      >
                        Manage Slots
                      </button>
                    </div>
                  </div>
                </Card>
 
               </div>
 
             </div>
           )}

          {/* Slots Manager Tab */}
          {activeTab === "slots" && (
            <Card className="bg-white border-slate-200/60 rounded-[28px] p-6 sm:p-8 shadow-sm">
              <div className="pb-4 border-b border-slate-100 mb-6">
                <h3 className="font-extrabold text-slate-800 text-sm">Availability Slot Manager</h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Add or remove clinical time bookings open for patients</p>
              </div>

              <div className="flex gap-3 mb-8 bg-slate-50 p-4 border border-slate-150 rounded-2xl max-w-xl">
                <input
                  type="text"
                  placeholder="e.g. Mon 10:00 AM, Wed 02:00 PM..."
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  className="flex-1 px-4 py-3.5 bg-white border border-slate-200 focus:border-forest/55 focus:ring-1 focus:ring-forest/20 rounded-xl focus:outline-none transition-all text-xs font-semibold text-slate-800"
                />
                <Button
                  onClick={handleAddSlot}
                  className="px-5 shrink-0 rounded-xl text-xs font-bold"
                >
                  ＋ Add Slot
                </Button>
              </div>

              <div>
                <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-3">Currently Published Slots</h4>
                
                {slots.length === 0 ? (
                  <p className="text-slate-400 text-xs font-semibold italic">No slots published. Patients cannot book consultations.</p>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {slots.map((slot) => (
                      <Badge
                        key={slot}
                        variant="forest"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50/70 border-blue-100 rounded-xl text-xs font-bold"
                      >
                        <span>{slot}</span>
                        <button
                          onClick={() => handleRemoveSlot(slot)}
                          className="text-forest/60 hover:text-rose-600 transition-colors shrink-0 text-sm leading-none ml-1"
                          title="Remove slot"
                        >
                          ✕
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Posts Insights Tab */}
          {activeTab === "posts" && (
            <div className="space-y-6">
              
              {/* Publisher box */}
              <Card className="bg-white border-slate-200/60 rounded-[28px] p-6 shadow-sm">
                <div className="pb-4 border-b border-slate-100 mb-5">
                  <h3 className="font-extrabold text-slate-800 text-sm">Write Medical Update</h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Publish clinical insights, updates, and wellness tips for patients</p>
                </div>

                <textarea
                  placeholder="Share a medical insight or health update with the MedLink network..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-forest/40 focus:ring-1 focus:ring-forest/20 rounded-2xl focus:outline-none transition-all duration-200 text-xs font-semibold text-slate-800 mb-4 resize-none leading-relaxed"
                />
                
                <Button
                  onClick={handleCreatePost}
                  className="rounded-xl text-xs font-bold px-6 py-2.5 shadow"
                >
                  Publish Insight
                </Button>
              </Card>

              {/* Feed list */}
              <div className="space-y-4">
                <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-wider px-1">Your Published Insights ({posts.length})</h4>
                
                {posts.length === 0 ? (
                  <div className="text-center py-10 bg-white/50 rounded-[28px] border border-slate-200/50 text-slate-400 text-xs font-semibold">
                    No insights published yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.map((post) => (
                      <Card key={post._id} className="bg-white border-slate-200/60 rounded-2xl p-5 hover:border-forest/40 transition duration-300 flex flex-col justify-between">
                        <div>
                          <p className="text-slate-700 text-xs font-medium leading-relaxed whitespace-pre-line mb-4">
                            {post.content}
                          </p>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                          <span>❤️ {post.likes?.length || 0} Likes</span>
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="text-rose-600 hover:text-rose-700 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

            {/* Profile Clinic settings Tab */}
            {activeTab === "profile" && (
              <Card className="bg-white border-slate-200/50 rounded-[28px] p-6 sm:p-8 shadow-sm space-y-8">
              <div className="pb-4 border-b border-slate-100 mb-6">
                <h3 className="font-extrabold text-slate-800 text-sm">Professional Profile Settings</h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Manage your credentials, bio, and clinic portrait</p>
              </div>

              {/* Avatar Uploader */}
              <div className="flex flex-col sm:flex-row items-center gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-150">
                <div className="relative shrink-0">
                  <Avatar
                    src={avatar}
                    name={user?.name}
                    size="xl"
                    className="border-2 border-white shadow-md bg-white rounded-2xl w-24 h-24"
                  />
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-forest hover:bg-forest-light text-white rounded-full flex items-center justify-center text-sm shadow-md transition"
                    title="Change picture"
                  >
                    ＋
                  </button>
                </div>
                
                <div className="text-center sm:text-left space-y-1">
                  <h4 className="font-extrabold text-slate-850 text-base">Clinical Profile Picture</h4>
                  <p className="text-xs text-slate-455 font-semibold leading-relaxed">
                    Upload a high-resolution professional medical headshot. Supported formats: JPG, PNG.
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-2">
                    {uploadingPhoto ? "⏳ Photo Uploading, please wait..." : "Ready to upload"}
                  </p>
                </div>
              </div>

              {/* Profile Editor Fields Form */}
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider block mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-forest/40 focus:ring-1 focus:ring-forest/20 rounded-xl focus:outline-none transition-all text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-455 uppercase tracking-wider block mb-2">Contact Phone</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-forest/40 focus:ring-1 focus:ring-forest/20 rounded-xl focus:outline-none transition-all text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-455 uppercase tracking-wider block mb-2">Specialization</label>
                    <input
                      type="text"
                      value={profileForm.specialization}
                      onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-forest/40 focus:ring-1 focus:ring-forest/20 rounded-xl focus:outline-none transition-all text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-455 uppercase tracking-wider block mb-2">Years of Experience</label>
                    <input
                      type="number"
                      value={profileForm.experience}
                      onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-forest/40 focus:ring-1 focus:ring-forest/20 rounded-xl focus:outline-none transition-all text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-455 uppercase tracking-wider block mb-2">Clinic Name</label>
                    <input
                      type="text"
                      value={profileForm.clinicName}
                      onChange={(e) => setProfileForm({ ...profileForm, clinicName: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-forest/40 focus:ring-1 focus:ring-forest/20 rounded-xl focus:outline-none transition-all text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-455 uppercase tracking-wider block mb-2">City Location</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-forest/40 focus:ring-1 focus:ring-forest/20 rounded-xl focus:outline-none transition-all text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-455 uppercase tracking-wider block mb-2">Consultation Fee (₹)</label>
                    <input
                      type="number"
                      value={profileForm.consultationFee}
                      onChange={(e) => setProfileForm({ ...profileForm, consultationFee: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-forest/40 focus:ring-1 focus:ring-forest/20 rounded-xl focus:outline-none transition-all text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-455 uppercase tracking-wider block mb-2">Professional Biography</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-forest/40 focus:ring-1 focus:ring-forest/20 rounded-xl focus:outline-none transition-all text-xs font-semibold text-slate-800 resize-none leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button type="submit" className="rounded-xl px-6 text-xs font-black shadow-md shadow-forest/15">
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

        </div>

      </main>

    </div>
  )
}

export default DoctorDashboard
