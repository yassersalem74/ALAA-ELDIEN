import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import PasswordToggle from "../../../common/PasswordToggle";

export default function ForgotPasswordResetStep({
  email,
  error = "",
  isSubmitting,
  navigate,
  onBack,
  onClearError,
  onSubmit,
  onValidationError,
}) {
  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const password = useWatch({
    control,
    name: "newPassword",
  });

  useEffect(() => {
    if (password) {
      trigger("confirmPassword");
    }
  }, [password, trigger]);

  const handleInvalidSubmit = (formErrors) => {
    const firstError = Object.values(formErrors)[0];
    const message = firstError?.message || "Please complete the required fields.";

    onValidationError?.(message);
  };

  return (
    <form
      onSubmit={handleSubmit(
        ({ newPassword }) => onSubmit(newPassword),
        handleInvalidSubmit
      )}
      className="space-y-6"
    >
      <div className="text-center">
        <p className="text-[14px] text-[#808DAF]">
          Create a new password for {email || "your account"}.
        </p>
      </div>

      {error && (
        <p className="text-center text-xs sm:text-sm text-red-500">{error}</p>
      )}

      <div>
        <PasswordToggle
          register={register}
          name="newPassword"
          placeholder="New Password"
          validation={{
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
              message:
                "Password must include uppercase, lowercase, number, and symbol",
            },
            onChange: () => onClearError?.(),
          }}
        />
        {errors.newPassword && (
          <span className="text-xs text-red-500">
            {errors.newPassword.message}
          </span>
        )}
      </div>

      <div>
        <PasswordToggle
          register={register}
          name="confirmPassword"
          placeholder="Confirm New Password"
          validation={{
            required: "Confirm password is required",
            validate: (value) => {
              if (!value) return "Confirm password is required";
              if (value !== password) return "Passwords do not match";
              return true;
            },
            onChange: () => onClearError?.(),
          }}
        />
        {errors.confirmPassword && (
          <span className="text-xs text-red-500">
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 rounded-2xl bg-[#011C60] text-[16px] font-semibold text-white shadow-[4px_8px_12px_0px_rgba(23,26,30,0.25)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#02237a] hover:shadow-[0px_12px_24px_rgba(23,26,30,0.35)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer sm:h-16 sm:text-[20px]"
      >
        {isSubmitting ? "Resetting..." : "Reset Password"}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="mx-auto block text-[14px] font-semibold text-[#011C60] transition-all duration-300 hover:text-[#02237a] hover:underline"
      >
        Back to OTP
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
