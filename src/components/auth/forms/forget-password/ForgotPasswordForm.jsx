import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../../../common/Toast";
import {
  forgetPassword,
  resetPassword,
} from "../../../../api/auth/auth.api";
import ForgotPasswordEmailStep from "./ForgotPasswordEmailStep";
import ForgotPasswordOtpStep from "./ForgotPasswordOtpStep";
import ForgotPasswordResetStep from "./ForgotPasswordResetStep";
import ForgotPasswordSuccessModal from "./ForgotPasswordSuccessModal";
import forgotPasswordImage from "../../../../assets/images/auth/reset-password/forget-password.jfif";
import forgotPasswordOtpImage from "../../../../assets/images/auth/reset-password/forgt-opt-verify.jfif";
import resetPasswordImage from "../../../../assets/images/auth/reset-password/reset.jfif";
import otpSentSuccessImage from "../../../../assets/images/auth/reset-password/verify-sent-otp-email.jfif";
import passwordResetSuccessImage from "../../../../assets/images/auth/reset-password/pasword-successfully.jfif";

const STEP_CONTENT = {
  1: {
    title: "Forgot Password",
    subtitle: "Enter your email to receive a 4 digit code.",
    image: forgotPasswordImage,
  },
  2: {
    title: "Verify OTP",
    subtitle: "Use the code sent to your email to continue.",
    image: forgotPasswordOtpImage,
  },
  3: {
    title: "Create New Password",
    subtitle: "Choose a secure password for your account.",
    image: resetPasswordImage,
  },
};

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
  if (typeof data?.error?.message === "string") return data.error.message;
  if (Array.isArray(data?.errors)) {
    return data.errors.map(formatValidationError).join(", ");
  }

  return error?.message || "Something went wrong. Please try again.";
};

export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [apiError, setApiError] = useState("");
  const [activePopup, setActivePopup] = useState("");
  const [toast, setToast] = useState(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSavingOtp, setIsSavingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const showToast = (type, message) => {
    setToast({
      id: Date.now(),
      type,
      message,
    });
  };

  const handlePopupClose = () => {
    if (activePopup === "otp-sent") {
      setStep(2);
    }

    if (activePopup === "password-reset") {
      navigate("/login", { replace: true });
    }

    setActivePopup("");
  };

  const handleValidationError = (message) => {
    showToast("error", message);
  };

  const handleSendOtp = async (submittedEmail) => {
    setIsSendingOtp(true);
    setApiError("");

    try {
      await forgetPassword({ email: submittedEmail });
      setEmail(submittedEmail);
      setOtpCode("");
      setActivePopup("otp-sent");
    } catch (error) {
      const message = getApiErrorMessage(error);

      setApiError(message);
      showToast("error", message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      const message = "Missing email address for password reset.";

      setApiError(message);
      showToast("error", message);
      return;
    }

    setIsResendingOtp(true);
    setApiError("");

    try {
      await forgetPassword({ email });
      setActivePopup("otp-sent");
    } catch (error) {
      const message = getApiErrorMessage(error);

      setApiError(message);
      showToast("error", message);
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleSaveOtp = (submittedOtpCode) => {
    setIsSavingOtp(true);
    setApiError("");

    setOtpCode(submittedOtpCode);
    setStep(3);
    setIsSavingOtp(false);
  };

  const handleResetPassword = async (newPassword) => {
    setIsResettingPassword(true);
    setApiError("");

    try {
      await resetPassword({
        newPassword,
        email,
        code: otpCode,
      });

      setActivePopup("password-reset");
    } catch (error) {
      const message = getApiErrorMessage(error);

      setApiError(message);
      showToast("error", message);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const currentStep = STEP_CONTENT[step];

  return (
    <div className="min-h-screen flex items-start justify-center bg-[#E6E8EF] px-4">
      <Toast
        key={toast?.id}
        type={toast?.type}
        message={toast?.message}
        onClose={() => setToast(null)}
      />

      {activePopup === "otp-sent" && (
        <ForgotPasswordSuccessModal
          image={otpSentSuccessImage}
          title="OTP Sent Successfully"
          message={`We sent a 4 digit code to ${email}.`}
          onClose={handlePopupClose}
        />
      )}

      {activePopup === "password-reset" && (
        <ForgotPasswordSuccessModal
          image={passwordResetSuccessImage}
          title="Password Reset Successfully"
          message="Your password has been updated. You can sign in to your account now."
          onClose={handlePopupClose}
        />
      )}

      <div className="my-6 flex w-full overflow-hidden rounded-4xl bg-white shadow-[0px_8px_24px_rgba(23,26,30,0.15)] md:w-3/4">
        <div className="hidden w-1/2 items-center justify-start lg:flex">
          <img
            src={currentStep.image}
            alt={currentStep.title}
            className="h-full w-3/4 object-contain"
          />
        </div>

        <div className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2">
          <div className="w-full max-w-md" key={step}>
            <div className="mb-8 text-center">
              <h1 className="text-[32px] font-bold leading-12 text-[#011C60]">
                {currentStep.title}
              </h1>
              <p className="text-[24px] leading-10 text-[#808DAF]">
                {currentStep.subtitle}
              </p>
            </div>

            {step === 1 && (
              <ForgotPasswordEmailStep
                initialEmail={email}
                error={apiError}
                isSubmitting={isSendingOtp}
                navigate={navigate}
                onClearError={() => setApiError("")}
                onSubmit={handleSendOtp}
                onValidationError={handleValidationError}
              />
            )}

            {step === 2 && (
              <ForgotPasswordOtpStep
                email={email}
                error={apiError}
                initialCode={otpCode}
                isResending={isResendingOtp}
                isSubmitting={isSavingOtp}
                navigate={navigate}
                onBack={() => {
                  setApiError("");
                  setStep(1);
                }}
                onClearError={() => setApiError("")}
                onResend={handleResendOtp}
                onSubmit={handleSaveOtp}
              />
            )}

            {step === 3 && (
              <ForgotPasswordResetStep
                email={email}
                error={apiError}
                isSubmitting={isResettingPassword}
                navigate={navigate}
                onBack={() => {
                  setApiError("");
                  setStep(2);
                }}
                onClearError={() => setApiError("")}
                onSubmit={handleResetPassword}
                onValidationError={handleValidationError}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
