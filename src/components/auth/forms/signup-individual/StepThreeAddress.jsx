import { useForm } from "react-hook-form";

const egyptCities = [
  "Cairo","Giza","Alexandria","Dakahlia","Red Sea","Beheira","Fayoum",
  "Gharbia","Ismailia","Menofia","Minya","Qaliubiya","New Valley",
  "Suez","Aswan","Assiut","Beni Suef","Port Said","Damietta",
  "Sharkia","South Sinai","Kafr El Sheikh","Matrouh","Luxor",
  "Qena","North Sinai","Sohag",
];

export default function StepThreeAddress({ onNext }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const onSubmit = (data) => {
    console.log("STEP 3 DATA ✅", data);
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">

      {/* Governorate */}
      <div>
        <input
          placeholder="Governorate"
          {...register("governorate", {
            required: "Governorate is required",
          })}
          className={`
            w-full h-10 sm:h-14 rounded-xl sm:rounded-2xl px-4
            text-[10px] sm:text-[14px] text-[#011C60]
            placeholder:text-[#808DAF]
            border ${
              errors.governorate
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-[#011C60]"
            }
            outline-none
          `}
        />
        {errors.governorate && (
          <span className="text-red-500 text-xs">
            {errors.governorate.message}
          </span>
        )}
      </div>

      {/* City */}
      <div>
        <select
          {...register("city", {
            required: "City is required",
          })}
          className={`
            w-full h-10 sm:h-14 rounded-xl sm:rounded-2xl px-4
            text-[10px] sm:text-[14px] text-[#011C60]
            border ${
              errors.city
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-[#011C60]"
            }
            outline-none
          `}
        >
          <option value="">City</option>
          {egyptCities.map((city, i) => (
            <option key={i}>{city}</option>
          ))}
        </select>

        {errors.city && (
          <span className="text-red-500 text-xs">
            {errors.city.message}
          </span>
        )}
      </div>

      {/* Street */}
      <div>
        <input
          placeholder="Street Name"
          {...register("streetName", {
            required: "Street is required",
          })}
          className={`
            w-full h-10 sm:h-14 rounded-xl sm:rounded-2xl px-4
            text-[10px] sm:text-[14px] text-[#011C60]
            placeholder:text-[#808DAF]
            border ${
              errors.streetName
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-[#011C60]"
            }
            outline-none
          `}
        />
        {errors.streetName && (
          <span className="text-red-500 text-xs">
            {errors.streetName.message}
          </span>
        )}
      </div>

      {/* Row 1 */}
      <div className="flex gap-3">
        <div className="w-1/2">
          <input
            placeholder="Building Number"
            {...register("buildingNumber", {
              required: "Building number is required",
            })}
            className={`
              w-full h-10 sm:h-14 rounded-xl sm:rounded-2xl px-4
              text-[10px] sm:text-[14px] text-[#011C60]
              placeholder:text-[#808DAF]
              border ${
                errors.buildingNumber
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-200 focus:border-[#011C60]"
              }
              outline-none
            `}
          />
          {errors.buildingNumber && (
            <span className="text-red-500 text-xs">
              {errors.buildingNumber.message}
            </span>
          )}
        </div>

        <div className="w-1/2">
          <input
            placeholder="Floor Number"
            {...register("floorNumber", {
              required: "Floor number is required",
            })}
            className={`
              w-full h-10 sm:h-14 rounded-xl sm:rounded-2xl px-4
              text-[10px] sm:text-[14px] text-[#011C60]
              placeholder:text-[#808DAF]
              border ${
                errors.floorNumber
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-200 focus:border-[#011C60]"
              }
              outline-none
            `}
          />
          {errors.floorNumber && (
            <span className="text-red-500 text-xs">
              {errors.floorNumber.message}
            </span>
          )}
        </div>
      </div>

      {/* Row 2 */}
      <div className="flex gap-3">
        <div className="w-1/2">
          <input
            placeholder="Apartment"
            {...register("apartment", {
              required: "Apartment is required",
            })}
            className={`
              w-full h-10 sm:h-14 rounded-xl sm:rounded-2xl px-4
              text-[10px] sm:text-[14px] text-[#011C60]
              placeholder:text-[#808DAF]
              border ${
                errors.apartment
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-200 focus:border-[#011C60]"
              }
              outline-none
            `}
          />
          {errors.apartment && (
            <span className="text-red-500 text-xs">
              {errors.apartment.message}
            </span>
          )}
        </div>

        <div className="w-1/2">
          <input
            placeholder="Floor Number"
            {...register("floorNumber2", {
              required: "Floor number is required",
            })}
            className={`
              w-full h-10 sm:h-14 rounded-xl sm:rounded-2xl px-4
              text-[10px] sm:text-[14px] text-[#011C60]
              placeholder:text-[#808DAF]
              border ${
                errors.floorNumber2
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-200 focus:border-[#011C60]"
              }
              outline-none
            `}
          />
          {errors.floorNumber2 && (
            <span className="text-red-500 text-xs">
              {errors.floorNumber2.message}
            </span>
          )}
        </div>
      </div>

      {/* Additional */}
      <input
        placeholder="Additional Details (optional)"
        {...register("additionalDetails")}
        className="
          w-full h-10 sm:h-14 rounded-xl sm:rounded-2xl px-4
          text-[10px] sm:text-[14px] text-[#011C60]
          placeholder:text-[#808DAF]
          border border-gray-200
          focus:border-[#011C60] outline-none
        "
      />

      {/* Buttons */}
      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          className="
            w-full h-12 sm:h-16
            rounded-2xl
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
          type="button"
          onClick={onNext}
          className="
            w-full h-12 sm:h-16
            bg-[#E6E8EF]
            rounded-2xl
            text-[14px] sm:text-[20px] font-medium text-[#011C60]
            transition-all duration-300
            hover:bg-gray-300
            cursor-pointer
          "
        >
          Skip for now
        </button>
      </div>
    </form>
  );
}