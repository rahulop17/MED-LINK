import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Register from "./pages/Register"
import Login from "./pages/Login"
import DoctorList from "./pages/DoctorList"
import DoctorProfile from "./pages/DoctorProfile"
import MyAppointments from "./pages/MyAppointments"
import SymptomChecker from "./pages/SymptomChecker"
import Feed from "./pages/Feed"
import DoctorDashboard from "./pages/DoctorDashboard"
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/doctors" element={<DoctorList />} />
      <Route path="/doctors/:id" element={<DoctorProfile />} />
      <Route path="/my-appointments" element={<MyAppointments />} />
      <Route path="/symptom-checker" element={<SymptomChecker />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
    </Routes>
  )
}

export default App