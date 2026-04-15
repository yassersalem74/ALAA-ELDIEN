import { useRef } from "react";

import nationalFront from "../../../assets/images/auth/nationalFront.png";
import nationalBack from "../../../assets/images/auth/nationalBack.png";
import selfie from "../../../assets/images/auth/selfie.png";

export default function VerifyStep({ onNext }) {
  // refs لكل upload
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
      <p className="text-[18px] text-[#808DAF] text-center">
        Enter your national ID number as shown on your card
      </p>

      {/* ID Input */}
      <input
        placeholder="ID Number"
        className="
          w-full h-[56px] rounded-[16px] px-4
          text-[18px] text-[#011C60]
          border border-gray-200
          focus:border-[#011C60] outline-none
        "
      />

      {/* Upload Cards */}
      {[
        {
          title: "National ID (Front side)",
          desc: "Make sure the image is clear and not blurry",
          img: nationalFront,
        },
        {
          title: "National ID (Back side)",
          desc: "Ensure all four corners are visible",
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
            rounded-[24px] px-6 py-4
          "
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#E6E8EF] flex justify-center items-center">
              <img src={item.img} className="w-6" />
            </div>

            <div>
              <h3 className="text-[20px] font-medium text-[#011C60]">
                {item.title}
              </h3>
              <p className="text-[16px] text-[#6777A0]">
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
              className="w-8 h-8"
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
            w-full h-[56px]
            bg-[#011C60] text-white
            rounded-[16px]
            text-[20px] font-medium
            shadow-[4px_8px_12px_rgba(23,26,30,0.25)]
            transition-all duration-300
            hover:-translate-y-[2px]
            hover:bg-[#02237a]
          "
        >
          Next
        </button>

        {/* ✅ Skip = next step */}
        <button
          onClick={onNext}
          className="
            w-full h-[56px]
            bg-[#E6E8EF]
            rounded-[16px]
            text-[20px] font-medium text-[#011C60]
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