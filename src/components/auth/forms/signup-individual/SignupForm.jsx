import { useState } from "react";
import { useNavigate } from "react-router-dom";

import IndividualStepOneInfo from "./StepOneInfo";
import IndividualStepThreeAddress from "./StepThreeAddress";
import IndividualStepTwoVerify from "./StepTwoVerify";
import CompanyStepOneInfo from "../signup-company/StepOneInfo";
import CompanyStepThreeAddress from "../signup-company/StepThreeAddress";
import CompanyStepTwoVerify from "../signup-company/StepTwoVerify";
import VerificationForm from "../VerificationForm";
import Toast from "../../../common/Toast";

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

const getAccountName = (data, type) => {
  if (type === "company") {
    return data.firstName || "company account";
  }

  return [data.firstName, data.lastName].filter(Boolean).join(" ");
};

export default function SignupForm() {
  const [type, setType] = useState("individual");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [toast, setToast] = useState(null);

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
    form.append("accountType", type);
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

  const showToast = (type, message) => {
    setToast({
      id: Date.now(),
      type,
      message,
    });
  };

  const handleStepError = (message) => {
    showToast("error", message);
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

      const accountName = getAccountName(allData, type);
      const message = `Signed up successfully as ${type} with name: ${accountName}. Enter the OTP sent to ${allData.email}.`;

      setApiSuccess(message);
      showToast("success", message);
      setStep(4);
    } catch (error) {
      console.error("REGISTER API ERROR", error?.response?.data || error);
      const message = getApiErrorMessage(error);

      setApiError(message);
      showToast("error", message);
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

  return (
    <div className="h-screen flex items-center justify-center bg-[#E6E8EF] px-4 overflow-hidden">
      <Toast
        key={toast?.id}
        type={toast?.type}
        message={toast?.message}
        onClose={() => setToast(null)}
      />

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
                <CompanyStepOneInfo
                  onNext={handleNext}
                  navigate={navigate}
                  onError={handleStepError}
                />
              ) : (
                <IndividualStepOneInfo
                  onNext={handleNext}
                  navigate={navigate}
                  onError={handleStepError}
                />
              )
            )}

            {step === 2 &&
              (type === "company" ? (
                <CompanyStepTwoVerify
                  onNext={handleNext}
                  onError={handleStepError}
                />
              ) : (
                <IndividualStepTwoVerify
                  onNext={handleNext}
                  onError={handleStepError}
                />
              ))}

            {step === 3 && (
              type === "company" ? (
                <CompanyStepThreeAddress
                  onNext={handleNext}
                  isSubmitting={isSubmitting}
                  onError={handleStepError}
                />
              ) : (
                <IndividualStepThreeAddress
                  onNext={handleNext}
                  isSubmitting={isSubmitting}
                  onError={handleStepError}
                />
              )
            )}

            {step === 4 && (
              <VerificationForm
                isVerifying={isVerifyingOtp}
                error={apiError}
                onVerify={async (otpCode) => {
                  setIsVerifyingOtp(true);
                  setApiError("");
                  setApiSuccess("");

                  try {
                    const res = await verifyOtp({
                      email: registeredEmail || formData.email,
                      otp: otpCode,
                    });

                    console.log("VERIFY OTP RESPONSE", res);
                    const message = `Email verified successfully for ${
                      registeredEmail || formData.email
                    }. You can sign in now.`;

                    setApiSuccess(message);
                    showToast("success", message);

                    setTimeout(() => {
                      navigate("/login");
                    }, 1000);
                  } catch (error) {
                    console.error("VERIFY OTP API ERROR", error?.response?.data || error);
                    const message = getApiErrorMessage(error);

                    setApiError(message);
                    showToast("error", message);
                    throw error;
                  } finally {
                    setIsVerifyingOtp(false);
                  }
                }}
                onClose={() => {
                  // Close logic if needed
                  navigate("/login");
                }}
              />
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
