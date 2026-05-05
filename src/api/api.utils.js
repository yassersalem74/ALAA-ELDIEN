const AUTH_TOKEN_COOKIE_NAME = "alaa_auth_token";

const canUseBrowserStorage = () => typeof window !== "undefined";

export const getCookie = (name) => {
  if (!canUseBrowserStorage()) return "";

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
};

export const getStoredToken = () => {
  if (!canUseBrowserStorage()) return "";

  return localStorage.getItem("token") || getCookie(AUTH_TOKEN_COOKIE_NAME) || "";
};

export const getApiData = (payload) => {
  if (payload === null || payload === undefined) return null;

  if (
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    Object.prototype.hasOwnProperty.call(payload, "data")
  ) {
    return payload.data;
  }

  return payload;
};

export const getApiList = (payload, keys = []) => {
  const directPayload = getApiData(payload);

  if (Array.isArray(directPayload)) return directPayload;

  for (const key of keys) {
    const value = directPayload?.[key];

    if (Array.isArray(value)) return value;
  }

  if (Array.isArray(payload)) return payload;

  for (const key of keys) {
    const value = payload?.[key];

    if (Array.isArray(value)) return value;
  }

  return [];
};

export const getApiEntity = (payload, keys = []) => {
  const directPayload = getApiData(payload);

  if (directPayload && typeof directPayload === "object" && !Array.isArray(directPayload)) {
    return directPayload;
  }

  for (const key of keys) {
    const value = payload?.[key];

    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value;
    }
  }

  return null;
};

export const getApiMessage = (payload, fallback = "") => {
  if (typeof payload?.message === "string") return payload.message;
  if (typeof payload?.error === "string") return payload.error;
  if (typeof payload?.error?.message === "string") return payload.error.message;

  return fallback;
};

export const getErrorMessage = (error, fallback = "Something went wrong.") => {
  const payload = error?.response?.data;

  if (typeof payload === "string" && payload.trim()) return payload;

  if (typeof payload?.message === "string") return payload.message;
  if (typeof payload?.error === "string") return payload.error;
  if (typeof payload?.error?.message === "string") return payload.error.message;

  if (Array.isArray(payload?.errors)) {
    return payload.errors
      .map((entry) => {
        if (typeof entry === "string") return entry;

        return entry?.message || entry?.error || entry?.msg || "";
      })
      .filter(Boolean)
      .join(", ");
  }

  return error?.message || fallback;
};

export const extractAuthToken = (payload) =>
  (typeof payload?.data === "string" ? payload.data : null) ||
  (typeof payload === "string" ? payload : null) ||
  payload?.token ||
  payload?.accessToken ||
  payload?.data?.token ||
  payload?.data?.accessToken ||
  payload?.user?.token;

export const getItemId = (item) =>
  item?._id || item?.id || item?.value || item?.serviceId || item?.packageId || "";

export const getItemName = (item) =>
  item?.name ||
  item?.title ||
  item?.label ||
  item?.nameEn ||
  item?.name_en ||
  item?.nameAr ||
  "";

export const toArray = (value) => (Array.isArray(value) ? value : []);

export const toNumber = (value, fallback = 0) => {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : fallback;
};
