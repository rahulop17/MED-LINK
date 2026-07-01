import axios from "axios"

const axiosInstance = axios.create({
  baseURL:  "https://med-link-9gsg.onrender.com/api",
  withCredentials: true,
})

export default axiosInstance