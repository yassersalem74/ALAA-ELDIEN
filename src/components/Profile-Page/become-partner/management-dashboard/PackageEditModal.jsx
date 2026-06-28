import { useEffect, useMemo, useState } from "react";

import { getNeighborhoods } from "../../../../api/auth/auth.api";
import {
  FieldLabel,
  INPUT_CLASS_NAME,
  ModalShell,
  PlusIcon,
  SELECT_CLASS_NAME,
  SelectArrow,
  TEXTAREA_CLASS_NAME,
  joinClasses,
} from "../add-service-flow/PartnerFlowShared";
import { SERVICE_CATEGORY_OPTIONS } from "../add-service-flow/partnerFlowData";

const LANGUAGE = "en";
const DAILY_RECURRENCE = "Daily";

const RECURRENCE_OPTIONS = [
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
];

const normalizeIdList = (value) => [
  ...new Set(
    (Array.isArray(value) ? value : [value])
      .flatMap((item) => (Array.isArray(item) ? item : [item]))
      .map((item) => String(item?.id || item || "").trim())
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

const normalizeComparableLabel = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const getServiceNameOptionByLabel = (serviceNameOptions, serviceName) => {
  const targetLabel = normalizeComparableLabel(serviceName);

  if (!targetLabel) return null;

  return (
    serviceNameOptions.find(
      (option) => normalizeComparableLabel(option.label) === targetLabel
    ) || null
  );
};

const normalizeRecurrence = (value) => {
  const normalizedValue = String(value || "").trim().toLowerCase();

  return (
    RECURRENCE_OPTIONS.find(
      (option) => option.value.toLowerCase() === normalizedValue
    )?.value || ""
  );
};

const normalizePackagePayload = (packagePayload) => {
  const firstNonEmptyArray = (...values) =>
    values.find((value) => Array.isArray(value) && value.length > 0);
  const nestedPackage =
    packagePayload.package ||
    packagePayload.Package ||
    packagePayload.packageDto ||
    packagePayload.PackageDto ||
    packagePayload.packageDTO ||
    packagePayload.PackageDTO ||
    packagePayload.packageDetails ||
    packagePayload.PackageDetails ||
    packagePayload.details ||
    packagePayload.Details ||
    packagePayload.model ||
    packagePayload.Model ||
    packagePayload.result ||
    packagePayload.Result ||
    {};

  if (!nestedPackage || typeof nestedPackage !== "object") {
    return packagePayload;
  }

  return {
    ...nestedPackage,
    ...packagePayload,
    items: firstNonEmptyArray(
      packagePayload.extraItems,
      packagePayload.ExtraItems,
      packagePayload.items,
      packagePayload.Items,
      packagePayload.itemsList,
      packagePayload.ItemsList,
      packagePayload.packageItems,
      packagePayload.PackageItems,
      packagePayload.includedItems,
      packagePayload.IncludedItems,
      nestedPackage.extraItems,
      nestedPackage.ExtraItems,
      nestedPackage.items,
      nestedPackage.Items,
      nestedPackage.itemsList,
      nestedPackage.ItemsList,
      nestedPackage.packageItems,
      nestedPackage.PackageItems,
      nestedPackage.includedItems,
      nestedPackage.IncludedItems
    ),
    images: firstNonEmptyArray(
      packagePayload.images,
      packagePayload.imageUrls,
      packagePayload.packageImages,
      packagePayload.imageFiles,
      packagePayload.files,
      nestedPackage.images,
      nestedPackage.imageUrls,
      nestedPackage.packageImages,
      nestedPackage.imageFiles,
      nestedPackage.files
    ),
  };
};

const pickPackageImageValue = (image) => {
  if (!image) return "";
  if (typeof image === "string") return image;

  return (
    image.url ||
    image.imageUrl ||
    image.image ||
    image.path ||
    image.fileUrl ||
    image.name ||
    image.fileName ||
    ""
  );
};

const normalizePackageImages = (packageItem) => [
  ...new Set(
    [
      packageItem.image,
      packageItem.imageUrl,
      packageItem.coverImage,
      packageItem.mainImage,
      ...(Array.isArray(packageItem.photoNames) ? packageItem.photoNames : []),
      ...(Array.isArray(packageItem.images) ? packageItem.images : []),
      ...(Array.isArray(packageItem.imageUrls) ? packageItem.imageUrls : []),
      ...(Array.isArray(packageItem.packageImages) ? packageItem.packageImages : []),
      ...(Array.isArray(packageItem.serviceImages) ? packageItem.serviceImages : []),
      ...(Array.isArray(packageItem.imageFiles) ? packageItem.imageFiles : []),
      ...(Array.isArray(packageItem.files) ? packageItem.files : []),
    ]
      .map(pickPackageImageValue)
      .map((image) => String(image || "").trim())
      .filter(Boolean)
  ),
];

const normalizePackageItems = (packageItem) => {
  const itemCollections = [
    packageItem.extraItems,
    packageItem.ExtraItems,
    packageItem.items,
    packageItem.Items,
    packageItem.itemsList,
    packageItem.ItemsList,
    packageItem.packageItems,
    packageItem.PackageItems,
    packageItem.packageItemsList,
    packageItem.PackageItemsList,
    packageItem.itemDtos,
    packageItem.ItemDtos,
    packageItem.serviceItems,
    packageItem.ServiceItems,
    packageItem.includedItems,
    packageItem.IncludedItems,
    packageItem.features,
    packageItem.Features,
  ];
  const itemMap = new Map();

  itemCollections
    .filter(Array.isArray)
    .flat()
    .forEach((item) => {
      const name =
        typeof item === "string"
          ? item
          : item?.name ||
            item?.Name ||
            item?.itemName ||
            item?.ItemName ||
            item?.serviceItemName ||
            item?.ServiceItemName ||
            item?.title ||
            item?.Title ||
            item?.description ||
            item?.Description ||
            "";
      const normalizedName = String(name || "").trim();

      if (!normalizedName) return;

      const price =
        typeof item === "string"
          ? ""
          : item?.price ??
            item?.Price ??
            item?.itemPrice ??
            item?.ItemPrice ??
            item?.servicePrice ??
            item?.ServicePrice ??
            "";

      itemMap.set(normalizedName.toLowerCase(), {
        id: typeof item === "object" ? item?.id || item?.Id || "" : "",
        name: normalizedName,
        price: String(price).trim(),
        description:
          typeof item === "object"
            ? item?.description || item?.Description || normalizedName
            : normalizedName,
      });
    });

  return [...itemMap.values()];
};

const createDraftPackage = (packageItem, serviceNameOptions) => {
  packageItem = normalizePackagePayload(packageItem || {});
  const initialServiceNameOption = getServiceNameOptionByLabel(
    serviceNameOptions,
    packageItem.serviceName || packageItem.packageName
  );
  const recurrence = normalizeRecurrence(
    packageItem.pricingType || packageItem.recurrence
  );

  return {
    ...packageItem,
    serviceNameId:
      packageItem.serviceNameId || initialServiceNameOption?.value || "",
    serviceName:
      packageItem.serviceName ||
      packageItem.packageName ||
      initialServiceNameOption?.label ||
      "",
    packageName:
      packageItem.packageName ||
      packageItem.serviceName ||
      initialServiceNameOption?.label ||
      "",
    pricingType: recurrence,
    times:
      recurrence === DAILY_RECURRENCE
        ? "1"
        : String(packageItem.times ?? packageItem.daysPerInterval ?? ""),
    price: String(packageItem.price ?? packageItem.servicePrice ?? ""),
    categoryName: packageItem.categoryName || "",
    description: packageItem.description || "",
    governorateId: packageItem.governorateId || "",
    neighborhoodIds: normalizeIdList(packageItem.neighborhoodIds),
    photoNames: normalizePackageImages(packageItem),
    photos: Array.isArray(packageItem.photos) ? packageItem.photos : [],
    deletedImages: Array.isArray(packageItem.deletedImages)
      ? packageItem.deletedImages
      : [],
    extraItemName: "",
    extraItemPrice: "",
    extraItems: normalizePackageItems(packageItem),
  };
};

const getPackageValidationMessage = (draft) => {
  const requiredValues = [
    draft.serviceNameId,
    draft.pricingType,
    draft.times,
    draft.price,
    draft.categoryName,
    draft.description,
    draft.governorateId,
  ];

  if (
    requiredValues.some((value) => !String(value || "").trim()) ||
    normalizeIdList(draft.neighborhoodIds).length === 0
  ) {
    return "Please complete all required package details.";
  }

  const daysPerInterval = Number(draft.times);
  const price = Number(draft.price);
  const maxDaysByRecurrence = {
    Daily: 1,
    Weekly: 7,
    Monthly: 30,
  };
  const maxDays = maxDaysByRecurrence[draft.pricingType];

  if (!Number.isInteger(daysPerInterval) || daysPerInterval < 1) {
    return "Please enter a valid number of days per interval.";
  }

  if (maxDays && daysPerInterval > maxDays) {
    return `${draft.pricingType} packages can use 1 to ${maxDays} day${
      maxDays === 1 ? "" : "s"
    } per interval.`;
  }

  if (!Number.isFinite(price) || price < 0) {
    return "Please enter a valid package price.";
  }

  const invalidExtraItem = (draft.extraItems || []).some((item) => {
    const itemPrice = Number(item.price);

    return !item.name || !Number.isFinite(itemPrice) || itemPrice <= 0;
  });

  if (invalidExtraItem) {
    return "Extra item prices must be greater than 0.";
  }

  return "";
};

export default function PackageEditModal({
  packageItem,
  serviceNameOptions = [],
  governorateOptions = [],
  onClose,
  onSave,
}) {
  const [draftPackage, setDraftPackage] = useState(() =>
    createDraftPackage(packageItem, serviceNameOptions)
  );
  const [neighborhoodOptions, setNeighborhoodOptions] = useState([]);
  const [isLoadingNeighborhoods, setIsLoadingNeighborhoods] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [extraItemError, setExtraItemError] = useState("");
  const [formError, setFormError] = useState("");

  const isDailyPackage = draftPackage.pricingType === DAILY_RECURRENCE;

  useEffect(() => {
    setDraftPackage(createDraftPackage(packageItem, serviceNameOptions));
    setUploadError("");
    setExtraItemError("");
    setFormError("");
  }, [packageItem, serviceNameOptions]);

  useEffect(() => {
    let isMounted = true;

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
          setFormError("Failed to load neighborhoods for this governorate.");
        }
      } finally {
        if (isMounted) setIsLoadingNeighborhoods(false);
      }
    };

    fetchNeighborhoodOptions();

    return () => {
      isMounted = false;
    };
  }, [draftPackage.governorateId]);

  const selectedNeighborhoodOptions = useMemo(
    () =>
      normalizeIdList(draftPackage.neighborhoodIds).map((neighborhoodId) => {
        const option = neighborhoodOptions.find(
          (neighborhoodOption) => neighborhoodOption.value === neighborhoodId
        );

        return option || { value: neighborhoodId, label: neighborhoodId };
      }),
    [draftPackage.neighborhoodIds, neighborhoodOptions]
  );

  const coverageOptions = useMemo(() => {
    const optionMap = new Map();

    [...neighborhoodOptions, ...selectedNeighborhoodOptions].forEach((option) => {
      if (option.value) optionMap.set(option.value, option);
    });

    return [...optionMap.values()];
  }, [neighborhoodOptions, selectedNeighborhoodOptions]);

  const handleFieldChange = (fieldName, value) => {
    setFormError("");
    setDraftPackage((currentPackage) => ({
      ...currentPackage,
      [fieldName]: value,
      ...(fieldName === "pricingType" && value === DAILY_RECURRENCE
        ? { times: "1" }
        : {}),
      ...(fieldName === "governorateId" ? { neighborhoodIds: [] } : {}),
    }));
  };

  const handleServiceNameChange = (serviceNameId) => {
    const selectedServiceName = serviceNameOptions.find(
      (option) => option.value === serviceNameId
    );

    setFormError("");
    setDraftPackage((currentPackage) => ({
      ...currentPackage,
      serviceNameId,
      serviceName: selectedServiceName?.label || "",
      packageName: selectedServiceName?.label || "",
    }));
  };

  const handleNeighborhoodToggle = (neighborhoodId) => {
    setFormError("");
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
      const nextFiles = [...(currentPackage.photos || [])];
      let didRejectFile = false;

      files.forEach((file) => {
        const alreadySelected = nextFiles.some(
          (currentFile) =>
            currentFile.name === file.name &&
            currentFile.size === file.size &&
            currentFile.lastModified === file.lastModified
        );

        if (!alreadySelected && currentPackage.photoNames.length + nextFiles.length < 5) {
          nextFiles.push(file);
          return;
        }

        if (!alreadySelected) didRejectFile = true;
      });

      setUploadError(
        didRejectFile
          ? "You can upload up to 5 photos only."
          : ""
      );

      return {
        ...currentPackage,
        photos: nextFiles,
      };
    });
  };

  const handleRemoveExistingPhoto = (photoName) => {
    setUploadError("");
    setDraftPackage((currentPackage) => ({
      ...currentPackage,
      photoNames: currentPackage.photoNames.filter(
        (currentPhotoName) => currentPhotoName !== photoName
      ),
      deletedImages: normalizeIdList([currentPackage.deletedImages, photoName]),
    }));
  };

  const handleRemoveNewPhoto = (photoIndex) => {
    setUploadError("");
    setDraftPackage((currentPackage) => ({
      ...currentPackage,
      photos: currentPackage.photos.filter((_, index) => index !== photoIndex),
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
    setFormError("");

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
    setFormError("");
    setDraftPackage((currentPackage) => ({
      ...currentPackage,
      extraItems: (currentPackage.extraItems || []).filter(
        (currentItem) => currentItem.name !== itemName
      ),
    }));
  };

  const handleSave = () => {
    const validationMessage = getPackageValidationMessage(draftPackage);

    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    const selectedServiceName = serviceNameOptions.find(
      (option) => option.value === draftPackage.serviceNameId
    );

    onSave({
      ...draftPackage,
      serviceName: selectedServiceName?.label || draftPackage.serviceName,
      packageName: selectedServiceName?.label || draftPackage.packageName,
      times: isDailyPackage ? "1" : String(draftPackage.times).trim(),
      price: String(draftPackage.price).trim(),
      categoryName: draftPackage.categoryName,
      description: draftPackage.description.trim(),
      neighborhoodIds: normalizeIdList(draftPackage.neighborhoodIds),
      extraItems: draftPackage.extraItems || [],
      photos: draftPackage.photos || [],
      deletedImages: draftPackage.deletedImages || [],
    });
  };

  return (
    <ModalShell onClose={onClose} widthClassName="max-h-[92vh] max-w-[900px] overflow-y-auto">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-['Roboto'] text-[28px] font-semibold leading-9 text-[#011C60]">
              Edit Package
            </h2>
            <p className="mt-1 font-['Roboto'] text-[14px] leading-6 text-[#6777A0]">
              Update the package details, coverage, extras, and photos.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F7] text-[22px] leading-none text-[#011C60] transition hover:bg-[#E8ECF6]"
            aria-label="Close edit package"
          >
            ×
          </button>
        </div>

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
                value={draftPackage.pricingType}
                onChange={(event) =>
                  handleFieldChange("pricingType", event.target.value)
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
                max={draftPackage.pricingType === "Weekly" ? 7 : 30}
                value={draftPackage.times}
                disabled={isDailyPackage}
                onChange={(event) => handleFieldChange("times", event.target.value)}
                className={INPUT_CLASS_NAME}
              />
            </label>

            <label>
              <FieldLabel>Service Price</FieldLabel>
              <input
                type="number"
                min="0"
                step="0.01"
                value={draftPackage.price}
                onChange={(event) => handleFieldChange("price", event.target.value)}
                className={INPUT_CLASS_NAME}
                placeholder="0.00"
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
              className={joinClasses(TEXTAREA_CLASS_NAME, "min-h-[120px] resize-y")}
              placeholder="Describe what customers get in this package."
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
                <option value="">Governorate</option>
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
              <div className="min-h-12 rounded-2xl border border-[#F3F4F7] bg-[#F8F9FC] p-3">
                {draftPackage.governorateId ? (
                  <div className="flex flex-wrap gap-2">
                    {coverageOptions.map((option) => {
                      const isSelected = normalizeIdList(
                        draftPackage.neighborhoodIds
                      ).includes(option.value);

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleNeighborhoodToggle(option.value)}
                          className={joinClasses(
                            "rounded-full border px-3 py-1.5 font-['Roboto'] text-[13px] font-semibold transition",
                            isSelected
                              ? "border-[#011C60] bg-[#011C60] text-white"
                              : "border-[#D8DDEB] bg-white text-[#011C60] hover:border-[#EECE42]"
                          )}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                    {isLoadingNeighborhoods && (
                      <span className="px-2 py-1 font-['Roboto'] text-[13px] text-[#6777A0]">
                        Loading...
                      </span>
                    )}
                    {!isLoadingNeighborhoods && coverageOptions.length === 0 && (
                      <span className="px-2 py-1 font-['Roboto'] text-[13px] text-[#6777A0]">
                        No neighborhoods found.
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="font-['Roboto'] text-[13px] text-[#9AA6C7]">
                    Select a governorate first.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <FieldLabel>Extra Items</FieldLabel>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_auto]">
              <input
                type="text"
                value={draftPackage.extraItemName}
                onChange={(event) =>
                  handleFieldChange("extraItemName", event.target.value)
                }
                className={INPUT_CLASS_NAME}
                placeholder="Extra item name"
              />
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={draftPackage.extraItemPrice}
                onChange={(event) =>
                  handleFieldChange("extraItemPrice", event.target.value)
                }
                className={INPUT_CLASS_NAME}
                placeholder="Price"
              />
              <button
                type="button"
                onClick={handleAddExtraItem}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#EECE42] px-5 font-['Roboto'] text-[14px] font-semibold text-[#011C60] transition hover:bg-[#f4d95c]"
              >
                <PlusIcon className="h-4 w-4" />
                Add
              </button>
            </div>
            {extraItemError && (
              <p className="mt-2 font-['Roboto'] text-[13px] text-[#C23434]">
                {extraItemError}
              </p>
            )}
            {draftPackage.extraItems.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {draftPackage.extraItems.map((item) => (
                  <span
                    key={`${item.name}-${item.price}`}
                    className="inline-flex items-center gap-2 rounded-full bg-[#F3F4F7] px-3 py-1.5 font-['Roboto'] text-[13px] font-semibold text-[#011C60]"
                  >
                    {item.name} - {item.price} EGY
                    <button
                      type="button"
                      onClick={() => handleRemoveExtraItem(item.name)}
                      className="text-[#6777A0] hover:text-[#C23434]"
                      aria-label={`Remove ${item.name}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <FieldLabel>Images</FieldLabel>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => handlePhotoChange(event.target.files)}
              className={INPUT_CLASS_NAME}
            />
            {uploadError && (
              <p className="mt-2 font-['Roboto'] text-[13px] text-[#C23434]">
                {uploadError}
              </p>
            )}
            {(draftPackage.photoNames.length > 0 || draftPackage.photos.length > 0) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {draftPackage.photoNames.map((photoName) => (
                  <span
                    key={photoName}
                    className="inline-flex max-w-full items-center gap-2 rounded-full bg-[#F3F4F7] px-3 py-1.5 font-['Roboto'] text-[13px] font-semibold text-[#011C60]"
                  >
                    <span className="max-w-[240px] truncate">{photoName}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingPhoto(photoName)}
                      className="text-[#6777A0] hover:text-[#C23434]"
                      aria-label={`Remove ${photoName}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {draftPackage.photos.map((photo, index) => (
                  <span
                    key={`${photo.name}-${photo.lastModified}`}
                    className="inline-flex max-w-full items-center gap-2 rounded-full bg-[#EEF3FF] px-3 py-1.5 font-['Roboto'] text-[13px] font-semibold text-[#011C60]"
                  >
                    <span className="max-w-[240px] truncate">{photo.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveNewPhoto(index)}
                      className="text-[#6777A0] hover:text-[#C23434]"
                      aria-label={`Remove ${photo.name}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {formError && (
          <div className="rounded-2xl bg-[#FFF0F0] px-4 py-3 font-['Roboto'] text-[14px] font-semibold text-[#C23434]">
            {formError}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-[#E6E8EF] pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#D8DDEB] px-6 font-['Roboto'] text-[15px] font-semibold text-[#011C60] transition hover:border-[#011C60]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#011C60] px-8 font-['Roboto'] text-[15px] font-semibold text-white transition hover:bg-[#02267F]"
          >
            Save Package
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
