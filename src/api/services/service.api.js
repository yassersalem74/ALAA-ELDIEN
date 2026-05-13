import api from "../api.js";
import { SERVICE_ENDPOINTS } from "./service.endpoints.js";

const getErrorMessage = (error) => {
  const data = error?.response?.data;
  const validationMessage =
    data?.errors && typeof data.errors === "object"
      ? Object.values(data.errors).flat().filter(Boolean).join(" ")
      : "";

  return (
    data?.error?.message ||
    data?.message ||
    data?.title ||
    validationMessage ||
    (typeof data === "string" ? data : "")
  );
};

const normalizeAgendaPayload = (data, wrapperKey = "agendas") => {
  const agendas = data?.agendas || data?.Agendas || [];

  return {
    [wrapperKey]: agendas.map((agenda) => ({
      Day: agenda.Day || agenda.day || "",
      From: agenda.From || agenda.from || "",
      To: agenda.To || agenda.to || "",
    })),
  };
};

export const addService = async (data) => {
  const res = await api.post(SERVICE_ENDPOINTS.ADD_SERVICE, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getServices = async (params) => {
  const res = await api.get(SERVICE_ENDPOINTS.GET_SERVICES, { params });
  return res.data;
};

export const updateService = async (id, data) => {
  const res = await api.put(`${SERVICE_ENDPOINTS.UPDATE_SERVICE}/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteService = async (id) => {
  const res = await api.delete(`${SERVICE_ENDPOINTS.DELETE_SERVICE}/${id}`);
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
  const res = await api.post(`${SERVICE_ENDPOINTS.CREATE_UPDATE_ITEMS}/${serviceId}`, data, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const createOrUpdateAgendas = async (serviceId, data) => {
  const url = `${SERVICE_ENDPOINTS.CREATE_UPDATE_AGENDAS}/${serviceId}`;
  const config = {
    headers: { "Content-Type": "application/json" },
  };
  let res;

  try {
    res = await api.post(url, normalizeAgendaPayload(data), config);
  } catch (error) {
    if (
      error?.response?.status !== 400 ||
      !getErrorMessage(error).includes("DayNotEmptyValidator")
    ) {
      throw error;
    }

    res = await api.post(url, normalizeAgendaPayload(data, "Agendas"), config);
  }

  return res.data;
};

export const addPackage = async (data) => {
  const res = await api.post(SERVICE_ENDPOINTS.ADD_PACKAGE, data);
  return res.data;
};

export const updatePackage = async (id, data) => {
  const res = await api.put(`${SERVICE_ENDPOINTS.UPDATE_PACKAGE}/${id}`, data);
  return res.data;
};

export const deletePackage = async (id) => {
  const res = await api.delete(`${SERVICE_ENDPOINTS.DELETE_PACKAGE}/${id}`);
  return res.data;
};

export const getPackageDetails = async (id, language = "en") => {
  const res = await api.get(`${SERVICE_ENDPOINTS.GET_PACKAGE_DETAILS}/${id}`, {
    params: { language },
  });
  return res.data;
};

export const getMyPackages = async (params) => {
  const res = await api.get(SERVICE_ENDPOINTS.GET_MY_PACKAGES, { params });
  return res.data;
};
