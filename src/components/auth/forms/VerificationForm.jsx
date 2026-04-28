import { useState } from "react";
import verifyBackgroundImage from "../../../assets/images/auth/verify-background.png";
import verifyShieldImage from "../../../assets/images/auth/verify-shield.png";
import verifyDoneImage from "../../../assets/images/auth/verify-done.png";

export default function VerificationForm({
  isVerifying,
  onVerify,
  onResend,
  onClose,
  error = "",
}) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isVerified, setIsVerified] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only keep the last digit
    setOtp(newOtp);
    setLocalError(""); // Clear error when user types

    // Auto-focus to next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 4) {
      setLocalError("Please enter all 4 digits");
      return;
    }

    try {
      await onVerify(otpCode);
      setIsVerified(true);

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose?.();
      }, 2000);
    } catch (error) {
      console.error("Verification failed:", error);
      setLocalError(error?.message || "Verification failed. Please try again.");
      setOtp(["", "", "", ""]);
    }
  };

  if (isVerified) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          backgroundImage: `url(${verifyBackgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="w-[592px] h-[627px] rounded-[24px] border-[0.5px] border-gray-300 p-6 flex flex-col items-center justify-center gap-9 bg-white">
          <img
            src={verifyDoneImage}
            alt="Verification Done"
            className="w-[200px] h-[175px] object-contain"
          />

          <div className="text-center">
            <h2 className="text-[24px] font-bold text-[#011C60] mb-2">
              Your account is verified
            </h2>
            <p className="text-[14px] text-[#808DAF]">
              You can now sign in to your account
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundImage: `url(${verifyBackgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "top",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-[592px] h-[627px] rounded-[24px] border-[0.5px] border-gray-300 p-6 flex flex-col items-center justify-center gap-9 bg-white">
        {/* Shield Icon */}
        <img
          src={verifyShieldImage}
          alt="Verify Shield"
          className="w-[200px] h-[175px] object-contain"
        />

        {/* Title */}
        <div className="text-center">
          <h2 className="text-[28px] font-bold text-[#011C60] mb-2">
            Verify your email
          </h2>
          <p className="text-[14px] text-[#808DAF]">
            Enter the 4 digit code sent to your email.
          </p>
        </div>

        {/* OTP Input Fields */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          {/* Error Message */}
          {(localError || error) && (
            <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="text-[12px] text-red-600 font-medium">
                {localError || error}
              </p>
            </div>
          )}

          <div className="flex justify-center gap-4">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={otp[index]}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="
                  w-[100px] h-[100px]
                  rounded-[12px]
                  bg-[#E6E8EF]
                  text-center text-[32px] font-bold
                  text-[#011C60]
                  border-none outline-none
                  focus:ring-2 focus:ring-[#011C60]
                  transition-all
                "
              />
            ))}
          </div>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-[12px] text-[#808DAF]">
              Don't receive the OTP?{" "}
              <button
                type="button"
                className="text-[#011C60] font-semibold hover:underline hover:cursor-pointer"
                onClick={async () => {
                  setOtp(["", "", "", ""]);
                  setLocalError("");
                  await onResend?.();
                }}
              >
                RESEND
              </button>
            </p>
          </div>

          {/* Next Button */}
          <button
            type="submit"
            disabled={isVerifying || otp.some((digit) => !digit)}
            className="
              w-full h-[56px]
              rounded-[14px]
              bg-[#011C60] text-white
              text-[16px] font-semibold
              shadow-[4px_8px_12px_0px_rgba(23,26,30,0.25)]
              transition-all duration-300
              hover:-translate-y-0.5
              hover:bg-[#02237a]
              hover:cursor-pointer
              disabled:cursor-not-allowed disabled:opacity-60
            "
          >
            {isVerifying ? "Verifying..." : "Next"}
          </button>
        </form>
      </div>
    </div>
  );
}
