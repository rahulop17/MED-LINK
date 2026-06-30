import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="flex items-center justify-between px-8 md:px-16 py-5 bg-white border-b border-[var(--color-ink)]/8 sticky top-0 z-50">
      <Link to="/" className="font-display text-2xl font-semibold text-[var(--color-forest)]">
        MedLink
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-ink)]/70">
        <Link to="/" className={isActive("/") ? "text-[var(--color-forest)] border-b-2 border-[var(--color-forest)] pb-0.5" : "hover:text-[var(--color-forest)]"}>
          Home
        </Link>
        <Link to="/doctors" className={isActive("/doctors") ? "text-[var(--color-forest)] border-b-2 border-[var(--color-forest)] pb-0.5" : "hover:text-[var(--color-forest)]"}>
          All Doctors
        </Link>
        <Link to="/symptom-checker" className={isActive("/symptom-checker") ? "text-[var(--color-forest)] border-b-2 border-[var(--color-forest)] pb-0.5" : "hover:text-[var(--color-forest)]"}>
          AI Checker
        </Link>
        <Link to="/feed" className={isActive("/feed") ? "text-[var(--color-forest)] border-b-2 border-[var(--color-forest)] pb-0.5" : "hover:text-[var(--color-forest)]"}>
          Feed
        </Link>
      </div>

      <div className="flex gap-3 items-center">
        {user ? (
          <>
            <span className="text-xs font-extrabold text-slate-500 mr-1.5 hidden sm:inline-block">
              Hi, {user.role === "doctor" ? `Dr. ${user.name}` : user.name}
            </span>
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="text-sm font-medium border border-[var(--color-forest)] text-[var(--color-forest)] px-4 py-2 rounded-full hover:bg-[var(--color-forest)] hover:text-white transition"
              >
                Admin Panel
              </Link>
            )}
            <Link
              to={user.role === "doctor" ? "/doctor/dashboard" : "/my-appointments"}
              className="text-sm font-medium text-[var(--color-forest)] hover:underline"
            >
              {user.role === "doctor" ? "Dashboard" : user.role === "admin" ? "Home" : "My Appointments"}
            </Link>
            <button
              onClick={logout}
              className="text-sm font-medium bg-[var(--color-forest)] text-white px-5 py-2.5 rounded-full hover:bg-[var(--color-forest-light)] transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm font-medium text-[var(--color-ink)]/70 hover:text-[var(--color-forest)] px-4 py-2">
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-[var(--color-forest)] text-white px-5 py-2.5 rounded-full hover:bg-[var(--color-forest-light)] transition"
            >
              Create account
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar