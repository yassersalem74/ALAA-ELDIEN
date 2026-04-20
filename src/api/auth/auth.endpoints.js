export const AUTH_ENDPOINTS = {
  REGISTER: "/api/v1/user/register",
  VERIFY_OTP: "/api/v1/user/verify-otp",
  LOGIN: "/api/v1/user/login",
  GOVERNORATES: (language = "en") => `/api/v1/governorate/${language}`,
  NEIGHBORHOODS: "/api/v1/neighborhood",
};
