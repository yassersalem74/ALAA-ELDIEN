import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  getGovernorates,
  getNeighborhoods,
} from "../../../../api/auth/auth.api";

const getApiList = (payload, keys) => {
  if (Array.isArray(payload)) return payload;

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }

  return [];
};

const getOptionId = (item) => item?._id || item?.id || item?.value || "";

const getOptionName = (item) =>
  item?.name ||
  item?.nameEn ||
  item?.name_en ||
  item?.title ||
  item?.label ||
  item?.nameAr ||
  "Unnamed";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export default function StepThreeAddress({ onNext, isSubmitting }) {
  const [governorates, setGovernorates] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedGovernorateId, setSelectedGovernorateId] = useState("");
  const [isLoadingGovernorates, setIsLoadingGovernorates] = useState(false);
  const [isLoadingNeighborhoods, setIsLoadingNeighborhoods] = useState(false);
  const [locationError, setLocationError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  useEffect(() => {
    let isMounted = true;

    const loadGovernorates = async () => {
      setIsLoadingGovernorates(true);
      setLocationError("");

      try {
        const data = await getGovernorates("en");
        if (!isMounted) return;

        setGovernorates(
          getApiList(data, ["governorates", "data", "result", "results"])
        );
      } catch (error) {
        if (!isMounted) return;
        setLocationError(
          getErrorMessage(error, "Could not load governorates")
        );
      } finally {
        if (isMounted) setIsLoadingGovernorates(false);
      }
    };

    loadGovernorates();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadNeighborhoods = async () => {
      if (!selectedGovernorateId) {
        setNeighborhoods([]);
        return;
      }

      setIsLoadingNeighborhoods(true);
      setLocationError("");

      try {
        const data = await getNeighborhoods(selectedGovernorateId, "en");
        if (!isMounted) return;

        setNeighborhoods(
          getApiList(data, [
            "neighborhoods",
            "areas",
            "data",
            "result",
            "results",
          ])
        );
      } catch (error) {
        if (!isMounted) return;
        setLocationError(
          getErrorMessage(error, "Could not load neighborhoods")
        );
      } finally {
        if (isMounted) setIsLoadingNeighborhoods(false);
      }
    };

    loadNeighborhoods();

    return () => {
      isMounted = false;
    };
  }, [selectedGovernorateId]);

  const handleGovernorateChange = (event) => {
    const governorateId = event.target.value;

    setSelectedGovernorateId(governorateId);
    setValue("areaId", "");
  };

  const onSubmit = (data) => {
    console.log("STEP 3 DATA", data);
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      {locationError && (
        <p className="text-center text-xs text-red-500">{locationError}</p>
      )}

      {/* Governorate */}
      <div>
        <select
          disabled={isLoadingGovernorates}
          {...register("governorateId", {
            required: "Governorate is required",
            onChange: handleGovernorateChange,
          })}
          className={`
            w-full h-10 sm:h-14 rounded-xl sm:rounded-2xl px-4
            text-[10px] sm:text-[14px] text-[#011C60]
            border ${
              errors.governorateId
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-[#011C60]"
            }
            outline-none disabled:bg-gray-100 disabled:text-[#808DAF]
          `}
        >
          <option value="">
            {isLoadingGovernorates ? "Loading governorates..." : "Governorate"}
          </option>
          {governorates.map((governorate) => (
            <option
              key={getOptionId(governorate)}
              value={getOptionId(governorate)}
            >
              {getOptionName(governorate)}
            </option>
          ))}
        </select>
        {errors.governorateId && (
          <span className="text-red-500 text-xs">
            {errors.governorateId.message}
          </span>
        )}
      </div>

      {/* Area */}
      <div>
        <select
          disabled={!selectedGovernorateId || isLoadingNeighborhoods}
          {...register("areaId", {
            required: "Area is required",
          })}
          className={`
            w-full h-10 sm:h-14 rounded-xl sm:rounded-2xl px-4
            text-[10px] sm:text-[14px] text-[#011C60]
            border ${
              errors.areaId
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 focus:border-[#011C60]"
            }
            outline-none disabled:bg-gray-100 disabled:text-[#808DAF]
          `}
        >
          <option value="">
            {isLoadingNeighborhoods ? "Loading areas..." : "Area"}
          </option>
          {neighborhoods.map((neighborhood) => (
            <option
              key={getOptionId(neighborhood)}
              value={getOptionId(neighborhood)}
            >
              {getOptionName(neighborhood)}
            </option>
          ))}
        </select>

        {errors.areaId && (
          <span className="text-red-500 text-xs">
            {errors.areaId.message}
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

      {/* Apartment */}
      <div>
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

      {/* Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            w-full h-12 sm:h-16
            rounded-2xl
            bg-[#011C60] text-white
            text-[14px] sm:text-[20px] font-semibold
            shadow-[4px_8px_12px_rgba(23,26,30,0.25)]
            transition-all duration-300
            hover:-translate-y-0.5
            hover:bg-[#02237a]
            disabled:cursor-not-allowed disabled:opacity-70
            cursor-pointer
          "
        >
          {isSubmitting ? "Creating..." : "Create Account"}
        </button>
      </div>
    </form>
  );
}
