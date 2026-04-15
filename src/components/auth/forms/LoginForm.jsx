import { useForm } from "react-hook-form";
import PasswordToggle from "../../common/PasswordToggle";

import loginImage from "../../../assets/images/auth/login.png";
import emailIcon from "../../../assets/images/auth/email.png";
import { Navigate } from "react-router";

export default function LoginForm() {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-[#E6E8EF] px-4">
      {/* ===== CARD ===== */}
      <div className="w-full md:w-3/4 bg-white rounded-[32px] shadow-[0px_8px_24px_rgba(23,26,30,0.15)] overflow-hidden flex my-6">
        {/* ===== LEFT IMAGE ===== */}
        <div className="hidden lg:flex w-1/2 items-center justify-start">
          <img src={loginImage} alt="login" className="h-full w-3/4" />
        </div>

        {/* ===== RIGHT FORM ===== */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            {/* ===== HEADER ===== */}
            <div className="text-center mb-8">
              <h1 className="font-bold text-[32px] leading-[48px] text-[#011C60]">
                Welcome Back
              </h1>
              <p className="text-[24px] leading-[40px] text-[#808DAF]">
                sign in to continue
              </p>
            </div>

            {/* ===== FORM ===== */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Identifier */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Username or Email or Phone Number"
                  {...register("identifier")}
                  className="
                    w-full h-[64px] rounded-[16px]
                     px-12
                    text-[18px] leading-[24px]
                      placeholder:text-[#808DAF] text-[#011C60]
                    border border-gray-200
                    focus:border-[#011C60] outline-none
                  "
                />

                <span className="absolute left-4 top-1/2 -translate-y-1/2">
                  <img src={emailIcon} alt="email" className="w-5 h-4" />
                </span>
              </div>

              {/* Password */}
              <PasswordToggle register={register} name="password" />

              {/* Forget Password */}
              <div className="text-right">
                <span
                  className="
                                text-[18px] leading-[24px] text-[#011C60] cursor-pointer
                                
                                relative inline-block
                                transition-all duration-300
                                
                                after:content-['']
                                after:absolute after:left-0 after:bottom-0
                                after:w-0 after:h-[2px]
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
                className="
                                w-full h-[64px]
                                rounded-[16px]
                                bg-[#011C60] text-white
                                text-[20px] font-semibold
                                shadow-[4px_8px_12px_0px_rgba(23,26,30,0.25)]
                                
                                transition-all duration-300 ease-in-out
                                hover:shadow-[0px_12px_24px_rgba(23,26,30,0.35)]
                                hover:-translate-y-[2px]
                                hover:bg-[#02237a]
                                active:scale-[0.98]
                                cursor-pointer
                            "
              >
                Sign in
              </button>

              {/* Footer */}
              <p className="text-center text-[18px] leading-[24px] text-[#808DAF]">
                Don’t have an account?{" "}
                <span
                 onClick={() => Navigate("signup")}
                  className="
                        text-[#011C60] font-semibold cursor-pointer
                        
                        relative inline-block
                        transition-all duration-300
                        
                        after:content-['']
                        after:absolute after:left-0 after:bottom-0
                        after:w-0 after:h-[2px]
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
