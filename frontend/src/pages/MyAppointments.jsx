import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axiosInstance from "../utils/axiosInstance"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/common/Navbar"

// Reusable UI components
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Avatar } from "../components/ui/Avatar"

function MyAppointments() {
  const { user, logout } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState(null)
  
  // Custom states for search, filters, and support info modals
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all") // "all", "upcoming", "past"
  const [infoModal, setInfoModal] = useState({ open: false, title: "", message: "" })

  const fetchAppointments = async () => {
    try {
      const response = await axiosInstance.get("/appointments/my", {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      })
      setAppointments(response.data.data)
    } catch (error) {
      console.log("Error fetching appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchAppointments()
  }, [user])

  const statusConfig = {
    pending: {
      badge: "bg-amber-50 text-amber-800 border border-amber-200/50",
      dot: "bg-amber-500",
      label: "Awaiting Confirmation",
    },
    confirmed: {
      badge: "bg-emerald-50 text-emerald-700 border border-emerald-200/50",
      dot: "bg-emerald-500",
      label: "Confirmed Visit",
    },
    completed: {
      badge: "bg-blue-50 text-forest border border-blue-200/50",
      dot: "bg-forest",
      label: "Completed",
    },
    cancelled: {
      badge: "bg-rose-50 text-rose-700 border border-rose-200/50",
      dot: "bg-rose-500",
      label: "Cancelled",
    },
  }

  const handlePayment = async (appointmentId) => {
    setPayingId(appointmentId)
    try {
      const orderResponse = await axiosInstance.post(
        "/payments/create-order",
        { appointmentId },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      )

      const { orderId, amount, currency, doctorName } = orderResponse.data.data

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: "MedLink",
        description: `Consultation with ${doctorName}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            await axiosInstance.post(
              "/payments/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                appointmentId,
              },
              { headers: { Authorization: `Bearer ${user.accessToken}` } }
            )
            fetchAppointments()
          } catch (err) {
            alert("Payment verification failed")
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#0052CC" },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      alert(error.response?.data?.message || "Payment failed to initiate")
    } finally {
      setPayingId(null)
    }
  }

  // Triggered helper modal to show clinical contact instructions for mock actions
  const triggerActionModal = (actionType, clinicName, phone = "1800-419-5050") => {
    setInfoModal({
      open: true,
      title: `${actionType} Request`,
      message: `To complete this request, please contact the administrative desk of ${clinicName || "MedLink Healthcare Center"} directly at ${phone}. Our care coordinators will assist you immediately.`,
    })
  }

  // Dynamic calculations for header summary metric cards
  const upcomingCount = appointments.filter(a => a.status === "pending" || a.status === "confirmed").length
  const completedCount = appointments.filter(a => a.status === "completed").length
  const cancelledCount = appointments.filter(a => a.status === "cancelled").length

  // Filtered array according to search terms and tab states
  const filteredAppointments = appointments.filter((appt) => {
    const searchString = `${appt.doctor?.name} ${appt.doctor?.specialization} ${appt.doctor?.clinicName}`.toLowerCase()
    const matchesSearch = searchString.includes(searchQuery.toLowerCase())

    if (activeFilter === "upcoming") {
      return matchesSearch && (appt.status === "pending" || appt.status === "confirmed")
    }
    if (activeFilter === "past") {
      return matchesSearch && (appt.status === "completed" || appt.status === "cancelled")
    }
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased">
      <Navbar />

      {/* Main Container */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 md:px-8 py-12">
        
        {/* Header Breadcrumb & Title */}
        <div className="mb-10 text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              <Link to="/" className="hover:text-forest transition">Home</Link>
              <span className="text-slate-350">/</span>
              <span className="text-slate-500">My Appointments</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
              Your Consultations
            </h1>
            <p className="text-slate-500 mt-2.5 text-xs sm:text-sm font-semibold max-w-md">
              Manage your clinical schedule, complete pending payments, and review past visits.
            </p>
          </div>
          
          <Link to="/doctors">
            <Button className="rounded-xl shadow-md text-xs font-black">
              ＋ Book Consultation
            </Button>
          </Link>
        </div>

        {/* 1. Header Summary Stats Cards Row */}
        <div className="grid grid-cols-3 gap-5 mb-10">
          <Card className="bg-white border-slate-200/50">
            <CardContent className="p-4 sm:p-5 text-center flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Upcoming</span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-1">{upcomingCount}</h3>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200/50">
            <CardContent className="p-4 sm:p-5 text-center flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completed</span>
              <h3 className="text-2xl sm:text-3xl font-black text-forest tracking-tight mt-1">{completedCount}</h3>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200/50">
            <CardContent className="p-4 sm:p-5 text-center flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cancelled</span>
              <h3 className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight mt-1">{cancelledCount}</h3>
            </CardContent>
          </Card>
        </div>

        {/* 2. Filter Controls & Search bar */}
        <div className="bg-white border border-slate-200/60 p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,82,204,0.01)] flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-2xl p-1 shrink-0 w-full sm:w-auto">
            {["all", "upcoming", "past"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`flex-1 sm:flex-initial text-center px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  activeFilter === tab
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-450 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:max-w-xs flex items-center">
            <svg className="absolute left-3.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by doctor or clinic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-forest/40 focus:bg-white rounded-2xl focus:outline-none transition text-xs font-semibold text-slate-800"
            />
          </div>
        </div>

        {/* 3. Appointment Feed Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200/50 rounded-[28px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
            <p className="text-slate-400 text-xs font-bold mt-4 tracking-wider uppercase">Loading clinical feed...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <Card className="p-16 text-center border-slate-200/50 bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,82,204,0.01)] flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-450 text-2xl mb-4">
              📅
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg">No appointments found</h3>
            <p className="text-slate-450 mt-1 max-w-sm text-xs font-bold">
              {searchQuery ? "Try clearing search queries or checking other schedule filters." : "Schedule a visit to connect with clinical consultants."}
            </p>
            <Link to="/doctors" className="mt-6">
              <Button size="sm" variant="outline" className="rounded-xl text-xs font-black">
                Find clinical experts
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredAppointments.map((appt) => {
              const config = statusConfig[appt.status] || statusConfig.pending
              const isUpcoming = appt.status === "pending" || appt.status === "confirmed"

              return (
                <Card
                  key={appt._id}
                  className="bg-white border-slate-200/50 rounded-[24px] p-6 hover:shadow-[0_12px_45px_-5px_rgba(0,82,204,0.06)] hover:scale-[1.005] transition-all duration-300 flex flex-col"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    
                    {/* Doctor portrait and info block */}
                    <div className="flex items-center gap-4 min-w-0">
                      <Avatar
                        src={appt.doctor?.avatar}
                        name={appt.doctor?.name}
                        size="lg"
                        className="rounded-2xl shrink-0"
                      />
                      <div className="min-w-0">
                        
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h3 className="font-extrabold text-slate-900 text-base truncate">
                            Dr. {appt.doctor?.name}
                          </h3>
                          <Badge className={`rounded-xl py-0.5 px-2.5 text-[9px] font-black shrink-0 ${config.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} />
                            {config.label}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-forest font-bold">{appt.doctor?.specialization}</p>
                        
                        <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-500 font-medium">
                          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="truncate">{appt.doctor?.clinicName || "MedLink Health Hospital"}</span>
                        </div>

                      </div>
                    </div>

                    {/* Schedule block details */}
                    <div className="grid grid-cols-2 gap-4 shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-100/80">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Scheduled time</span>
                        <p className="text-xs font-black text-slate-800 mt-1">{appt.slot}</p>
                      </div>
                      
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Consultation Fee</span>
                        <p className="text-xs font-black text-slate-800 mt-1">₹{appt.doctor?.consultationFee}</p>
                      </div>

                      <div className="col-span-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                        <span>Payment Status:</span>
                        <span className={appt.isPaid ? "text-emerald-600 font-extrabold" : "text-rose-600 font-extrabold animate-pulse"}>
                          {appt.isPaid ? "Paid" : "Pending Payment"}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Actions Bar layout */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-5 border-t border-slate-100/80">
                    
                    {/* Pay Button Trigger */}
                    {!appt.isPaid && appt.status !== "cancelled" ? (
                      <Button
                        onClick={() => handlePayment(appt._id)}
                        disabled={payingId === appt._id}
                        className="w-full sm:w-auto text-xs font-black px-5 py-2.5 rounded-xl shadow-md shadow-forest/15"
                      >
                        {payingId === appt._id ? "Processing Secure Payment..." : `Proceed to Pay ₹${appt.doctor?.consultationFee}`}
                      </Button>
                    ) : (
                      <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        MedLink Care Coordinator Assigned
                      </div>
                    )}

                    {/* Standard CTAs */}
                    <div className="flex gap-2 w-full sm:w-auto">
                      {isUpcoming ? (
                        <>
                          <button
                            onClick={() => triggerActionModal("Reschedule", appt.doctor?.clinicName)}
                            className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition duration-150 active:scale-95 text-center"
                          >
                            Reschedule
                          </button>
                          
                          {appt.status !== "cancelled" && (
                            <button
                              onClick={() => triggerActionModal("Cancellation", appt.doctor?.clinicName)}
                              className="flex-1 sm:flex-initial px-3.5 py-2 border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold rounded-xl transition duration-150 active:scale-95 text-center"
                            >
                              Cancel
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => triggerActionModal("View Prescription", appt.doctor?.clinicName)}
                            className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition duration-150 active:scale-95 text-center"
                          >
                            Prescription
                          </button>

                          <Link to={`/doctors/${appt.doctor?._id}`} className="flex-1 sm:flex-initial">
                            <button className="w-full px-3.5 py-2 bg-blue-50/70 border border-blue-100 hover:bg-blue-100/50 text-forest text-xs font-bold rounded-xl transition duration-150 active:scale-95 text-center">
                              Book Again
                            </button>
                          </Link>
                        </>
                      )}
                    </div>

                  </div>

                </Card>
              )
            })}
          </div>
        )}

      </div>

      {/* 4. Support Modal Dialog Widget */}
      {infoModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <Card className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden animate-scale-up border border-slate-200/80">
            <CardContent className="p-6">
              <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100 mb-4">
                <div className="w-9 h-9 rounded-xl bg-forest/10 flex items-center justify-center text-lg shadow-sm shrink-0">
                  📞
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">{infoModal.title}</h3>
              </div>
              
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                {infoModal.message}
              </p>
              
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setInfoModal({ open: false, title: "", message: "" })}
                  size="sm"
                  className="rounded-xl px-4 text-xs font-black shadow-sm"
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  )
}

export default MyAppointments