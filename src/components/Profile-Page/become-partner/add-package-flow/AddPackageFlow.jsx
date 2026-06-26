import { useEffect, useState } from "react";

import { getNeighborhoods } from "../../../../api/auth/auth.api";
import { addPackage } from "../../../../api/services/service.api";
import {
  FieldLabel,
  FlowActions,
  INPUT_CLASS_NAME,
  PANEL_CLASS_NAME,
  PlusIcon,
  SELECT_CLASS_NAME,
  SelectArrow,
  SectionHeading,
  TEXTAREA_CLASS_NAME,
  joinClasses,
} from "../add-service-flow/PartnerFlowShared";
import { SERVICE_CATEGORY_OPTIONS } from "../add-service-flow/partnerFlowData";

const CURRENCY = "EGY";
const LANGUAGE = "en";
const DAILY_RECURRENCE = "Daily";

const createEmptyPackage = () => ({
  serviceNameId: "",
  serviceName: "",
  recurrence: "",
  daysPerInterval: "",
  servicePrice: "",
  categoryName: "",
  description: "",
  governorateId: "",
  neighborhoodIds: [],
  imageFiles: [],
  extraItemName: "",
  extraItemPrice: "",
  extraItems: [],
});

const RECURRENCE_OPTIONS = [
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
];

const CATEGORY_API_VALUES = {
  "car-care": "Car_Care",
  "home-service": "Home_Care",
  "personal-care": "Personal_Care",
  Car_Care: "Car_Care",
  Home_Care: "Home_Care",
  Personal_Care: "Personal_Care",
};

const getCategoryApiValue = (categoryValue) =>
  CATEGORY_API_VALUES[categoryValue] || categoryValue;

const normalizeIdList = (value) => [
  ...new Set(
    (Array.isArray(value) ? value : [value])
      .map((item) => String(item || "").trim())
      .filter(Boolean)
  ),
];

const extractPayloadData = (response) => response?.data ?? response;

const extractList = (response) => {
  const data = extractPayloadData(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.results)) return data.results;

  return [];
};

const toOption = (item) => ({
  value: item.id,
  label: item.name,
});

const isPackageComplete = (draft) =>
  [
    draft.serviceNameId,
    draft.recurrence,
    draft.daysPerInterval,
    draft.servicePrice,
    draft.categoryName,
    draft.description,
    draft.governorateId,
  ].every((value) => String(value || "").trim()) &&
  draft.neighborhoodIds.length > 0;

const getPackageValidationMessage = (draft) => {
  const daysPerInterval = Number(draft.daysPerInterval);
  const price = Number(draft.servicePrice);
  const maxDaysByRecurrence = {
    Daily: 1,
    Weekly: 7,
    Monthly: 30,
  };
  const maxDays = maxDaysByRecurrence[draft.recurrence];

  if (!Number.isInteger(daysPerInterval) || daysPerInterval < 1) {
    return "Please enter a valid number of days per interval.";
  }

  if (maxDays && daysPerInterval > maxDays) {
    return `${draft.recurrence} packages can use 1 to ${maxDays} day${
      maxDays === 1 ? "" : "s"
    } per interval.`;
  }

  if (!Number.isFinite(price) || price < 0) {
    return "Please enter a valid package price.";
  }

  return "";
};

const buildPackageFormData = (draft) => {
  const formData = new FormData();

  formData.append("serviceNameId", draft.serviceNameId);
  formData.append("recurrence", draft.recurrence);
  formData.append("daysPerInterval", Number(draft.daysPerInterval) || 1);
  formData.append("servicePrice", Number(draft.servicePrice) || 0);
  formData.append("currency", CURRENCY);
  formData.append("categoryName", getCategoryApiValue(draft.categoryName));
  formData.append("description", draft.description.trim());
  formData.append("governorateId", draft.governorateId);

  normalizeIdList(draft.neighborhoodIds).forEach((neighborhoodId) => {
    formData.append("neighborhoodIds", neighborhoodId);
  });

  formData.append(
    "itemsJson",
    JSON.stringify(
      draft.extraItems.map((item) => ({
        Name: item.name,
        Price: Number(item.price) || 0,
        Description: item.name,
      }))
    )
  );

  (draft.imageFiles || []).forEach((file) => {
    if (file instanceof File) {
      formData.append("imageFiles", file);
    }
  });

  return formData;
};

const getApiErrorMessage = (error, fallbackMessage) => {
  const data = error?.response?.data;
  const validationMessage =
    data?.errors && typeof data.errors === "object"
      ? Object.values(data.errors).flat().filter(Boolean).join(" ")
      : "";
  const message =
    data?.error?.message ||
    data?.message ||
    data?.title ||
    validationMessage ||
    (typeof data === "string" ? data : "");

  return message || fallbackMessage;
};

const getCookie = (name) => {
  if (typeof document === "undefined") return "";

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
};

const getAuthToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("token") || getCookie("alaa_auth_token")
    : "";

const isUnauthorizedError = (error) => error?.response?.status === 401;
const SESSION_REFRESH_RETRY_MESSAGE =
  "Your session was refreshed. Please try again.";

export default function AddPackageFlow({
  onBack,
  onToast,
  onSaved,
  hasProviderAccess = true,
  serviceNameOptions = [],
  governorateOptions = [],
}) {
  const [draftPackage, setDraftPackage] = useState(createEmptyPackage);
  const [neighborhoodOptions, setNeighborhoodOptions] = useState([]);
  const [isLoadingNeighborhoods, setIsLoadingNeighborhoods] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [extraItemError, setExtraItemError] = useState("");
  const isDailyPackage = draftPackage.recurrence === DAILY_RECURRENCE;

  useEffect(() => {
    let isMounted = true;

    setDraftPackage((currentPackage) => ({
      ...currentPackage,
      neighborhoodIds: [],
    }));

    if (!draftPackage.governorateId) {
      setNeighborhoodOptions([]);
      return undefined;
    }

    const fetchNeighborhoodOptions = async () => {
      setIsLoadingNeighborhoods(true);

      try {
        const response = await getNeighborhoods(draftPackage.governorateId, LANGUAGE);

        if (!isMounted) return;

        setNeighborhoodOptions(extractList(response).map(toOption));
      } catch {
        if (isMounted) {
          setNeighborhoodOptions([]);
          onToast({
            id: Date.now(),
            type: "error",
            message: "Failed to load neighborhoods for this governorate.",
          });
        }
      } finally {
        if (isMounted) setIsLoadingNeighborhoods(false);
      }
    };

    fetchNeighborhoodOptions();

    return () => {
      isMounted = false;
    };
  }, [draftPackage.governorateId, onToast]);

  const handleFieldChange = (fieldName, value) => {
    setDraftPackage((currentPackage) => ({
      ...currentPackage,
      [fieldName]: value,
      ...(fieldName === "recurrence" && value === DAILY_RECURRENCE
        ? { daysPerInterval: "1" }
        : {}),
    }));
  };

  const handleServiceNameChange = (serviceNameId) => {
    const selectedServiceName = serviceNameOptions.find(
      (option) => option.value === serviceNameId
    );

    setDraftPackage((currentPackage) => ({
      ...currentPackage,
      serviceNameId,
      serviceName: selectedServiceName?.label || "",
    }));
  };

  const handleNeighborhoodToggle = (neighborhoodId) => {
    setDraftPackage((currentPackage) => {
      const currentIds = normalizeIdList(currentPackage.neighborhoodIds);

      return {
        ...currentPackage,
        neighborhoodIds: currentIds.includes(neighborhoodId)
          ? currentIds.filter((currentId) => currentId !== neighborhoodId)
          : [...currentIds, neighborhoodId],
      };
    });
  };

  const handlePhotoChange = (fileList) => {
    const files = Array.from(fileList || []);

    setDraftPackage((currentPackage) => {
      const nextFiles = [...(currentPackage.imageFiles || [])];

      files.forEach((file) => {
        const alreadySelected = nextFiles.some(
          (currentFile) =>
            currentFile.name === file.name &&
            currentFile.size === file.size &&
            currentFile.lastModified === file.lastModified
        );

        if (!alreadySelected && nextFiles.length < 5) {
          nextFiles.push(file);
        }
      });

      setUploadError(
        (currentPackage.imageFiles || []).length + files.length > 5
          ? "You can upload up to 5 photos only."
          : ""
      );

      return {
        ...currentPackage,
        imageFiles: nextFiles,
      };
    });
  };

  const handleRemovePhoto = (photoIndex) => {
    setUploadError("");
    setDraftPackage((currentPackage) => ({
      ...currentPackage,
      imageFiles: currentPackage.imageFiles.filter((_, index) => index !== photoIndex),
    }));
  };

  const handleAddExtraItem = () => {
    const nextItemName = draftPackage.extraItemName.trim();
    const nextItemPrice = Number(draftPackage.extraItemPrice);

    if (!nextItemName) {
      setExtraItemError("Please enter an extra item name.");
      return;
    }

    if (!Number.isFinite(nextItemPrice) || nextItemPrice <= 0) {
      setExtraItemError("Extra item price must be greater than 0.");
      return;
    }

    setExtraItemError("");

    setDraftPackage((currentPackage) => ({
      ...currentPackage,
      extraItemName: "",
      extraItemPrice: "",
      extraItems: [
        ...(currentPackage.extraItems || []).filter(
          (item) => item.name.toLowerCase() !== nextItemName.toLowerCase()
        ),
        {
          name: nextItemName,
          price: nextItemPrice,
        },
      ],
    }));
  };

  const handleRemoveExtraItem = (itemName) => {
    setExtraItemError("");
    setDraftPackage((currentPackage) => ({
      ...currentPackage,
      extraItems: (currentPackage.extraItems || []).filter(
        (currentItem) => currentItem.name !== itemName
      ),
    }));
  };

  const handleSave = async () => {
    if (!isPackageComplete(draftPackage)) return;

    const validationMessage = getPackageValidationMessage(draftPackage);

    if (validationMessage) {
      onToast({
        id: Date.now(),
        type: "error",
        message: validationMessage,
      });
      return;
    }

    if (!getAuthToken()) {
      onToast({
        id: Date.now(),
        type: "error",
        message: "Please sign in again before saving a package.",
      });
      return;
    }

    if (!hasProviderAccess) {
      onToast({
        id: Date.now(),
        type: "error",
        message:
          "Your account does not have permission to create provider packages.",
      });
      return;
    }

    try {
      const response = await addPackage(buildPackageFormData(draftPackage));
      const didRefresh = await onSaved?.(response);

      if (didRefresh === false) {
        return;
      }

      setDraftPackage(createEmptyPackage());
      setNeighborhoodOptions([]);
      setUploadError("");
      setExtraItemError("");
      onToast({
        id: Date.now(),
        type: "success",
        message: "Your package has been saved successfully.",
      });
    } catch (error) {
      if (isUnauthorizedError(error)) {
        onToast({
          id: Date.now(),
          type: "error",
          message: SESSION_REFRESH_RETRY_MESSAGE,
        });
        return;
      }

      if (error?.response?.status === 403) {
        onToast({
          id: Date.now(),
          type: "error",
          message:
            "Your account does not have permission to create provider packages.",
        });
        return;
      }

      onToast({
        id: Date.now(),
        type: "error",
        message: getApiErrorMessage(error, "Failed to save package. Please try again."),
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section className={joinClasses(PANEL_CLASS_NAME, "lg:max-w-[860px]")}>
        <div className="flex flex-col gap-8">
          <SectionHeading
            title="Create Package"
            description="Create a recurring package for one service with extra items, coverage, and photos."
          />

          <div className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="relative">
                <FieldLabel>Package Service</FieldLabel>
                <select
                  value={draftPackage.serviceNameId}
                  onChange={(event) => handleServiceNameChange(event.target.value)}
                  className={SELECT_CLASS_NAME}
                >
                  <option value="">Service name</option>
                  {serviceNameOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </label>

              <label className="relative">
                <FieldLabel>Category</FieldLabel>
                <select
                  value={draftPackage.categoryName}
                  onChange={(event) =>
                    handleFieldChange("categoryName", event.target.value)
                  }
                  className={SELECT_CLASS_NAME}
                >
                  <option value="">Service category</option>
                  {SERVICE_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <label className="relative">
                <FieldLabel>Recurrence</FieldLabel>
                <select
                  value={draftPackage.recurrence}
                  onChange={(event) =>
                    handleFieldChange("recurrence", event.target.value)
                  }
                  className={SELECT_CLASS_NAME}
                >
                  <option value="">Recurrence</option>
                  {RECURRENCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </label>

              <label>
                <FieldLabel>Days Per Interval</FieldLabel>
                <input
                  type="number"
                  min="1"
                  max={draftPackage.recurrence === "Weekly" ? 7 : 30}
                  value={draftPackage.daysPerInterval}
                  disabled={isDailyPackage}
                  onChange={(event) =>
                    handleFieldChange("daysPerInterval", event.target.value)
                  }
                  placeholder="Days"
                  className={joinClasses(
                    INPUT_CLASS_NAME,
                    isDailyPackage && "cursor-not-allowed opacity-70"
                  )}
                />
              </label>

              <label>
                <FieldLabel>Service Price</FieldLabel>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draftPackage.servicePrice}
                  onChange={(event) =>
                    handleFieldChange("servicePrice", event.target.value)
                  }
                  placeholder="0.00"
                  className={INPUT_CLASS_NAME}
                />
              </label>
            </div>

            <label>
              <FieldLabel>Description</FieldLabel>
              <textarea
                value={draftPackage.description}
                onChange={(event) =>
                  handleFieldChange("description", event.target.value)
                }
                placeholder="Describe what this package includes"
                rows="4"
                className={TEXTAREA_CLASS_NAME}
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="relative">
                <FieldLabel>Governorate</FieldLabel>
                <select
                  value={draftPackage.governorateId}
                  onChange={(event) =>
                    handleFieldChange("governorateId", event.target.value)
                  }
                  className={SELECT_CLASS_NAME}
                >
                  <option value="">Select governorate</option>
                  {governorateOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </label>

              <div>
                <FieldLabel>Coverage Areas</FieldLabel>
                <div className="rounded-[14px] border border-[#D8DDEB] bg-white p-3 shadow-[8px_4px_16px_0px_rgba(226,232,243,0.5)]">
                  <div className="max-h-44 overflow-y-auto pr-1">
                    {!draftPackage.governorateId && (
                      <p className="font-['Roboto'] text-[14px] font-semibold leading-6 text-[#9AA6C7]">
                        Select governorate first
                      </p>
                    )}

                    {draftPackage.governorateId && isLoadingNeighborhoods && (
                      <p className="font-['Roboto'] text-[14px] font-semibold leading-6 text-[#9AA6C7]">
                        Loading neighborhoods...
                      </p>
                    )}

                    {draftPackage.governorateId &&
                      !isLoadingNeighborhoods &&
                      neighborhoodOptions.length === 0 && (
                        <p className="font-['Roboto'] text-[14px] font-semibold leading-6 text-[#9AA6C7]">
                          No coverage areas available
                        </p>
                      )}

                    {draftPackage.governorateId &&
                      !isLoadingNeighborhoods &&
                      neighborhoodOptions.map((option) => {
                        const isSelected = draftPackage.neighborhoodIds.includes(
                          option.value
                        );

                        return (
                          <label
                            key={option.value}
                            className="flex min-h-10 cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-[#F5F7FC]"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleNeighborhoodToggle(option.value)}
                              className="h-4 w-4 accent-[#011C60]"
                            />
                            <span className="font-['Roboto'] text-[14px] font-semibold leading-6 text-[#011C60]">
                              {option.label}
                            </span>
                          </label>
                        );
                      })}
                  </div>
                </div>

                {draftPackage.neighborhoodIds.length > 0 && (
                  <p className="mt-2 font-['Roboto'] text-[13px] leading-5 text-[#6777A0]">
                    {draftPackage.neighborhoodIds.length} coverage{" "}
                    {draftPackage.neighborhoodIds.length === 1 ? "area" : "areas"}{" "}
                    selected
                  </p>
                )}
              </div>
            </div>

            <div>
              <FieldLabel>Extra Items</FieldLabel>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px_auto]">
                <input
                  type="text"
                  value={draftPackage.extraItemName}
                  onChange={(event) =>
                    handleFieldChange("extraItemName", event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAddExtraItem();
                    }
                  }}
                  placeholder="Extra item"
                  className={INPUT_CLASS_NAME}
                />
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={draftPackage.extraItemPrice}
                  onChange={(event) =>
                    handleFieldChange("extraItemPrice", event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAddExtraItem();
                    }
                  }}
                  placeholder="Price"
                  className={INPUT_CLASS_NAME}
                />
                <button
                  type="button"
                  onClick={handleAddExtraItem}
                  className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#011C60] px-5 font-['Roboto'] text-[15px] font-semibold text-white transition hover:bg-[#02267F]"
                >
                  <PlusIcon className="h-4 w-4" stroke="white" />
                  Add
                </button>
              </div>

              {extraItemError && (
                <p className="mt-2 font-['Roboto'] text-[14px] leading-5 text-[#DC2626]">
                  {extraItemError}
                </p>
              )}

              {draftPackage.extraItems.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {draftPackage.extraItems.map((item) => (
                    <span
                      key={item.name}
                      className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-[#F3F4F7] px-4 font-['Roboto'] text-[13px] font-medium leading-5 text-[#6777A0]"
                    >
                      {item.name} - EGP {item.price}
                      <button
                        type="button"
                        onClick={() => handleRemoveExtraItem(item.name)}
                        aria-label={`Remove ${item.name}`}
                        className="cursor-pointer text-[#6777A0] transition hover:text-[#011C60]"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <FieldLabel>Package Photos</FieldLabel>
              <label className="block cursor-pointer rounded-2xl border border-dashed border-[#D7DDED] bg-white p-4 transition hover:border-[#011C60]">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    handlePhotoChange(event.target.files);
                    event.target.value = "";
                  }}
                />
                <span className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#EFF3FF] px-4 font-['Roboto'] text-[14px] font-medium text-[#011C60]">
                  <PlusIcon className="h-4 w-4" />
                  Add images
                </span>
              </label>

              {draftPackage.imageFiles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {draftPackage.imageFiles.map((file, index) => (
                    <span
                      key={`${file.name}-${file.lastModified}`}
                      className="inline-flex min-h-8 items-center gap-2 rounded-full bg-[#EAF0FF] px-3 py-1.5 font-['Roboto'] text-[13px] font-medium text-[#011C60]"
                    >
                      {file.name}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        aria-label={`Remove ${file.name}`}
                        className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-[#6777A0] transition hover:bg-white hover:text-[#011C60]"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {uploadError && (
                <p className="mt-2 font-['Roboto'] text-[14px] leading-5 text-[#DC2626]">
                  {uploadError}
                </p>
              )}
            </div>
          </div>

          <FlowActions
            secondaryLabel="Back"
            onSecondary={onBack}
            primaryLabel="Save Package"
            onPrimary={handleSave}
            primaryDisabled={!isPackageComplete(draftPackage)}
          />
        </div>
      </section>
    </div>
  );
}
