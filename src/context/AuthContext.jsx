import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearStoredAuthSession,
  storeAuthTokens,
} from "../api/api";
import { AuthContext } from "./authContext";

const AUTH_COOKIE_NAME = "alaa_auth_session";
const AUTH_TOKEN_COOKIE_NAME = "alaa_auth_token";
const REFRESH_TOKEN_COOKIE_NAME = "alaa_refresh_token";
const ACCOUNT_TYPE_COOKIE_NAME = "alaa_account_type";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const canUseBrowserStorage = () => typeof window !== "undefined";

const getCookie = (name) => {
  if (!canUseBrowserStorage()) return "";

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
};

const setCookie = (name, value) => {
  if (!canUseBrowserStorage()) return;

  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};

const readStoredUser = () => {
  if (!canUseBrowserStorage()) return null;

  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const getInitialAuthState = () => {
  if (!canUseBrowserStorage()) {
    return {
      accountType: "",
      token: "",
      refreshToken: "",
      user: null,
      userRole: "",
      isAuthenticated: false,
    };
  }

  const token = getCookie(AUTH_TOKEN_COOKIE_NAME);
  const refreshToken = getCookie(REFRESH_TOKEN_COOKIE_NAME);
  const hasSession = Boolean(getCookie(AUTH_COOKIE_NAME) || token);
  const accountType =
    getCookie(ACCOUNT_TYPE_COOKIE_NAME) ||
    (hasSession ? localStorage.getItem("accountType") || "" : "");

  return {
    accountType,
    token,
    refreshToken,
    user: hasSession ? readStoredUser() : null,
    userRole: hasSession ? localStorage.getItem("userRole") || "" : "",
    isAuthenticated: hasSession,
  };
};

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(getInitialAuthState);

  const login = useCallback(({ accountType, token, refreshToken, user, userRole }) => {
    setCookie(AUTH_COOKIE_NAME, "true");
    setCookie(ACCOUNT_TYPE_COOKIE_NAME, accountType);
    storeAuthTokens({ accessToken: token, refreshToken });

    localStorage.setItem("accountType", accountType);
    localStorage.setItem("loggedInAs", accountType);
    localStorage.setItem("userRole", userRole || user?.role || "");

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    setAuthState({
      accountType,
      token: token || "",
      refreshToken: refreshToken || "",
      user: user || null,
      userRole: userRole || user?.role || "",
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(() => {
    clearStoredAuthSession();

    setAuthState({
      accountType: "",
      token: "",
      refreshToken: "",
      user: null,
      userRole: "",
      isAuthenticated: false,
    });
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV || !authState.isAuthenticated) return undefined;

    const logAuthSnapshot = () => {
      console.log("[Auth Debug] current user and role", {
        user: authState.user,
        role: authState.userRole || authState.user?.role || "",
        accountType: authState.accountType,
        loggedInAt: new Date().toISOString(),
      });
    };

    logAuthSnapshot();
    const intervalId = window.setInterval(logAuthSnapshot, 20000);

    return () => window.clearInterval(intervalId);
  }, [authState.accountType, authState.isAuthenticated, authState.user, authState.userRole]);

  const value = useMemo(
    () => ({
      ...authState,
      login,
      logout,
    }),
    [authState, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
