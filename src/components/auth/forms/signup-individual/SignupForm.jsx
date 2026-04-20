import { useState } from "react";
import { useNavigate } from "react-router-dom";

import IndividualStepOneInfo from "./StepOneInfo";
import IndividualStepThreeAddress from "./StepThreeAddress";
import IndividualStepTwoVerify from "./StepTwoVerify";
import CompanyStepOneInfo from "../signup-company/StepOneInfo";
import CompanyStepThreeAddress from "../signup-company/StepThreeAddress";
import CompanyStepTwoVerify from "../signup-company/StepTwoVerify";

import { registerUser, verifyOtp } from "../../../../api/auth/auth.api";

import signupImage from "../../../../assets/images/auth/signup.png";
import verifyImage from "../../../../assets/images/auth/veri.jpg";
import locationImage from "../../../../assets/images/auth/loca.jpg";

const appendIfPresent = (form, key, value) => {
  if (value !== undefined && value !== null && value !== "") {
    form.append(key, value);
  }
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
  if (Array.isArray(data?.errors)) {
    return data.errors.map(formatValidationError).join(", ");
  }

  return error?.message || "Something went wrong. Please try again.";
};

export default function SignupForm() {
  const [type, setType] = useState("individual");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  const navigate = useNavigate();

  const images = {
    1: signupImage,
    2: verifyImage,
    3: locationImage,
    4: verifyImage,
  };

  const titles = {
    1: type === "company" ? "Create Company Account" : "Create Your Account",
    2: "Verify Your Identity",
    3: "Add Address",
    4: "Verify Email",
  };

  const buildRegisterForm = (allData) => {
    const form = new FormData();

    appendIfPresent(form, "firstName", allData.firstName);
    appendIfPresent(form, "lastName", allData.lastName);
    appendIfPresent(form, "email", allData.email);
    appendIfPresent(form, "password", allData.password);
    appendIfPresent(form, "confirmPassword", allData.confirmPassword);
    appendIfPresent(form, "phone", allData.phone);
    appendIfPresent(form, "idNumber", allData.idNumber);

    form.append("lang", "en");
    form.append("permission", allData.permission || "service");

    appendIfPresent(form, "idImageFront", allData.front);
    appendIfPresent(form, "idImageBack", allData.back);
    appendIfPresent(form, "idImageSelfie", allData.selfie);

    appendIfPresent(form, "governorateId", allData.governorateId);
    appendIfPresent(form, "areaId", allData.areaId);
    appendIfPresent(form, "streetName", allData.streetName);
    appendIfPresent(form, "apartment", allData.apartment);
    appendIfPresent(form, "floorNumber", allData.floorNumber);
    appendIfPresent(form, "buildingNumber", allData.buildingNumber);
    appendIfPresent(form, "additionalDetails", allData.additionalDetails);

    return form;
  };

  const handleRegister = async (allData) => {
    setIsSubmitting(true);
    setApiError("");
    setApiSuccess("");

    try {
      const res = await registerUser(buildRegisterForm(allData));

      console.log("REGISTER RESPONSE", res);
      setRegisteredEmail(allData.email);
      localStorage.setItem("pendingSignupAccountType", type);
      setApiSuccess("Account created. Enter the OTP sent to your email.");
      setStep(4);
    } catch (error) {
      console.error("REGISTER API ERROR", error?.response?.data || error);
      setApiError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = (data = {}) => {
    const nextData = {
      ...formData,
      ...data,
    };

    console.log("STEP DATA", data);
    setFormData(nextData);
    setApiError("");
    setApiSuccess("");

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    handleRegister(nextData);
  };

  const handleAccountTypeChange = (nextType) => {
    setType(nextType);
    setFormData({});
    setApiError("");
    setApiSuccess("");
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    if (!otp.trim()) {
      setApiError("OTP is required");
      return;
    }

    setIsVerifyingOtp(true);
    setApiError("");
    setApiSuccess("");

    try {
      const res = await verifyOtp({
        email: registeredEmail || formData.email,
        otp: otp.trim(),
      });

      console.log("VERIFY OTP RESPONSE", res);
      setApiSuccess("Email verified successfully.");
      navigate("/login");
    } catch (error) {
      console.error("VERIFY OTP API ERROR", error);
      setApiError(getApiErrorMessage(error));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#E6E8EF] px-4 overflow-hidden">
      <div className="w-full max-w-6xl h-[85vh] bg-white rounded-4xl shadow-xl flex overflow-hidden">
        {/* LEFT */}
        <div className="w-full lg:w-1/2 px-2 sm:px-8 flex flex-col justify-center">
          {/* TITLE */}
          <h1 className="text-[22px] sm:text-[28px] font-bold text-[#011C60] mb-4 text-center">
            {titles[step]}
          </h1>

          {/* ACCOUNT TYPE */}
          {step === 1 && (
            <div className="flex justify-center">
              <div className="flex bg-[#E6E8EF] rounded-xl p-1 mb-6 text-sm sm:text-lg">
                <button
                  type="button"
                  onClick={() => handleAccountTypeChange("individual")}
                  className={`px-6 py-1.5 rounded-[10px] transition-all duration-300 cursor-pointer ${
                    type === "individual"
                      ? "bg-white text-[#011C60] shadow"
                      : "text-[#808DAF]"
                  }`}
                >
                  Individual
                </button>

                <button
                  type="button"
                  onClick={() => handleAccountTypeChange("company")}
                  className={`px-6 py-1.5 rounded-[10px] transition-all duration-300 cursor-pointer ${
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

          {apiError && (
            <p className="mb-3 text-center text-xs sm:text-sm text-red-500">
              {apiError}
            </p>
          )}

          {apiSuccess && (
            <p className="mb-3 text-center text-xs sm:text-sm text-[#06B217]">
              {apiSuccess}
            </p>
          )}

          {/* STEPS */}
          <div key={step}>
            {step === 1 && (
              type === "company" ? (
                <CompanyStepOneInfo onNext={handleNext} navigate={navigate} />
              ) : (
                <IndividualStepOneInfo
                  onNext={handleNext}
                  navigate={navigate}
                />
              )
            )}

            {step === 2 &&
              (type === "company" ? (
                <CompanyStepTwoVerify onNext={handleNext} />
              ) : (
                <IndividualStepTwoVerify onNext={handleNext} />
              ))}

            {step === 3 && (
              type === "company" ? (
                <CompanyStepThreeAddress
                  onNext={handleNext}
                  isSubmitting={isSubmitting}
                />
              ) : (
                <IndividualStepThreeAddress
                  onNext={handleNext}
                  isSubmitting={isSubmitting}
                />
              )
            )}

            {step === 4 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <p className="text-center text-[12px] sm:text-[16px] text-[#808DAF]">
                  We sent the OTP to {registeredEmail || formData.email}
                </p>

                <input
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="OTP Code"
                  className="
                    w-full h-12 sm:h-14 rounded-[14px] px-4
                    text-[12px] sm:text-[16px]
                    placeholder:text-[#808DAF] text-[#011C60]
                    border border-gray-200 focus:border-[#011C60]
                    outline-none
                  "
                />

                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="
                    w-full h-12 sm:h-16
                    rounded-[14px]
                    bg-[#011C60] text-white
                    text-[16px] sm:text-[20px] font-semibold
                    shadow-[4px_8px_12px_0px_rgba(23,26,30,0.25)]
                    transition-all duration-300
                    hover:-translate-y-0.5
                    hover:bg-[#02237a]
                    disabled:cursor-not-allowed disabled:opacity-70
                    cursor-pointer
                  "
                >
                  {isVerifyingOtp ? "Verifying..." : "Verify"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* IMAGE */}
        <div className="hidden lg:flex w-1/2 items-start justify-end">
          <img src={images[step]} alt="signup step" className="h-full object-contain" />
        </div>
      </div>
    </div>
  );
}
