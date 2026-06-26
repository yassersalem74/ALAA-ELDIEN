import api, {
  extractAccessToken,
  extractRefreshToken,
  publicApi,
  storeAuthTokens,
} from "../api.js";
import { changeRole } from "../auth/auth.api.js";
import { SERVICE_ENDPOINTS } from "./service.endpoints.js";

const normalizeAgendaPayload = (data, wrapperKey = "agendas") => {
  const agendas = data?.agendas || data?.Agendas || [];

  return {
    [wrapperKey]: agendas.map((agenda) => ({
      day: agenda.day || agenda.Day || "",
      from: agenda.from || agenda.From || "",
      to: agenda.to || agenda.To || "",
    })),
  };
};

const normalizeItemsPayload = (data) => {
  const items = Array.isArray(data)
    ? data
    : data?.items || data?.Items || data?.serviceItems || data?.ServiceItems || [];

  return {
    items: items
      .map((item) => ({
        Name: String(item.Name || item.name || item.itemName || item.serviceItemName || "").trim(),
        Price: Number(item.Price ?? item.price ?? item.itemPrice ?? item.serviceItemPrice ?? 0) || 0,
        Description: String(
          item.Description ||
            item.description ||
            item.itemDescription ||
            item.serviceItemDescription ||
            ""
        ).trim(),
      }))
      .filter((item) => item.Name),
  };
};

const isDebugLoggingEnabled = () => import.meta.env.DEV;

const getCookie = (name) => {
  if (typeof document === "undefined") return "";

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
};

const hasStoredAuthToken = () =>
  typeof window !== "undefined" &&
  Boolean(localStorage.getItem("token") || getCookie("alaa_auth_token"));

const isUnauthorizedError = (error) => error?.response?.status === 401;
const isForbiddenError = (error) => error?.response?.status === 403;

const switchToBookingRole = async () => {
  const response = await changeRole("Customer");
  const accessToken = extractAccessToken(response);
  const refreshToken = extractRefreshToken(response);

  if (accessToken || refreshToken) {
    storeAuthTokens({ accessToken, refreshToken });
  }

  return response;
};

const createBookingRoleSwitchError = (roleError) => {
  const roleMessage =
    roleError?.response?.data?.error?.message ||
    roleError?.response?.data?.message ||
    roleError?.message ||
    "Unable to switch to customer mode.";
  const message = `Booking requires customer mode, but switching to customer mode failed: ${roleMessage}`;
  const error = new Error(message);

  error.response = {
    ...(roleError.response || {}),
    data: {
      ...(roleError.response?.data || {}),
      message,
    },
  };

  return error;
};

const serializeDebugValue = (value) => {
  if (typeof File !== "undefined" && value instanceof File) {
    return {
      name: value.name,
      size: value.size,
      type: value.type,
      lastModified: value.lastModified,
    };
  }

  return value;
};

const serializeFormData = (data) => {
  const entries = [];

  data.forEach((value, key) => {
    entries.push({
      key,
      value: serializeDebugValue(value),
    });
  });

  return entries;
};

const logApiPayload = (label, data) => {
  if (!isDebugLoggingEnabled()) return;

  console.groupCollapsed(`[Service API] ${label}`);

  if (typeof FormData !== "undefined" && data instanceof FormData) {
    const entries = serializeFormData(data);

    entries.forEach((entry, index) => {
      console.log(`input ${index + 1}: ${entry.key}`, entry.value);
    });
    console.log("full form data object", entries);
  } else {
    console.log("full request object", data);

    if (Array.isArray(data?.items)) {
      data.items.forEach((item, index) => {
        console.log(`item ${index + 1}`, item);
      });
    }

    if (Array.isArray(data?.agendas)) {
      data.agendas.forEach((agenda, index) => {
        console.log(`agenda ${index + 1}`, agenda);
      });
    }
  }

  console.groupEnd();
};

const logApiResponse = (label, data) => {
  if (!isDebugLoggingEnabled()) return;

  console.log(`[Service API] ${label}`, data);
};

const normalizeServiceQueryParams = (params = {}) =>
  Object.fromEntries(
    Object.entries({
      page: 1,
      pageSize: 12,
      language: "en",
      ...params,
    }).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );

const normalizeAppointmentBookingPayload = (data = {}) => {
  const source = data || {};
  const { securityStamp, ...payload } = source;

  return {
    ...payload,
    concurrencyStamp:
      source.concurrencyStamp === undefined
        ? securityStamp ?? null
        : source.concurrencyStamp,
    itemIds: Array.isArray(source.itemIds) ? source.itemIds.map(String) : [],
    neighborhoodId: source.neighborhoodId ? String(source.neighborhoodId) : null,
  };
};

const assertAppointmentConcurrencyStamp = (payload) => {
  if (String(payload.concurrencyStamp || "").trim()) return;

  const error = new Error(
    "Missing appointment concurrency stamp. Please refresh available times and select a slot again."
  );

  error.response = {
    data: {
      message: error.message,
    },
  };

  throw error;
};

export const addService = async (data) => {
  logApiPayload("POST /api/v1/services request", data);

  try {
    const res = await api.post(SERVICE_ENDPOINTS.ADD_SERVICE, data);

    logApiResponse("POST /api/v1/services response", res.data);

    return res.data;
  } catch (error) {
    logApiResponse("POST /api/v1/services error", error?.response?.data);
    throw error;
  }
};

export const getServices = async (params = {}) => {
  const queryParams = normalizeServiceQueryParams(params);
  const client = hasStoredAuthToken() ? api : publicApi;

  try {
    const res = await client.get(SERVICE_ENDPOINTS.GET_SERVICES, {
      params: queryParams,
    });
    return res.data;
  } catch (error) {
    if (client === api || !isUnauthorizedError(error) || !hasStoredAuthToken()) {
      throw error;
    }

    const res = await api.get(SERVICE_ENDPOINTS.GET_SERVICES, {
      params: queryParams,
    });
    return res.data;
  }
};

export const getServiceNames = async (params = {}) => {
  const queryParams = Object.fromEntries(
    Object.entries({
      language: "en",
      ...params,
    }).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
  const client = hasStoredAuthToken() ? api : publicApi;

  try {
    const res = await client.get(SERVICE_ENDPOINTS.GET_SERVICE_NAMES, {
      params: queryParams,
    });
    return res.data;
  } catch (error) {
    if (client === api || !isUnauthorizedError(error) || !hasStoredAuthToken()) {
      throw error;
    }

    const res = await api.get(SERVICE_ENDPOINTS.GET_SERVICE_NAMES, {
      params: queryParams,
    });
    return res.data;
  }
};

export const updateService = async (id, data) => {
  logApiPayload(`PUT /api/v1/services/${id} request`, data);

  try {
    const res = await api.put(`${SERVICE_ENDPOINTS.UPDATE_SERVICE}/${id}`, data);

    logApiResponse(`PUT /api/v1/services/${id} response`, res.data);

    return res.data;
  } catch (error) {
    logApiResponse(`PUT /api/v1/services/${id} error`, error?.response?.data);
    throw error;
  }
};

export const deleteService = async (id) => {
  const res = await api.delete(`${SERVICE_ENDPOINTS.DELETE_SERVICE}/${id}`);
  return res.data;
};

export const getServiceDetails = async (id, language = "en") => {
  if (hasStoredAuthToken()) {
    try {
      const res = await api.get(`${SERVICE_ENDPOINTS.GET_SERVICE_DETAILS}/${id}`, {
        params: { language },
      });
      return res.data;
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        throw error;
      }
    }
  }

  try {
    const res = await publicApi.get(`${SERVICE_ENDPOINTS.GET_SERVICE_DETAILS}/${id}`, {
      params: { language },
    });
    return res.data;
  } catch (error) {
    if (!isUnauthorizedError(error) || !hasStoredAuthToken()) {
      throw error;
    }

    const res = await api.get(`${SERVICE_ENDPOINTS.GET_SERVICE_DETAILS}/${id}`, {
      params: { language },
    });
    return res.data;
  }
};

export const getMyServices = async (params = {}) => {
  const res = await api.get(SERVICE_ENDPOINTS.GET_MY_SERVICES, {
    params: normalizeServiceQueryParams({
      pageSize: 50,
      isMine: true,
      ...params,
    }),
  });
  return res.data;
};

export const addReview = async (providerId, data) => {
  const res = await api.post(`${SERVICE_ENDPOINTS.ADD_REVIEW}/${providerId}`, data);
  return res.data;
};

export const createOrUpdateItems = async (serviceId, data) => {
  const payload = normalizeItemsPayload(data);

  logApiPayload(`POST /api/v1/items/services/${serviceId} request`, payload);

  const res = await api.post(`${SERVICE_ENDPOINTS.CREATE_UPDATE_ITEMS}/${serviceId}`, payload, {
    headers: { "Content-Type": "application/json" },
  });

  logApiResponse(`POST /api/v1/items/services/${serviceId} response`, res.data);

  return res.data;
};

export const createOrUpdateAgendas = async (serviceId, data) => {
  const url = `${SERVICE_ENDPOINTS.CREATE_UPDATE_AGENDAS}/${serviceId}`;
  const payload = normalizeAgendaPayload(data);

  logApiPayload(`POST /api/v1/agendas/services/${serviceId} request`, payload);

  const res = await api.post(url, payload, {
    headers: { "Content-Type": "application/json" },
  });

  logApiResponse(`POST /api/v1/agendas/services/${serviceId} response`, res.data);

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

export const getServiceAppointmentAvailabilities = async (id, date) => {
  const url = `${SERVICE_ENDPOINTS.GET_SERVICE_APPOINTMENT_AVAILABILITIES}/${id}`;
  const params = { date };

  logApiResponse(
    `GET /api/v1/appointments/availabilities/service/${id} request params`,
    params
  );

  if (hasStoredAuthToken()) {
    try {
      const res = await api.get(url, { params });
      logApiResponse(
        `GET /api/v1/appointments/availabilities/service/${id} response`,
        res.data
      );
      return res.data;
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        logApiResponse(
          `GET /api/v1/appointments/availabilities/service/${id} error`,
          error?.response?.data
        );
        throw error;
      }
    }
  }

  const res = await publicApi.get(url, { params });
  logApiResponse(
    `GET /api/v1/appointments/availabilities/service/${id} response`,
    res.data
  );
  return res.data;
};

export const getMyAppointments = async (params = {}) => {
  const queryParams = Object.fromEntries(
    Object.entries({
      page: 1,
      pageSize: 50,
      language: "en",
      ByMe: true,
      ...params,
    }).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );

  logApiResponse("GET /api/v1/appointments request params", queryParams);

  try {
    const res = await api.get(SERVICE_ENDPOINTS.GET_APPOINTMENTS, {
      params: queryParams,
    });

    logApiResponse("GET /api/v1/appointments response", res.data);

    return res.data;
  } catch (error) {
    logApiResponse("GET /api/v1/appointments error", error?.response?.data);
    throw error;
  }
};

export const bookServiceAppointment = async (id, data, { didRetry = false } = {}) => {
  const payload = normalizeAppointmentBookingPayload(data);

  assertAppointmentConcurrencyStamp(payload);
  logApiPayload(`POST /api/v1/appointments/book/service/${id} request`, payload);

  try {
    const res = await api.post(
      `${SERVICE_ENDPOINTS.BOOK_SERVICE_APPOINTMENT}/${id}`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    logApiResponse(
      `POST /api/v1/appointments/book/service/${id} response`,
      res.data
    );

    return res.data;
  } catch (error) {
    logApiResponse(
      `POST /api/v1/appointments/book/service/${id} error`,
      error?.response?.data
    );

    if (isForbiddenError(error) && !didRetry) {
      try {
        await switchToBookingRole();
      } catch (roleError) {
        logApiResponse(
          "POST /api/v1/users/me/change-role Customer error",
          roleError?.response?.data
        );
        throw createBookingRoleSwitchError(roleError);
      }

      return bookServiceAppointment(id, data, { didRetry: true });
    }

    throw error;
  }
};

export const getMyPackages = async (params) => {
  logApiResponse("GET /api/v1/packages request params", params);

  try {
    const res = await api.get(SERVICE_ENDPOINTS.GET_MY_PACKAGES, { params });

    logApiResponse("GET /api/v1/packages response", res.data);

    return res.data;
  } catch (error) {
    logApiResponse("GET /api/v1/packages error", error?.response?.data);
    throw error;
  }
};
