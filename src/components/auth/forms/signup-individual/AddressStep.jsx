const egyptCities = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Dakahlia",
  "Red Sea",
  "Beheira",
  "Fayoum",
  "Gharbia",
  "Ismailia",
  "Menofia",
  "Minya",
  "Qaliubiya",
  "New Valley",
  "Suez",
  "Aswan",
  "Assiut",
  "Beni Suef",
  "Port Said",
  "Damietta",
  "Sharkia",
  "South Sinai",
  "Kafr El Sheikh",
  "Matrouh",
  "Luxor",
  "Qena",
  "North Sinai",
  "Sohag",
];

export default function AddressStep({ onNext }) {
  return (
    <div className="space-y-2">

      {/* Governorate */}
      <input
        placeholder="Governorate"
        className="
          w-full h-[56px] rounded-[16px] px-4
          text-[14px] text-[#011C60]
          placeholder:text-[#808DAF]
          border border-gray-200
          focus:border-[#011C60] outline-none
        "
      />

      {/* City Dropdown */}
      <select
        className="
          w-full h-[56px] rounded-[16px] px-4
          text-[14px] text-[#011C60]
          border border-gray-200
          focus:border-[#011C60] outline-none
        "
      >
        <option value="">City</option>
        {egyptCities.map((city, i) => (
          <option key={i}>{city}</option>
        ))}
      </select>

      {/* Street */}
      <input
        placeholder="Street Name"
        className="
          w-full h-[56px] rounded-[16px] px-4
          text-[14px] text-[#011C60]
          placeholder:text-[#808DAF]
          border border-gray-200
          focus:border-[#011C60] outline-none
        "
      />

      {/* Row 1 */}
      <div className="flex gap-3">
        <input
          placeholder="Building Number"
          className="
            w-1/2 h-[56px] rounded-[16px] px-4
            text-[14px] text-[#011C60]
            placeholder:text-[#808DAF]
            border border-gray-200
            focus:border-[#011C60] outline-none
          "
        />

        <input
          placeholder="Floor Number"
          className="
            w-1/2 h-[56px] rounded-[16px] px-4
            text-[14px] text-[#011C60]
            placeholder:text-[#808DAF]
            border border-gray-200
            focus:border-[#011C60] outline-none
          "
        />
      </div>

      {/* Row 2 */}
      <div className="flex gap-3">
        <input
          placeholder="Apartment"
          className="
            w-1/2 h-[56px] rounded-[16px] px-4
            text-[14px] text-[#011C60]
            placeholder:text-[#808DAF]
            border border-gray-200
            focus:border-[#011C60] outline-none
          "
        />

        <input
          placeholder="Floor Number"
          className="
            w-1/2 h-[56px] rounded-[16px] px-4
            text-[14px] text-[#011C60]
            placeholder:text-[#808DAF]
            border border-gray-200
            focus:border-[#011C60] outline-none
          "
        />
      </div>

      {/* Additional */}
      <input
        placeholder="Additional Details (optional)"
        className="
          w-full h-[56px] rounded-[16px] px-4
          text-[14px] text-[#011C60]
          placeholder:text-[#808DAF]
          border border-gray-200
          focus:border-[#011C60] outline-none
        "
      />

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

        <button
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