import { useState } from "react";
import { useNavigate } from "react-router-dom";

import StepOneInfo from "./StepOneInfo";
import SignupCompanyForm from "../signup-company/SignupCompanyForm";
import StepThreeAddress from "./StepThreeAddress";
import StepTwoVerify from './StepTwoVerify';

import signupImage from "../../../../assets/images/auth/signup.png";
import verifyImage from "../../../../assets/images/auth/veri.jpg";
import locationImage from "../../../../assets/images/auth/loca.jpg";

export default function SignupForm() {
  const [type, setType] = useState("individual");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const images = {
    1: signupImage,
    2: verifyImage,
    3: locationImage,
  };

  const handleNext = (data) => {
    console.log("STEP DATA:", data);
    if (step < 3) setStep(step + 1);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#E6E8EF] px-4 overflow-hidden">
      <div className="w-full max-w-6xl h-[85vh] bg-white rounded-4xl shadow-xl flex overflow-hidden">
        {/* LEFT */}
        <div className="w-full lg:w-1/2 px-2 sm:px-8 flex flex-col justify-center">
          <h1 className="text-[22px] sm:text-[28px] font-bold text-[#011C60] mb-4 text-center">
            {step === 1 && "Create Your Account"}
            {step === 2 && "Verify Your Identity"}
            {step === 3 && "Add Address"}
          </h1>

          {/* STEPS */}
<div className="flex justify-center mb-4">

  <div className="flex items-center gap-6 mx-auto">

    {[1, 2, 3].map((s, index) => {
      const isActive = step === s;
      const isCompleted = step > s;

      return (
        <div
          key={s}
          onClick={() => setStep(s)}
          className="flex items-center cursor-pointer"
        >
          {/* CIRCLE */}
          <div
            className={`
              relative flex items-center justify-center
              w-8 h-8 sm:w-12 sm:h-12 rounded-full
              text-sm font-bold
              transition-all duration-500

              ${
                isCompleted
                  ? "bg-[#06B217] text-white"
                  : isActive
                  ? "border-2 border-[#06B217] text-[#06B217]"
                  : "border-2 border-gray-300 text-gray-400"
              }
            `}
          >
            {isCompleted ? "✓" : s}
          </div>

          {/* LINE */}
          {index !== 2 && (
            <div className="w-16 h-0.5 mx-2 border-t-2 border-dotted border-gray-300 relative">
              
              {/* active line */}
              <div
                className={`
                  absolute top-0 left-0 h-full border-t-2 border-dotted border-[#06B217]
                  transition-all duration-500
                  ${step > s ? "w-full" : "w-0"}
                `}
              />
            </div>
          )}
        </div>
      );
    })}

  </div>
</div>

          {/* STEP 1 SWITCH */}
          {step === 1 && (
            <div className="flex justify-center">
              <div className="flex bg-[#E6E8EF] rounded-xl p-1 mb-6 text-sm sm:text-lg">
                <button
                  onClick={() => setType("individual")}
                  className={`px-6 py-1.5 rounded-[10px] cursor-pointer ${
                    type === "individual"
                      ? "bg-white text-[#011C60] shadow"
                      : "text-[#808DAF]"
                  }`}
                >
                  Individual
                </button>

                <button
                  onClick={() => setType("company")}
                  className={`px-6 py-1.5 rounded-[10px] cursor-pointer ${
                    type === "company"
                      ? "bg-white text-[#011C60] shadow"
                      : "text-[#808DAF]"
                  }`}
                >
                  Company
                </button>
              </div>
            </div>
          )}

          {/* CONTENT */}
          <div
            key={step}
            className="
    transition-all duration-500 ease-out
    animate-[stepFade_0.5s_ease]
  "
          >
            {step === 1 &&
              (type === "individual" ? (
                <StepOneInfo onNext={handleNext} navigate={navigate} />
              ) : (
                <SignupCompanyForm onNext={handleNext} navigate={navigate} />
              ))}

            {step === 2 && <StepTwoVerify onNext={handleNext} />}
            {step === 3 && <StepThreeAddress onNext={handleNext} />}
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="hidden lg:flex w-1/2 items-start justify-end">
          <img
            src={images[step]}
            alt="step"
            className="h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
