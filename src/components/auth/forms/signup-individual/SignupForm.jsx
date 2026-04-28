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

import {
  registerUser,
  resendEmailVerification,
  verifyEmail,
} from "../../../../api/auth/auth.api";

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
  if (typeof data?.error?.message === "string") return data.error.message;
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

const signupSteps = [
  { number: 1, label: "Account" },
  { number: 2, label: "Identity" },
  { number: 3, label: "Address" },
];

const hasValue = (value) => value !== undefined && value !== null && value !== "";

export default function SignupForm() {
  const [type, setType] = useState("individual");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [invalidSteps, setInvalidSteps] = useState([]);
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
    appendIfPresent(form, "phoneNumber", allData.phone);
    appendIfPresent(form, "nationalId", allData.idNumber);

    form.append("language", "en");

    appendIfPresent(form, "frontImageNationalId", allData.front);
    appendIfPresent(form, "backImageNationalId", allData.back);
    appendIfPresent(form, "selfieImageNationalId", allData.selfie);
    appendIfPresent(form, "profileImage", allData.profileImage);

    appendIfPresent(form, "governorateId", allData.governorateId);
    appendIfPresent(form, "neighborhoodId", allData.areaId);
    appendIfPresent(form, "street", allData.streetName);
    appendIfPresent(form, "apartment", allData.apartment);
    appendIfPresent(form, "floor", allData.floorNumber);
    appendIfPresent(form, "building", allData.buildingNumber);
    appendIfPresent(form, "details", allData.additionalDetails);

    return form;
  };

  const isStepComplete = (stepNumber, data = formData) => {
    if (stepNumber === 1) {
      const requiredFields =
        type === "company"
          ? [
              "firstName",
              "lastName",
              "phone",
              "email",
              "permission",
              "password",
              "confirmPassword",
            ]
          : [
              "firstName",
              "lastName",
              "phone",
              "email",
              "password",
              "confirmPassword",
            ];

      return (
        requiredFields.every((field) => hasValue(data[field])) &&
        data.password === data.confirmPassword
      );
    }

    if (stepNumber === 2) {
      return (
        /^[0-9]{14}$/.test(data.idNumber || "") &&
        hasValue(data.front) &&
        hasValue(data.back) &&
        hasValue(data.selfie)
      );
    }

    if (stepNumber === 3) {
      return [
        "governorateId",
        "areaId",
        "streetName",
        "buildingNumber",
        "floorNumber",
        "apartment",
      ].every((field) => hasValue(data[field]));
    }

    return false;
  };

  const clearInvalidStep = (stepNumber) => {
    setInvalidSteps((currentInvalidSteps) =>
      currentInvalidSteps.filter((invalidStep) => invalidStep !== stepNumber)
    );
  };

  const showToast = (type, message) => {
    setToast({
      id: Date.now(),
      type,
      message,
    });
  };

  const handleStepError = (message) => {
    setInvalidSteps((currentInvalidSteps) =>
      currentInvalidSteps.includes(step)
        ? currentInvalidSteps
        : [...currentInvalidSteps, step]
    );
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
      const message = `Signed up successfully as ${type} with name: ${accountName}. Enter the verification code sent to ${allData.email}.`;

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
    clearInvalidStep(step);
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
    setInvalidSteps([]);
    setApiError("");
    setApiSuccess("");
  };

  const handleStepClick = (targetStep) => {
    if (targetStep === step || isSubmitting || isVerifyingOtp) return;

    const incompleteSteps = signupSteps
      .map(({ number }) => number)
      .filter(
        (stepNumber) =>
          (stepNumber === step || stepNumber < targetStep) &&
          !isStepComplete(stepNumber)
      );

    setInvalidSteps((currentInvalidSteps) => {
      const nextInvalidSteps = new Set(currentInvalidSteps);

      signupSteps.forEach(({ number }) => {
        if (isStepComplete(number)) {
          nextInvalidSteps.delete(number);
        }
      });

      incompleteSteps.forEach((stepNumber) => {
        nextInvalidSteps.add(stepNumber);
      });

      return [...nextInvalidSteps];
    });
    setStep(targetStep);
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
        <div className="w-full lg:w-1/2 px-2 sm:px-8 flex flex-col justify-center overflow-y-auto">
          {/* TITLE */}
          <h1 className="text-[22px] sm:text-[28px] font-bold text-[#011C60] mb-4 text-center">
            {titles[step]}
          </h1>

          <div
            className="mx-auto mb-5 w-full max-w-sm"
            aria-label="Sign up progress"
          >
            <div className="grid grid-cols-3 gap-2">
              {signupSteps.map(({ number, label }) => {
                const isCompleted = step > number;
                const isActive = step === number;
                const isInvalid = invalidSteps.includes(number);

                return (
                  <button
                    type="button"
                    key={number}
                    onClick={() => handleStepClick(number)}
                    className="min-w-0 text-center cursor-pointer"
                    disabled={isSubmitting || isVerifyingOtp}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <div
                      className={`mx-auto flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border text-[12px] sm:text-[14px] font-semibold transition-all duration-300 ${
                        isInvalid
                          ? "border-red-500 bg-red-500 text-white"
                          : isCompleted || isActive
                          ? "border-[#06B217] bg-[#06B217] text-white"
                          : "border-[#D6DAE6] bg-white text-[#808DAF]"
                      }`}
                    >
                      {number}
                    </div>
                    <p
                      className={`mt-1 truncate text-[10px] sm:text-[12px] font-medium ${
                        isInvalid
                          ? "text-red-500"
                          : isCompleted || isActive
                          ? "text-[#06B217]"
                          : "text-[#808DAF]"
                      }`}
                    >
                      {label}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E6E8EF]">
              <div
                className="h-full rounded-full bg-[#06B217] transition-all duration-300"
                style={{
                  width: `${
                    ((Math.min(step, signupSteps.length) - 1) /
                      (signupSteps.length - 1)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

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
                  initialData={formData}
                />
              ) : (
                <IndividualStepOneInfo
                  onNext={handleNext}
                  navigate={navigate}
                  onError={handleStepError}
                  initialData={formData}
                />
              )
            )}

            {step === 2 &&
              (type === "company" ? (
                <CompanyStepTwoVerify
                  onNext={handleNext}
                  onError={handleStepError}
                  initialData={formData}
                />
              ) : (
                <IndividualStepTwoVerify
                  onNext={handleNext}
                  onError={handleStepError}
                  initialData={formData}
                />
              ))}

            {step === 3 && (
              type === "company" ? (
                <CompanyStepThreeAddress
                  onNext={handleNext}
                  isSubmitting={isSubmitting}
                  onError={handleStepError}
                  initialData={formData}
                />
              ) : (
                <IndividualStepThreeAddress
                  onNext={handleNext}
                  isSubmitting={isSubmitting}
                  onError={handleStepError}
                  initialData={formData}
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
                    const res = await verifyEmail({
                      email: registeredEmail || formData.email,
                      code: otpCode,
                    });

                    console.log("VERIFY EMAIL RESPONSE", res);
                    const message = `Email verified successfully for ${
                      registeredEmail || formData.email
                    }. You can sign in now.`;

                    setApiSuccess(message);
                    showToast("success", message);

                    setTimeout(() => {
                      navigate("/login");
                    }, 1000);
                  } catch (error) {
                    console.error("VERIFY EMAIL API ERROR", error?.response?.data || error);
                    const message = getApiErrorMessage(error);

                    setApiError(message);
                    showToast("error", message);
                    throw error;
                  } finally {
                    setIsVerifyingOtp(false);
                  }
                }}
                onResend={async () => {
                  const email = registeredEmail || formData.email;

                  if (!email) {
                    const message = "Missing email address for verification.";

                    setApiError(message);
                    showToast("error", message);
                    throw new Error(message);
                  }

                  try {
                    await resendEmailVerification({ email });
                    const message = `A new verification code was sent to ${email}.`;

                    setApiError("");
                    setApiSuccess(message);
                    showToast("success", message);
                  } catch (error) {
                    const message = getApiErrorMessage(error);

                    setApiError(message);
                    showToast("error", message);
                    throw error;
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
