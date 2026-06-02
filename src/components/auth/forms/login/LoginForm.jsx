import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import PasswordToggle from "../../../common/PasswordToggle";
import Toast from "../../../common/Toast";
import {
  changeRole,
  getMyInformation,
  loginUser,
} from "../../../../api/auth/auth.api";
import { useAuth } from "../../../../context/useAuth";

import loginImage from "../../../../assets/images/auth/login.png";
import emailIcon from "../../../../assets/images/auth/email.png";

const getApiErrorMessage = (error) => {
  const status = error?.response?.status;

  // For login-specific errors, use generic message
  if (status === 401 || status === 404 || status === 400) {
    return "Invalid email or password.";
  }

  if (status === 403) return "Please verify your email first.";

  return "Invalid email or password.";
};

const getAuthToken = (data) =>
  (typeof data?.data === "string" ? data.data : null) ||
  data?.token ||
  data?.accessToken ||
  data?.data?.token ||
  data?.data?.accessToken ||
  data?.user?.token;

const getAuthUser = (data) => data?.user || data?.data?.user;

const AUTH_TOKEN_COOKIE_NAME = "alaa_auth_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const setCookie = (name, value) => {
  if (typeof document === "undefined" || !value) return;

  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return {};

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "="
    );

    return JSON.parse(atob(paddedPayload));
  } catch {
    return {};
  }
};

const firstPresentValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const collectRoleValues = (value, seen = new Set()) => {
  if (value === undefined || value === null || seen.has(value)) return [];

  if (typeof value !== "object") return [value];

  seen.add(value);

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectRoleValues(item, seen));
  }

  const roleKeys = [
    "role",
    "roles",
    "userRole",
    "accountRole",
    "accountType",
    "type",
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
  ];

  return roleKeys.flatMap((key) => collectRoleValues(value[key], seen));
};

const getUserRole = (...sources) =>
  sources
    .flatMap((source) => collectRoleValues(source))
    .map((role) => String(role || "").trim())
    .find(Boolean) || "";

const normalizeStoredAccountType = (role, fallbackAccountType) => {
  const normalizedRole = String(role || "").trim().toLowerCase();

  if (normalizedRole.includes("company")) return "company";
  if (normalizedRole.includes("provider") || normalizedRole.includes("customer")) {
    return "individual";
  }

  return fallbackAccountType;
};

const getLoginRoleRequest = (accountType) =>
  accountType === "individual" ? "Provider" : "";

const isNoChangesDetectedError = (error) => {
  const data = error?.response?.data;
  const message =
    data?.error?.message ||
    data?.error?.code ||
    data?.message ||
    data?.code ||
    "";

  return error?.response?.status === 409 && String(message).includes("NoChangesDetected");
};

const ACCOUNT_TYPE_OPTIONS = [
  { id: "individual", label: "Provider" },
  { id: "company", label: "Company" },
];

const ACCOUNT_TYPE_LABELS = {
  individual: "Provider",
  company: "Company",
};

const normalizeAccountType = (value) => {
  const normalizedValue = String(value || "").trim().toLowerCase();

  if (!normalizedValue) return "";
  if (normalizedValue.includes("company")) return "company";

  return "individual";
};

const getAccountTypeLabel = (accountType) =>
  ACCOUNT_TYPE_LABELS[accountType] || accountType;

export default function LoginForm() {
  const [accountType, setAccountType] = useState("individual");
  const [apiError, setApiError] = useState("");
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const redirectFrom = location.state?.from;
  const redirectTo = redirectFrom
    ? `${redirectFrom.pathname}${redirectFrom.search || ""}${redirectFrom.hash || ""}`
    : "/";

  const handleAccountTypeChange = (type) => {
    setAccountType(type);
  };

  const showToast = (type, message) => {
    setToast({
      id: Date.now(),
      type,
      message,
    });
  };

  const handleInvalidSubmit = (formErrors) => {
    const firstError = Object.values(formErrors)[0];
    const message = firstError?.message || "Please complete the required fields.";

    showToast("error", message);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setApiError("");

    try {
      const res = await loginUser({
        email: data.email,
        password: data.password,
        remeberMe: true,
      });

      console.log("LOGIN RESPONSE", res);

      const token = getAuthToken(res);
      const loginUserData = getAuthUser(res);
      const tokenPayload = token ? decodeJwtPayload(token) : {};

      if (token) {
        localStorage.setItem("token", token);
        setCookie(AUTH_TOKEN_COOKIE_NAME, token);
      }

      const roleRequest = getLoginRoleRequest(accountType);

      if (token && roleRequest && getUserRole(tokenPayload) !== roleRequest) {
        try {
          await changeRole(roleRequest);
        } catch (roleError) {
          if (isNoChangesDetectedError(roleError)) {
            console.log("CHANGE ROLE SKIPPED", roleError?.response?.data);
          } else {
            console.error("CHANGE ROLE API ERROR", roleError?.response?.data || roleError);
          }
        }
      }

      let user = loginUserData;

      try {
        const meResponse = await getMyInformation();
        user = meResponse?.data || meResponse?.user || meResponse || user;
        console.log("GET CURRENT USER RESPONSE", meResponse);
      } catch (meError) {
        console.error("GET CURRENT USER API ERROR", meError?.response?.data || meError);
      }

      const userRole = getUserRole(user, tokenPayload, roleRequest);
      const storedAccountType = normalizeStoredAccountType(userRole, accountType);
      const userObject = user && typeof user === "object" ? user : {};
      const currentUser = {
        ...userObject,
        email: data.email,
        accountType: storedAccountType,
        role: userRole,
      };

      const userAccountType = normalizeAccountType(
        firstPresentValue(user?.accountType, user?.type, userRole, storedAccountType)
      );

      if (userAccountType && userAccountType !== storedAccountType) {
        const errorMessage = "Invalid email or password.";
        
        console.error("ACCOUNT TYPE MISMATCH", {
          email: data.email,
          selectedType: storedAccountType,
          actualType: userAccountType,
          timestamp: new Date().toISOString(),
        });

        setApiError(errorMessage);
        showToast("error", errorMessage);
        return;
      }

      // Log successful login
      console.log("LOGIN SUCCESSFUL", {
        email: data.email,
        accountType: storedAccountType,
        userType: userAccountType,
        userRole,
        user: currentUser,
        timestamp: new Date().toISOString(),
      });

      login({
        accountType: storedAccountType,
        token,
        user: currentUser,
        userRole,
      });

      showToast(
        "success",
        `Logged in successfully as ${getAccountTypeLabel(
          storedAccountType
        )} with email: ${data.email}.`
      );

      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 1000);
    } catch (error) {
      console.error("LOGIN API ERROR", error?.response?.data || error);
      const message = getApiErrorMessage(error);

      setApiError(message);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-[#E6E8EF] px-4">
      <Toast
        key={toast?.id}
        type={toast?.type}
        message={toast?.message}
        onClose={() => setToast(null)}
      />

      {/* ===== CARD ===== */}
      <div className="w-full md:w-3/4 bg-white rounded-4xl shadow-[0px_8px_24px_rgba(23,26,30,0.15)] overflow-hidden flex my-6">
        {/* ===== LEFT IMAGE ===== */}
        <div className="hidden lg:flex w-1/2 items-center justify-start">
          <img src={loginImage} alt="login" className="h-full w-3/4" />
        </div>

        {/* ===== RIGHT FORM ===== */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            {/* ===== HEADER ===== */}
            <div className="text-center mb-8">
              <h1 className="font-bold text-[32px] leading-12 text-[#011C60]">
                Welcome Back
              </h1>
              <p className="text-[24px] leading-10 text-[#808DAF]">
                sign in to continue
              </p>
            </div>

            {/* ===== FORM ===== */}
            <form
              onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)}
              className="space-y-6"
            >
              {/* Account Type */}
              <div className="flex justify-center">
                <div className="flex bg-[#E6E8EF] rounded-xl p-1 text-sm sm:text-lg">
                  {ACCOUNT_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={accountType === option.id}
                      onClick={() => handleAccountTypeChange(option.id)}
                      className={`px-4 py-1.5 rounded-[10px] transition-all duration-300 ${
                        accountType === option.id
                          ? "bg-white text-[#011C60] shadow"
                          : "cursor-pointer text-[#808DAF]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {apiError && (
                <p className="text-center text-xs sm:text-sm text-red-500">
                  {apiError}
                </p>
              )}

              {/* Email */}
              <div>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: "Invalid email format",
                      },
                    })}
                    className={`
                    w-full h-12 sm:h-16 rounded-2xl
                     px-12
                    text-[14px] sm:text-[18px] leading-6
                      placeholder:text-[#808DAF] text-[#011C60]
                    border ${
                      errors.email
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-[#011C60]"
                    }
                    outline-none
                  `}
                  />

                  <span className="absolute left-4 top-1/2 -translate-y-1/2">
                    <img src={emailIcon} alt="email" className="w-5 h-4" />
                  </span>
                </div>

                {errors.email && (
                  <span className="text-red-500 text-xs">
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Password */}
              <div>
                <PasswordToggle
                  register={register}
                  name="password"
                  validation={{
                    required: "Password is required",
                  }}
                />
                {errors.password && (
                  <span className="text-red-500 text-xs">
                    {errors.password.message}
                  </span>
                )}
              </div>

              {/* Forget Password */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate("/forget-password")}
                  className="
                                text-[14px] sm:text-[18px] leading-6 text-[#011C60] cursor-pointer
                                
                                relative inline-block
                                transition-all duration-300
                                
                                after:content-['']
                                after:absolute after:left-0 after:bottom-0
                                after:w-0 after:h-0.5
                                after:bg-[#011C60]
                                after:transition-all after:duration-300
                                
                                hover:after:w-full
                                hover:text-[#02237a]
                            "
                >
                  forget password ?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="
                                w-full h-12 sm:h-16
                                rounded-2xl
                                bg-[#011C60] text-white
                                text-[16px] sm:text-[20px] font-semibold
                                shadow-[4px_8px_12px_0px_rgba(23,26,30,0.25)]
                                
                                transition-all duration-300 ease-in-out
                                hover:shadow-[0px_12px_24px_rgba(23,26,30,0.35)]
                                hover:-translate-y-0.5
                                hover:bg-[#02237a]
                                active:scale-[0.98]
                                disabled:cursor-not-allowed disabled:opacity-70
                                cursor-pointer
                            "
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>

              {/* Footer */}
              <p className="text-center text-[14px] sm:text-[18px] leading-6 text-[#808DAF]">
                Don’t have an account?{" "}
                <span
                 onClick={() => navigate("/signup", { state: { accountType } })}
                  className="
                        text-[#011C60] font-semibold cursor-pointer
                        
                        relative inline-block
                        transition-all duration-300
                        
                        after:content-['']
                        after:absolute after:left-0 after:bottom-0
                        after:w-0 after:h-0.5
                        after:bg-[#011C60]
                        after:transition-all after:duration-300
                        
                        hover:after:w-full
                        hover:text-[#02237a]
                    "
                >
                  Sign up
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
