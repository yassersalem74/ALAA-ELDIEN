import { useRef, useState } from "react";

import nationalFront from "../../../../assets/images/auth/nationalFront.png";
import nationalBack from "../../../../assets/images/auth/nationalBack.png";
import selfie from "../../../../assets/images/auth/selfie.png";

export default function StepTwoVerify({ onNext, onError, initialData = {} }) {
  const signatoryNationalIdRef = useRef(null);
  const taxRegistrationRef = useRef(null);
  const logoRef = useRef(null);
  const crRef = useRef(null);

  const [signatoryNationalId, setSignatoryNationalId] = useState(
    initialData.signatoryNationalId || ""
  );
  const [files, setFiles] = useState({
    imageSignatoryNationalId: initialData.imageSignatoryNationalId || null,
    imageTaxRegistration: initialData.imageTaxRegistration || null,
    logo: initialData.logo || null,
    imageCR: initialData.imageCR || null,
  });
  const [errors, setErrors] = useState({});

  const uploadItems = [
    {
      title: "Signatory national ID",
      desc: "Upload the authorized signatory national ID image",
      img: nationalFront,
      key: "imageSignatoryNationalId",
      inputRef: signatoryNationalIdRef,
      required: true,
    },
    {
      title: "Tax registration",
      desc: "Upload the company tax registration document",
      img: nationalBack,
      key: "imageTaxRegistration",
      inputRef: taxRegistrationRef,
      required: true,
    },
    {
      title: "Company logo",
      desc: "Upload the logo that appears on the company profile",
      img: selfie,
      key: "logo",
      inputRef: logoRef,
      required: true,
    },
    {
      title: "Commercial register",
      desc: "Optional company commercial register document",
      img: nationalBack,
      key: "imageCR",
      inputRef: crRef,
      required: false,
    },
  ];

  const handleFileChange = (event, typeKey) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setFiles((currentFiles) => ({
      ...currentFiles,
      [typeKey]: file,
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      [typeKey]: null,
    }));
  };

  const handleNextClick = () => {
    const nextErrors = {};

    if (!signatoryNationalId) {
      nextErrors.signatoryNationalId = "Signatory national ID is required";
    } else if (!/^[23][0-9]{13}$/.test(signatoryNationalId)) {
      nextErrors.signatoryNationalId =
        "National ID must be 14 digits and start with 2 or 3";
    }

    uploadItems.forEach((item) => {
      if (item.required && !files[item.key]) {
        nextErrors[item.key] = `${item.title} is required`;
      }
    });

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      onError?.(Object.values(nextErrors)[0]);
      return;
    }

    onNext({
      signatoryNationalId,
      ...files,
    });
  };

  return (
    <div className="space-y-2 overflow-y-auto">
      <p className="text-[12px] sm:text-[16px] text-[#808DAF] text-center">
        Add the authorized signatory and company documents
      </p>

      <div>
        <input
          value={signatoryNationalId}
          onChange={(event) => {
            setSignatoryNationalId(event.target.value);
            setErrors((currentErrors) => ({
              ...currentErrors,
              signatoryNationalId: null,
            }));
          }}
          placeholder="Signatory national ID"
          className={`
            w-full h-14 rounded-xl sm:rounded-2xl px-4
            text-[12px] sm:text-[16px] text-[#011C60]
            border ${
              errors.signatoryNationalId
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-[#011C60]"
            }
            outline-none
          `}
        />
        {errors.signatoryNationalId && (
          <span className="text-red-500 text-xs">
            {errors.signatoryNationalId}
          </span>
        )}
      </div>

      {uploadItems.map((item) => (
        <div key={item.key}>
          <div
            className={`
              flex items-center justify-between
              border-2 border-dashed
              ${errors[item.key] ? "border-red-500" : "border-[#D6DAE6]"}
              rounded-xl sm:rounded-3xl px-3 py-2 sm:px-6 sm:py-4
            `}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-[#E6E8EF] flex justify-center items-center">
                <img src={item.img} alt="" className="w-4 sm:w-6" />
              </div>

              <div>
                <h3 className="text-[12px] sm:text-[16px] font-medium text-[#011C60]">
                  {item.title}
                </h3>
                <p className="text-[10px] sm:text-[12px] text-[#6777A0]">
                  {item.desc}
                </p>
                {files[item.key] && (
                  <p className="text-[10px] text-[#011C60] mt-1">
                    {files[item.key].name}
                  </p>
                )}
              </div>
            </div>

            <input
              type="file"
              accept="image/*"
              ref={item.inputRef}
              onChange={(event) => handleFileChange(event, item.key)}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => item.inputRef.current?.click()}
              className="hover:scale-110 transition cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#011C60"
                className="w-6 h-6 sm:w-8 sm:h-8"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {errors[item.key] && (
            <span className="text-red-500 text-xs">{errors[item.key]}</span>
          )}
        </div>
      ))}

      <div className="pt-2">
        <button
          type="button"
          onClick={handleNextClick}
          className="
            w-full h-12 sm:h-16
            rounded-xl sm:rounded-2xl
            bg-[#011C60] text-white
            text-[14px] sm:text-[20px] font-semibold
            shadow-[4px_8px_12px_rgba(23,26,30,0.25)]
            transition-all duration-300
            hover:-translate-y-0.5
            hover:bg-[#02237a]
            cursor-pointer
          "
        >
          Next
        </button>
      </div>
    </div>
  );
}
