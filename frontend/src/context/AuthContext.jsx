import { createContext, useContext, useState, useEffect } from "react"
import axiosInstance from "../utils/axiosInstance"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // localStorage se user check karo page reload pe
    const storedUser = localStorage.getItem("medlink_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem("medlink_user", JSON.stringify(userData))
  }

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout")
    } catch (error) {
      console.log("Logout error:", error)
    }
    setUser(null)
    localStorage.removeItem("medlink_user")
  }

  // profile update ke baad user state aur localStorage dono sync karo
  const updateUser = (newData) => {
    setUser(prev => {
      const updated = { ...prev, ...newData }
      localStorage.setItem("medlink_user", JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)