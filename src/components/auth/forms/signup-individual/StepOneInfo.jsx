import { useForm } from "react-hook-form";
import { useEffect } from "react";
import PasswordToggle from "../../../common/PasswordToggle";
import emailIcon from "../../../../assets/images/auth/email.png";

export default function StepOneInfo({ onNext, navigate }) {
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const password = watch("password");

  // 🔥 revalidate confirm password when password changes
  useEffect(() => {
    if (password) {
      trigger("confirmPassword");
    }
  }, [password, trigger]);

  const onSubmit = (data) => {
    console.log("STEP 1 DATA ✅", data);
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {/* Names */}
      <div className="flex gap-3">
        <div className="w-1/2">
          <input
            placeholder="First name"
            {...register("firstName", {
              required: "First name is required",
            })}
            className={`w-full h-12 sm:h-14 rounded-[14px]
            px-4 text-[12px] sm:text-[16px]
            placeholder:text-[#808DAF] text-[#011C60]
            border ${
              errors.firstName
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-[#011C60]"
            }
            outline-none`}
          />
          {errors.firstName && (
            <span className="text-red-500 text-xs">
              {errors.firstName.message}
            </span>
          )}
        </div>

        <div className="w-1/2">
          <input
            placeholder="Last name"
            {...register("lastName", {
              required: "Last name is required",
            })}
            className={`w-full h-12 sm:h-14 rounded-[14px]
            px-4 text-[12px] sm:text-[16px]
            placeholder:text-[#808DAF] text-[#011C60]
            border ${
              errors.lastName
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-[#011C60]"
            }
            outline-none`}
          />
          {errors.lastName && (
            <span className="text-red-500 text-xs">
              {errors.lastName.message}
            </span>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="relative">
        <input
          placeholder="Email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Invalid email format",
            },
          })}
          className={`w-full h-12 sm:h-14 rounded-[14px] px-12
          text-[12px] sm:text-[16px]
          placeholder:text-[#808DAF] text-[#011C60]
          border ${
            errors.email
              ? "border-red-500 focus:border-red-500"
              : "border-gray-200 focus:border-[#011C60]"
          }
          outline-none`}
        />
        <img
          src={emailIcon}
          className="w-4 absolute left-4 top-1/2 -translate-y-1/2"
        />

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
            minLength: {
              value: 6,
              message: "Min 6 characters",
            },
          }}
        />
        {errors.password && (
          <span className="text-red-500 text-xs">
            {errors.password.message}
          </span>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <PasswordToggle
          register={register}
          name="confirmPassword"
          validation={{
            required: "Confirm password is required",
            validate: (value) => {
              if (!value) return "Confirm password is required";
              if (value !== password) return "Passwords do not match";
              return true;
            },
          }}
        />
        {errors.confirmPassword && (
          <span className="text-red-500 text-xs">
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      {/* Button */}
      <button
        type="submit"
        className="
          w-full h-12 sm:h-16
          rounded-[14px]
          bg-[#011C60] text-white
          text-[16px] sm:text-[20px] font-semibold
          shadow-[4px_8px_12px_0px_rgba(23,26,30,0.25)]
          transition-all duration-300
          hover:-translate-y-0.5
          hover:bg-[#02237a]
          cursor-pointer
        "
      >
        Next
      </button>

      {/* Footer */}
      <p className="text-center text-[12px] sm:text-[16px] text-[#808DAF]">
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login")}
          className="text-[#011C60] font-semibold cursor-pointer hover:underline"
        >
          Sign in
        </span>
      </p>

    </form>
  );
}