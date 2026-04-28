import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://alaaeldin.runasp.net",
  // withCredentials: true,
});

export default api;
