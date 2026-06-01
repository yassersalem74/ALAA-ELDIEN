import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://alaaeldin.runasp.net";

export const publicApi = axios.create({
  baseURL: API_BASE_URL,
});

const api = axios.create({
  baseURL: API_BASE_URL,
  // withCredentials: true,
});

const getCookie = (name) => {
  if (typeof document === "undefined") return "";

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
};

api.interceptors.request.use((config) => {
  if (config.skipAuth) {
    if (config.headers) {
      delete config.headers.Authorization;
    }
    delete config.skipAuth;
    return config;
  }

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || getCookie("alaa_auth_token")
      : "";

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
