import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import PasswordToggle from "../../../common/PasswordToggle";
import emailIcon from "../../../../assets/images/auth/email.png";

const NAME_PATTERN = /^[A-Za-z ]+$/;
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&+])\S{8,50}$/;

export default function StepOneInfo({
  onNext,
  navigate,
  onError,
  initialData = {},
}) {
  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: initialData,
  });

  const password = useWatch({
    control,
    name: "password",
  });

  useEffect(() => {
    if (password) {
      trigger("confirmPassword");
    }
  }, [password, trigger]);

  const onSubmit = (data) => {
    console.log("COMPANY STEP 1 DATA", data);
    onNext(data);
  };

  const handleInvalidSubmit = (formErrors) => {
    const firstError = Object.values(formErrors)[0];
    const message = firstError?.message || "Please complete the required fields.";

    onError?.(message);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)}
      className="space-y-4"
    >
      <div>
        <input
          placeholder="Company name"
          {...register("companyName", {
            required: "Company name is required",
            minLength: {
              value: 3,
              message: "Company name must be at least 3 characters",
            },
            maxLength: {
              value: 200,
              message: "Company name must be 200 characters or less",
            },
          })}
          className={`w-full h-12 sm:h-14 rounded-[14px]
          px-4 text-[12px] sm:text-[16px]
          placeholder:text-[#808DAF] text-[#011C60]
          border ${
            errors.companyName
              ? "border-red-500 focus:border-red-500"
              : "border-gray-200 focus:border-[#011C60]"
          }
          outline-none`}
        />
        {errors.companyName && (
          <span className="text-red-500 text-xs">
            {errors.companyName.message}
          </span>
        )}
      </div>

      <div className="flex gap-3">
        <div className="w-1/2">
          <input
            placeholder="Signatory first name"
            {...register("signatoryFirstName", {
              required: "Signatory first name is required",
              minLength: {
                value: 3,
                message: "First name must be at least 3 characters",
              },
              maxLength: {
                value: 50,
                message: "First name must be 50 characters or less",
              },
              pattern: {
                value: NAME_PATTERN,
                message: "First name can contain letters and spaces only",
              },
            })}
            className={`w-full h-12 sm:h-14 rounded-[14px]
            px-4 text-[12px] sm:text-[16px]
            placeholder:text-[#808DAF] text-[#011C60]
            border ${
              errors.signatoryFirstName
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-[#011C60]"
            }
            outline-none`}
          />
          {errors.signatoryFirstName && (
            <span className="text-red-500 text-xs">
              {errors.signatoryFirstName.message}
            </span>
          )}
        </div>

        <div className="w-1/2">
          <input
            placeholder="Signatory last name"
            {...register("signatoryLastName", {
              required: "Signatory last name is required",
              minLength: {
                value: 3,
                message: "Last name must be at least 3 characters",
              },
              maxLength: {
                value: 50,
                message: "Last name must be 50 characters or less",
              },
              pattern: {
                value: NAME_PATTERN,
                message: "Last name can contain letters and spaces only",
              },
            })}
            className={`w-full h-12 sm:h-14 rounded-[14px]
            px-4 text-[12px] sm:text-[16px]
            placeholder:text-[#808DAF] text-[#011C60]
            border ${
              errors.signatoryLastName
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-[#011C60]"
            }
            outline-none`}
          />
          {errors.signatoryLastName && (
            <span className="text-red-500 text-xs">
              {errors.signatoryLastName.message}
            </span>
          )}
        </div>
      </div>

      <div>
        <input
          placeholder="Phone Number"
          {...register("phone", {
            required: "Phone number is required",
            pattern: {
              value: /^01[0-9]{9}$/,
              message: "Phone number must be 11 digits and start with 01",
            },
          })}
          className={`w-full h-12 sm:h-14 rounded-[14px] px-4
          text-[12px] sm:text-[16px]
          placeholder:text-[#808DAF] text-[#011C60]
          border ${
            errors.phone
              ? "border-red-500 focus:border-red-500"
              : "border-gray-200 focus:border-[#011C60]"
          }
          outline-none`}
        />
        {errors.phone && (
          <span className="text-red-500 text-xs">
            {errors.phone.message}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          placeholder="Email"
          {...register("email", {
            required: "Email is required",
            maxLength: {
              value: 200,
              message: "Email must be 200 characters or less",
            },
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
          alt=""
          className="w-4 absolute left-4 top-1/2 -translate-y-1/2"
        />

        {errors.email && (
          <span className="text-red-500 text-xs">
            {errors.email.message}
          </span>
        )}
      </div>

      <div>
        <PasswordToggle
          register={register}
          name="password"
          validation={{
            required: "Password is required",
            pattern: {
              value: PASSWORD_PATTERN,
              message:
                "Password must include uppercase, lowercase, number, and one of @$!%*?&+",
            },
          }}
        />
        {errors.password && (
          <span className="text-red-500 text-xs">
            {errors.password.message}
          </span>
        )}
      </div>

      <div>
        <PasswordToggle
          register={register}
          name="confirmPassword"
          placeholder="Confirm Password"
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
