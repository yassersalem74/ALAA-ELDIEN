import api from "../api";
import { AUTH_ENDPOINTS } from "./auth.endpoints";

export const registerUser = async (data) => {
  const res = await api.post(AUTH_ENDPOINTS.REGISTER, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const verifyEmail = async (data) => {
  const res = await api.post(AUTH_ENDPOINTS.VERIFY_EMAIL, data);

  return res.data;
};

export const resendEmailVerification = async (data) => {
  const res = await api.post(AUTH_ENDPOINTS.RESEND_EMAIL_VERIFICATION, data);

  return res.data;
};

export const loginUser = async (data) => {
  const res = await api.post(AUTH_ENDPOINTS.LOGIN, data);

  return res.data;
};

export const forgetPassword = async (data) => {
  const res = await api.post(AUTH_ENDPOINTS.FORGET_PASSWORD, data);

  return res.data;
};

export const resetPassword = async (data) => {
  const res = await api.post(AUTH_ENDPOINTS.RESET_PASSWORD, data);

  return res.data;
};

export const getGovernorates = async (language = "en") => {
  const res = await api.get(AUTH_ENDPOINTS.GOVERNORATES, {
    params: {
      language,
    },
  });

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
