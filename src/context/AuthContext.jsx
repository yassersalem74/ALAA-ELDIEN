import { useCallback, useEffect, useMemo, useState } from "react";
import { getMyProfile } from "../api/user/user.api";
import { AuthContext } from "./authContext";

const AUTH_COOKIE_NAME = "alaa_auth_session";
const AUTH_TOKEN_COOKIE_NAME = "alaa_auth_token";
const ACCOUNT_TYPE_COOKIE_NAME = "alaa_account_type";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const LOCAL_STORAGE_KEYS = ["accountType", "loggedInAs", "token", "user"];

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

const deleteCookie = (name) => {
  if (!canUseBrowserStorage()) return;

  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
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
      user: null,
      isAuthenticated: false,
    };
  }

  const token = getCookie(AUTH_TOKEN_COOKIE_NAME);
  const hasSession = Boolean(getCookie(AUTH_COOKIE_NAME) || token);
  const accountType =
    getCookie(ACCOUNT_TYPE_COOKIE_NAME) ||
    (hasSession ? localStorage.getItem("accountType") || "" : "");

  return {
    accountType,
    token,
    user: hasSession ? readStoredUser() : null,
    isAuthenticated: hasSession,
  };
};

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(getInitialAuthState);

  const login = useCallback(({ accountType, token, user }) => {
    setCookie(AUTH_COOKIE_NAME, "true");
    setCookie(ACCOUNT_TYPE_COOKIE_NAME, accountType);

    if (token) {
      setCookie(AUTH_TOKEN_COOKIE_NAME, token);
      localStorage.setItem("token", token);
    }

    localStorage.setItem("accountType", accountType);
    localStorage.setItem("loggedInAs", accountType);

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    setAuthState({
      accountType,
      token: token || "",
      user: user || null,
      isAuthenticated: true,
    });
  }, []);

  const updateToken = useCallback((token) => {
    if (token) {
      setCookie(AUTH_TOKEN_COOKIE_NAME, token);
      localStorage.setItem("token", token);
    } else {
      deleteCookie(AUTH_TOKEN_COOKIE_NAME);
      localStorage.removeItem("token");
    }

    setAuthState((currentState) => ({
      ...currentState,
      token: token || "",
      isAuthenticated:
        Boolean(getCookie(AUTH_COOKIE_NAME) || token) || currentState.isAuthenticated,
    }));
  }, []);

  const updateUser = useCallback((user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }

    setAuthState((currentState) => ({
      ...currentState,
      user: user || null,
    }));
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await getMyProfile();

    if (profile) {
      updateUser(profile);
    }

    return profile;
  }, [updateUser]);

  const logout = useCallback(() => {
    deleteCookie(AUTH_COOKIE_NAME);
    deleteCookie(AUTH_TOKEN_COOKIE_NAME);
    deleteCookie(ACCOUNT_TYPE_COOKIE_NAME);

    LOCAL_STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });

    setAuthState({
      accountType: "",
      token: "",
      user: null,
      isAuthenticated: false,
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!authState.isAuthenticated || !authState.token) {
      return undefined;
    }

    const hydrateProfile = async () => {
      try {
        const profile = await getMyProfile();

        if (isMounted && profile) {
          updateUser(profile);
        }
      } catch {
        // Keep the stored session usable even if profile hydration fails.
      }
    };

    hydrateProfile();

    return () => {
      isMounted = false;
    };
  }, [authState.isAuthenticated, authState.token, updateUser]);

  const value = useMemo(
    () => ({
      ...authState,
      isProvider: Boolean(
        authState.user?.isProvider ||
          String(authState.user?.role || "").toLowerCase() === "provider"
      ),
      login,
      updateToken,
      updateUser,
      refreshProfile,
      logout,
    }),
    [authState, login, updateToken, updateUser, refreshProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
