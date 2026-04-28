import { useState } from "react";

const getOtpDigits = (code = "") => {
  const normalizedCode = `${code}`.slice(0, 4).split("");

  return [
    normalizedCode[0] || "",
    normalizedCode[1] || "",
    normalizedCode[2] || "",
    normalizedCode[3] || "",
  ];
};

export default function ForgotPasswordOtpStep({
  email,
  error = "",
  initialCode = "",
  isResending,
  isSubmitting,
  navigate,
  onBack,
  onClearError,
  onResend,
  onSubmit,
}) {
  const [otp, setOtp] = useState(() => getOtpDigits(initialCode));
  const [localError, setLocalError] = useState("");

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setLocalError("");
    onClearError?.();

    if (value && index < 3) {
      const nextInput = document.getElementById(`forgot-password-otp-${index + 1}`);

      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      const previousInput = document.getElementById(
        `forgot-password-otp-${index - 1}`
      );

      if (previousInput) previousInput.focus();
    }
  };

  const handlePaste = (event) => {
    const pastedValue = event.clipboardData.getData("text").replace(/\D/g, "");

    if (!pastedValue) return;

    event.preventDefault();

    const nextOtp = pastedValue.slice(0, 4).split("");
    setOtp([
      nextOtp[0] || "",
      nextOtp[1] || "",
      nextOtp[2] || "",
      nextOtp[3] || "",
    ]);
    setLocalError("");
    onClearError?.();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const otpCode = otp.join("");

    if (otpCode.length !== 4) {
      setLocalError("Please enter all 4 digits");
      return;
    }

    onSubmit(otpCode);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="text-center">
        <p className="text-[14px] text-[#808DAF]">
          Enter the 4 digit code sent to {email || "your email"}.
        </p>
      </div>

      {(localError || error) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-center">
          <p className="text-[12px] font-medium text-red-600">
            {localError || error}
          </p>
        </div>
      )}

      <div className="flex justify-center gap-3 sm:gap-4">
        {[0, 1, 2, 3].map((index) => (
          <input
            key={index}
            id={`forgot-password-otp-${index}`}
            type="text"
            inputMode="numeric"
            maxLength="1"
            value={otp[index]}
            onChange={(event) => handleOtpChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            className="h-[72px] w-[72px] rounded-[12px] bg-[#E6E8EF] text-center text-[28px] font-bold text-[#011C60] outline-none transition-all focus:ring-2 focus:ring-[#011C60] sm:h-[100px] sm:w-[100px] sm:text-[32px]"
          />
        ))}
      </div>

      <div className="text-center">
        <p className="text-[12px] text-[#808DAF]">
          Don't receive the OTP?{" "}
          <button
            type="button"
            disabled={isResending}
            className="font-semibold text-[#011C60] hover:cursor-pointer hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            onClick={async () => {
              setLocalError("");
              onClearError?.();
              await onResend?.();
            }}
          >
            {isResending ? "RESENDING..." : "RESEND"}
          </button>
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || otp.some((digit) => !digit)}
        className="w-full h-[56px] rounded-[14px] bg-[#011C60] text-[16px] font-semibold text-white shadow-[4px_8px_12px_0px_rgba(23,26,30,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#02237a] hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Checking..." : "Next"}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="mx-auto text-[14px] font-semibold text-[#011C60] transition-all duration-300 hover:text-[#02237a] hover:underline"
      >
        Change email
      </button>

      <p className="text-center text-[14px] leading-6 text-[#808DAF] sm:text-[18px]">
        Back to{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="relative inline-block cursor-pointer font-semibold text-[#011C60] transition-all duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#011C60] after:transition-all after:duration-300 hover:text-[#02237a] hover:after:w-full"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
