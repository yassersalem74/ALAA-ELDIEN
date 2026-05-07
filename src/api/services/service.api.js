import api from "../api.js";
import { SERVICE_ENDPOINTS } from "./service.endpoints.js";

export const addService = async (data) => {
  const res = await api.post(SERVICE_ENDPOINTS.ADD_SERVICE, data);
  return res.data;
};

export const getServices = async (params) => {
  const res = await api.get(SERVICE_ENDPOINTS.GET_SERVICES, { params });
  return res.data;
};

export const updateService = async (id, data) => {
  const res = await api.put(`${SERVICE_ENDPOINTS.UPDATE_SERVICE}/${id}`, data);
  return res.data;
};

export const getServiceDetails = async (id, language = "en") => {
  const res = await api.get(`${SERVICE_ENDPOINTS.GET_SERVICE_DETAILS}/${id}`, {
    params: { language },
  });
  return res.data;
};

export const getMyServices = async (params) => {
  const res = await api.get(SERVICE_ENDPOINTS.GET_MY_SERVICES, { params });
  return res.data;
};

export const addReview = async (providerId, data) => {
  const res = await api.post(`${SERVICE_ENDPOINTS.ADD_REVIEW}/${providerId}`, data);
  return res.data;
};

export const createOrUpdateItems = async (serviceId, data) => {
  const res = await api.post(`${SERVICE_ENDPOINTS.CREATE_UPDATE_ITEMS}/${serviceId}`, data);
  return res.data;
};

export const createOrUpdateAgendas = async (serviceId, data) => {
  const res = await api.post(`${SERVICE_ENDPOINTS.CREATE_UPDATE_AGENDAS}/${serviceId}`, data);
  return res.data;
};