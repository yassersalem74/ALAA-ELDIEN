import { useRef, useState } from "react";

import nationalFront from "../../../../assets/images/auth/nationalFront.png";
import nationalBack from "../../../../assets/images/auth/nationalBack.png";
import selfie from "../../../../assets/images/auth/selfie.png";

export default function StepTwoVerify({ onNext }) {
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const selfieRef = useRef(null);

  const inputs = [frontRef, backRef, selfieRef];

  const [files, setFiles] = useState({
    front: null,
    back: null,
    selfie: null,
  });

  const [errors, setErrors] = useState({});

  const handleUploadClick = (index) => {
    inputs[index].current.click();
  };

  const handleFileChange = (e, typeKey) => {
    const file = e.target.files[0];

    if (file) {
      console.log(typeKey, file);

      setFiles((prev) => ({
        ...prev,
        [typeKey]: file,
      }));

      // remove error if exists
      setErrors((prev) => ({
        ...prev,
        [typeKey]: null,
      }));
    }
  };

  const handleNextClick = () => {
    const newErrors = {};

    if (!idNumber) newErrors.idNumber = "ID number is required";
    if (!files.front) newErrors.front = "Front ID is required";
    if (!files.back) newErrors.back = "Back ID is required";
    if (!files.selfie) newErrors.selfie = "Selfie is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    console.log("STEP 2 DATA ✅", {
      idNumber,
      ...files,
    });

    onNext({
      idNumber,
      ...files,
    });
  };

  const [idNumber, setIdNumber] = useState("");

  return (
    <div className="space-y-2">
      {/* Subtitle */}
      <p className="text-[12px] sm:text-[16px] text-[#808DAF] text-center">
        Enter your national ID number as shown on your card
      </p>

      {/* ID Input */}
      <div>
        <input
          value={idNumber}
          onChange={(e) => {
            setIdNumber(e.target.value);
            setErrors((prev) => ({ ...prev, idNumber: null }));
          }}
          placeholder="ID Number"
          className={`
            w-full h-14 rounded-xl sm:rounded-2xl px-4
            text-[12px] sm:text-[16px] text-[#011C60]
            border ${
              errors.idNumber
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-[#011C60]"
            }
            outline-none
          `}
        />
        {errors.idNumber && (
          <span className="text-red-500 text-xs">
            {errors.idNumber}
          </span>
        )}
      </div>

      {/* Upload Cards */}
      {[
        {
          title: "National ID (Front side)",
          desc: "Ensure the image is clear",
          img: nationalFront,
          key: "front",
        },
        {
          title: "National ID (Back side)",
          desc: "Ensure four corners are visible",
          img: nationalBack,
          key: "back",
        },
        {
          title: "Selfie with ID",
          desc: "Your face and ID should be clearly visible",
          img: selfie,
          key: "selfie",
        },
      ].map((item, i) => (
        <div key={i}>
          <div
            className={`
              flex items-center justify-between
              border-2 border-dashed
              ${
                errors[item.key]
                  ? "border-red-500"
                  : "border-[#D6DAE6]"
              }
              rounded-xl sm:rounded-3xl px-3 py-2 sm:px-6 sm:py-4
            `}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-[#E6E8EF] flex justify-center items-center">
                <img src={item.img} className="w-4 sm:w-6" />
              </div>

              <div>
                <h3 className="text-[12px] sm:text-[16px] font-medium text-[#011C60]">
                  {item.title}
                </h3>
                <p className="text-[10px] sm:text-[12px] text-[#6777A0]">
                  {item.desc}
                </p>

                {/* ✅ FILE NAME */}
                {files[item.key] && (
                  <p className="text-[10px] text-[#011C60] mt-1">
                    {files[item.key].name}
                  </p>
                )}
              </div>
            </div>

            {/* HIDDEN INPUT */}
            <input
              type="file"
              accept="image/*"
              ref={inputs[i]}
              onChange={(e) =>
                handleFileChange(e, item.key)
              }
              className="hidden"
            />

            {/* BUTTON */}
            <button
              type="button"
              onClick={() => handleUploadClick(i)}
              className="hover:scale-110 transition cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#011C60"
                className="w-6 h-6 sm:w-8 sm:h-8 "
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* ERROR */}
          {errors[item.key] && (
            <span className="text-red-500 text-xs">
              {errors[item.key]}
            </span>
          )}
        </div>
      ))}

      {/* Buttons */}
      <div className="flex gap-4 pt-2">
        <button
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

        <button
          onClick={onNext}
          className="
           w-full h-12 sm:h-16
            bg-[#E6E8EF]
             rounded-xl sm:rounded-2xl
            text-[14px] sm:text-[20px] font-medium text-[#011C60]
            transition-all duration-300
            hover:bg-gray-300
            cursor-pointer
          "
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}