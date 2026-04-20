import { useRef } from "react";

import nationalFront from "../../../../assets/images/auth/nationalFront.png";
import nationalBack from "../../../../assets/images/auth/nationalBack.png";
import selfie from "../../../../assets/images/auth/selfie.png";

export default function VerifyStep({ onNext }) {

  const frontRef = useRef(null);
  const backRef = useRef(null);
  const selfieRef = useRef(null);

  const inputs = [frontRef, backRef, selfieRef];

  const handleUploadClick = (index) => {
    inputs[index].current.click();
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      console.log(type, file);
    }
  };

  return (
    <div className="space-y-2">
      {/* Subtitle */}
      <p className="text-[12px] sm:text-[16px] text-[#808DAF] text-center">
        Enter your national ID number as shown on your card
      </p>

      {/* ID Input */}
      <input
        placeholder="ID Number"
        className="
          w-full h-14 rounded-xl sm:rounded-2xl px-4
          text-[12px] sm:text-[16px] text-[#011C60]
          border border-gray-200
          focus:border-[#011C60] outline-none
        "
      />

      {/* Upload Cards */}
      {[
        {
          title: "National ID (Front side)",
          desc: "Ensure the image is clear",
          img: nationalFront,
        },
        {
          title: "National ID (Back side)",
          desc: "Ensure four corners are visible",
          img: nationalBack,
        },
        {
          title: "Selfie with ID",
          desc: "Your face and ID should be clearly visible",
          img: selfie,
        },
      ].map((item, i) => (
        <div
          key={i}
          className="
            flex items-center justify-between
            border-2 border-dashed border-[#D6DAE6]
            rounded-xl sm:rounded-3xl px-3 py-2 sm:px-6 sm:py-4
          "
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
            </div>
          </div>

          {/* HIDDEN INPUT */}
          <input
            type="file"
            accept="image/*"
            ref={inputs[i]}
            onChange={(e) => handleFileChange(e, item.title)}
            className="hidden"
          />

          {/* PLUS ICON BUTTON */}
          <button
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
      ))}

      {/* Buttons */}
      <div className="flex gap-4 pt-2">
        <button
          onClick={onNext}
          className="
            w-full h-12 sm:h-16
            rounded-xl sm:rounded-2xl
            bg-[#011C60] text-white
            text-[14px] sm:text-[20px] font-semibold
            shadow-[4px_8px_12px_rgba(23,26,30,0.25)]
            transition-all duration-300
            hover:-translate-y-0.5
            hover:bg-[#02237a]
          "
        >
          Next
        </button>

        {/* ✅ Skip = next step */}
        <button
          onClick={onNext}
          className="
          
           w-full h-12 sm:h-16
            bg-[#E6E8EF]
             rounded-xl sm:rounded-2xl
            text-[14px] sm:text-[20px] font-medium text-[#011C60]
            transition-all duration-300
            hover:bg-gray-300
          "
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
