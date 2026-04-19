import { useForm } from "react-hook-form";
import PasswordToggle from "../../../common/PasswordToggle";
import emailIcon from "../../../../assets/images/auth/email.png";

export default function SignupIndividualForm({ onNext, navigate }) {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {/* Names */}
      <div className="flex gap-3">
        <input
          placeholder="First name"
          {...register("firstName")}
          className="w-1/2 h-[48px] rounded-[14px]
           px-4 text-[16px]
          placeholder:text-[#808DAF] text-[#011C60]
          border border-gray-200 focus:border-[#011C60] outline-none"
        />

        <input
          placeholder="Last name"
          {...register("lastName")}
          className="w-1/2 h-[48px] rounded-[14px]
           px-4 text-[16px]
          placeholder:text-[#808DAF] text-[#011C60]
          border border-gray-200 focus:border-[#011C60] outline-none"
        />
      </div>

      {/* Identifier */}
      <div className="relative">
        <input
          placeholder="Username or Email or Phone Number"
          {...register("identifier")}
          className="w-full h-[48px] rounded-[14px] px-12
          text-[16px]
          placeholder:text-[#808DAF] text-[#011C60]
          border border-gray-200 focus:border-[#011C60] outline-none"
        />
        <img
          src={emailIcon}
          className="w-4 absolute left-4 top-1/2 -translate-y-1/2"
        />
      </div>

      {/* Password */}
      <PasswordToggle register={register} name="password"  className="w-[48px]"/>

      {/* Confirm */}
      <PasswordToggle register={register} name="confirmPassword" className="w-[48px]" />

      {/* Button */}
      <button
        type="submit"
        className="
          w-full h-[56px]
          rounded-[14px]
          bg-[#011C60] text-white
          text-[18px] font-semibold
          shadow-[4px_8px_12px_0px_rgba(23,26,30,0.25)]
          transition-all duration-300
          hover:-translate-y-[2px]
          hover:bg-[#02237a]
        "
      >
        Next
      </button>

      {/* Footer */}
      <p className="text-center text-[16px] text-[#808DAF]">
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login")}
          className="text-[#011C60] font-semibold cursor-pointer
          hover:underline"
        >
          Sign in
        </span>
      </p>

    </form>
  );
}
