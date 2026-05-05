import axios from "axios";
import { getStoredToken } from "./api.utils";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://alaaeldin.runasp.net",
  // withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers = config.headers || {};

    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;
