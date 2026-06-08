import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://alaaeldin.runasp.net";
const AUTH_SESSION_COOKIE_NAME = "alaa_auth_session";
const AUTH_TOKEN_COOKIE_NAME = "alaa_auth_token";
const REFRESH_TOKEN_COOKIE_NAME = "alaa_refresh_token";
const ACCOUNT_TYPE_COOKIE_NAME = "alaa_account_type";
export const AUTH_TOKENS_REFRESHED_EVENT = "alaa:auth-tokens-refreshed";
export const AUTH_SESSION_CLEARED_EVENT = "alaa:auth-session-cleared";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const REFRESH_TOKEN_ENDPOINT = "/api/v1/authentication/refresh-token";
const AUTH_STORAGE_KEYS = [
  "accountType",
  "loggedInAs",
  "refreshToken",
  "token",
  "user",
  "userRole",
];

export const publicApi = axios.create({
  baseURL: API_BASE_URL,
});

const refreshApi = axios.create({
  baseURL: API_BASE_URL,
});

const api = axios.create({
  baseURL: API_BASE_URL,
  // withCredentials: true,
});

let refreshPromise = null;

const getCookie = (name) => {
  if (typeof document === "undefined") return "";

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
};

const setCookie = (name, value) => {
  if (typeof document === "undefined" || !value) return;

  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};

const deleteCookie = (name) => {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};

const getAccessToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("token") || getCookie(AUTH_TOKEN_COOKIE_NAME)
    : "";

const getRefreshToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("refreshToken") || getCookie(REFRESH_TOKEN_COOKIE_NAME)
    : "";

const isJwtLike = (value) =>
  typeof value === "string" && value.split(".").length === 3;

const normalizeTokenKey = (key) => String(key || "").toLowerCase().replace(/[_-]/g, "");

const findTokenValue = (data, keyNames, seen = new Set()) => {
  if (!data || seen.has(data)) return "";

  if (typeof data !== "object") {
    return "";
  }

  seen.add(data);

  for (const [key, value] of Object.entries(data)) {
    const normalizedKey = normalizeTokenKey(key);

    if (keyNames.includes(normalizedKey) && typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  for (const value of Object.values(data)) {
    const token = findTokenValue(value, keyNames, seen);

    if (token) return token;
  }

  return "";
};

export const extractAccessToken = (data) =>
  (typeof data === "string" && isJwtLike(data) ? data : "") ||
  (typeof data?.data === "string" && isJwtLike(data.data) ? data.data : "") ||
  findTokenValue(data, ["accesstoken", "token", "jwt"]);

export const extractRefreshToken = (data) =>
  findTokenValue(data, ["refreshtoken"]);

const dispatchAuthTokensRefreshed = ({ accessToken, refreshToken }) => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(AUTH_TOKENS_REFRESHED_EVENT, {
      detail: {
        accessToken,
        refreshToken,
      },
    })
  );
};

const dispatchAuthSessionCleared = () => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(AUTH_SESSION_CLEARED_EVENT));
};

export const storeAuthTokens = ({ accessToken, refreshToken }) => {
  if (typeof window === "undefined") return;

  if (accessToken) {
    localStorage.setItem("token", accessToken);
    setCookie(AUTH_TOKEN_COOKIE_NAME, accessToken);
    setCookie(AUTH_SESSION_COOKIE_NAME, "true");
  }

  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
    setCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken);
  }

  dispatchAuthTokensRefreshed({ accessToken, refreshToken });
};

export const clearStoredAuthSession = () => {
  if (typeof window === "undefined") return;

  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  deleteCookie(AUTH_SESSION_COOKIE_NAME);
  deleteCookie(AUTH_TOKEN_COOKIE_NAME);
  deleteCookie(REFRESH_TOKEN_COOKIE_NAME);
  deleteCookie(ACCOUNT_TYPE_COOKIE_NAME);
  dispatchAuthSessionCleared();
};

const redirectToLogin = () => {
  clearStoredAuthSession();

  if (typeof window === "undefined") return;

  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (!currentPath.startsWith("/login")) {
    window.location.replace("/login");
  }
};

const refreshAuthTokens = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("Missing refresh token");
  }

  const response = await refreshApi.post(REFRESH_TOKEN_ENDPOINT, {
    refreshToken,
  });
  const accessToken = extractAccessToken(response.data);
  const nextRefreshToken = extractRefreshToken(response.data) || refreshToken;

  if (!accessToken) {
    throw new Error("Refresh token response did not include an access token");
  }

  storeAuthTokens({
    accessToken,
    refreshToken: nextRefreshToken,
  });

  return accessToken;
};

api.interceptors.request.use((config) => {
  if (config.skipAuth) {
    config._skipAuthRefresh = true;
    if (config.headers) {
      delete config.headers.Authorization;
    }
    delete config.skipAuth;
    return config;
  }

  const token = getAccessToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    if (
      !originalRequest ||
      status !== 401 ||
      originalRequest._retry ||
      originalRequest._skipAuthRefresh
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise = refreshPromise || refreshAuthTokens();
      const accessToken = await refreshPromise;
      refreshPromise = null;

      originalRequest.headers = {
        ...(originalRequest.headers || {}),
        Authorization: `Bearer ${accessToken}`,
      };

      return api(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;

      const refreshStatus = refreshError?.response?.status;

      if (!refreshStatus || refreshStatus >= 400) {
        redirectToLogin();
      }

      return Promise.reject(refreshError);
    }
  }
);

export default api;
