import axios from "axios"

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://med-link-9gsg.onrender.com/api",
  withCredentials: true,
})

export default axiosInstance