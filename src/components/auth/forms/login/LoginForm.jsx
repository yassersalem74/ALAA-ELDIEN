import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import PasswordToggle from "../../../common/PasswordToggle";
import Toast from "../../../common/Toast";
import { loginUser } from "../../../../api/auth/auth.api";

import loginImage from "../../../../assets/images/auth/login.png";
import emailIcon from "../../../../assets/images/auth/email.png";

const getApiErrorMessage = (error) => {
  const data = error?.response?.data;

  const formatValidationError = (item) => {
    if (typeof item === "string") return item;

    const message = item?.message || item?.msg || item?.error;
    const field = item?.path || item?.field || item?.param;

    if (message && field) return `${field}: ${message}`;
    if (message) return message;
    if (field) return `${field} is invalid`;

    return JSON.stringify(item);
  };

  if (Array.isArray(data)) {
    return data.map(formatValidationError).join(", ");
  }

  if (typeof data?.message === "string") return data.message;
  if (typeof data?.error === "string") return data.error;
  if (Array.isArray(data?.errors)) {
    return data.errors.map(formatValidationError).join(", ");
  }

  if (error?.response?.status === 403) return "Please verify your email first.";
  if (error?.response?.status === 401) return "Invalid email or password.";
  if (error?.response?.status === 404) return "User not found.";

  return error?.message || "Something went wrong. Please try again.";
};

const getAuthToken = (data) =>
  data?.token ||
  data?.accessToken ||
  data?.data?.token ||
  data?.data?.accessToken ||
  data?.user?.token;

const getAuthUser = (data) => data?.user || data?.data?.user;

export default function LoginForm() {
  const [accountType, setAccountType] = useState("individual");
  const [apiError, setApiError] = useState("");
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });
  const navigate = useNavigate();

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
      });

      console.log("LOGIN RESPONSE", res);

      const token = getAuthToken(res);
      const user = getAuthUser(res);

      localStorage.setItem("accountType", accountType);
      localStorage.setItem("loggedInAs", accountType);
      if (token) localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      showToast(
        "success",
        `Logged in successfully as ${accountType} with email: ${data.email}.`
      );

      setTimeout(() => {
        navigate("/");
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
                  <button
                    type="button"
                    aria-pressed={accountType === "individual"}
                    onClick={() => handleAccountTypeChange("individual")}
                    className={`px-6 py-1.5 rounded-[10px] transition-all duration-300 cursor-pointer ${
                      accountType === "individual"
                        ? "bg-white text-[#011C60] shadow"
                        : "text-[#808DAF]"
                    }`}
                  >
                    Individual
                  </button>

                  <button
                    type="button"
                    aria-pressed={accountType === "company"}
                    onClick={() => handleAccountTypeChange("company")}
                    className={`px-6 py-1.5 rounded-[10px] transition-all duration-300 cursor-pointer ${
                      accountType === "company"
                        ? "bg-white text-[#011C60] shadow"
                        : "text-[#808DAF]"
                    }`}
                  >
                    Company
                  </button>
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
                <span
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
                </span>
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
                 onClick={() => navigate("/signup")}
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
