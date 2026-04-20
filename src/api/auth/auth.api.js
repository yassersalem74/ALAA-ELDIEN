import api from "../api";
import { AUTH_ENDPOINTS } from "./auth.endpoints";

export const registerUser = async (data) => {
  const res = await api.post(AUTH_ENDPOINTS.REGISTER, data);

  return res.data;
};

export const verifyOtp = async (data) => {
  const res = await api.post(AUTH_ENDPOINTS.VERIFY_OTP, data);

  return res.data;
};

export const getGovernorates = async (language = "en") => {
  const res = await api.get(AUTH_ENDPOINTS.GOVERNORATES(language));

  return res.data;
};

export const getNeighborhoods = async (governorateId, language = "en") => {
  const res = await api.get(AUTH_ENDPOINTS.NEIGHBORHOODS, {
    params: {
      governorateId,
      language,
    },
  });

  return res.data;
};
