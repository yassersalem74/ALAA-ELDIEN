import { useForm } from "react-hook-form";
import emailIcon from "../../../../assets/images/auth/email.png";

export default function ForgotPasswordEmailStep({
  initialEmail = "",
  error = "",
  isSubmitting,
  navigate,
  onClearError,
  onSubmit,
  onValidationError,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      email: initialEmail,
    },
  });

  const handleInvalidSubmit = (formErrors) => {
    const firstError = Object.values(formErrors)[0];
    const message = firstError?.message || "Please complete the required fields.";

    onValidationError?.(message);
  };

  return (
    <form
      onSubmit={handleSubmit(({ email }) => onSubmit(email), handleInvalidSubmit)}
      className="space-y-6"
    >
      {error && (
        <p className="text-center text-xs sm:text-sm text-red-500">{error}</p>
      )}

      <div>
        <div className="relative">
          <input
            type="email"
            autoComplete="email"
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Invalid email format",
              },
              onChange: () => onClearError?.(),
            })}
            className={`w-full h-12 rounded-2xl px-12 text-[14px] leading-6 placeholder:text-[#808DAF] text-[#011C60] border ${
              errors.email
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-[#011C60]"
            } outline-none sm:h-16 sm:text-[18px]`}
          />

          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <img src={emailIcon} alt="email" className="h-4 w-5" />
          </span>
        </div>

        {errors.email && (
          <span className="text-xs text-red-500">{errors.email.message}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 rounded-2xl bg-[#011C60] text-[16px] font-semibold text-white shadow-[4px_8px_12px_0px_rgba(23,26,30,0.25)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#02237a] hover:shadow-[0px_12px_24px_rgba(23,26,30,0.35)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer sm:h-16 sm:text-[20px]"
      >
        {isSubmitting ? "Sending OTP..." : "Send OTP"}
      </button>

      <p className="text-center text-[14px] leading-6 text-[#808DAF] sm:text-[18px]">
        Remember your password?{" "}
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
