import { useEffect, useState } from "react";

import { getNeighborhoods } from "../../../../api/auth/auth.api";
import {
  FieldLabel,
  INPUT_CLASS_NAME,
  ModalShell,
  PlusIcon,
  SELECT_CLASS_NAME,
  SelectArrow,
  TEXTAREA_CLASS_NAME,
} from "../add-service-flow/PartnerFlowShared";
import {
  HOUR_OPTIONS,
  SERVICE_CATEGORY_OPTIONS,
  WEEKDAY_OPTIONS,
  getCategoryLabel,
} from "../add-service-flow/partnerFlowData";

const itemsToText = (items = []) =>
  items
    .map((item) => [item.itemName, item.price, item.description].join(" | "))
    .join("\n");

const textToItems = (itemsText) =>
  itemsText
    .split("\n")
    .map((line, index) => {
      const [itemName = "", price = "", description = ""] = line
        .split("|")
        .map((part) => part.trim());

      return itemName
        ? {
            id: `service-item-edit-${Date.now()}-${index}`,
            itemName,
            price,
            description,
          }
        : null;
    })
    .filter(Boolean);

const extractPayloadData = (response) => response?.data ?? response;

const extractList = (response) => {
  const data = extractPayloadData(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const toOption = (item) => ({
  value: item.id,
  label: item.name,
});

export default function ServiceEditModal({
  service,
  governorateOptions = [],
  onClose,
  onSave,
}) {
  const [draft, setDraft] = useState({
    ...service,
    availability: {
      days: [],
      startHour: "9",
      endHour: "17",
      dailyWindow: false,
      ...(service.availability || {}),
    },
    itemsText: itemsToText(service.items),
    photoNames: service.photoNames || [],
    photos: service.photos || [],
    deletedImages: service.deletedImages || [],
  });
  const [neighborhoodOptions, setNeighborhoodOptions] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const hasSelectedCategoryOption = SERVICE_CATEGORY_OPTIONS.some(
    (option) => option.value === draft.category
  );
  const hasSelectedGovernorateOption = governorateOptions.some(
    (option) => option.value === draft.governorate
  );
  const hasSelectedNeighborhoodOption = neighborhoodOptions.some(
    (option) => option.value === draft.coverageArea
  );

  useEffect(() => {
    if (!draft.governorate) {
      setNeighborhoodOptions([]);
      return;
    }

    const fetchNeighborhoods = async () => {
      try {
        const response = await getNeighborhoods(draft.governorate, "en");
        setNeighborhoodOptions(extractList(response).map(toOption));
      } catch {
        setNeighborhoodOptions([]);
      }
    };

    fetchNeighborhoods();
  }, [draft.governorate]);

  const handleFieldChange = (fieldName, value) => {
    setDraft((currentDraft) => {
      if (fieldName === "governorate") {
        return {
          ...currentDraft,
          governorate: value,
          coverageArea: "",
        };
      }

      return {
        ...currentDraft,
        [fieldName]: value,
      };
    });
  };

  const handleAvailabilityChange = (fieldName, value) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      availability: {
        ...currentDraft.availability,
        [fieldName]: value,
      },
    }));
  };

  const handleToggleDay = (day) => {
    setDraft((currentDraft) => {
      const days = currentDraft.availability.days || [];
      const nextDays = days.includes(day)
        ? days.filter((currentDay) => currentDay !== day)
        : [...days, day];

      return {
        ...currentDraft,
        availability: {
          ...currentDraft.availability,
          days: nextDays,
        },
      };
    });
  };

  const handlePhotoChange = (fileList) => {
    const files = Array.from(fileList || []);

    setDraft((currentDraft) => {
      const existingCount = currentDraft.photoNames.length;
      const nextFiles = [...(currentDraft.photos || [])];

      files.forEach((file) => {
        const alreadySelected = nextFiles.some(
          (currentFile) =>
            currentFile.name === file.name &&
            currentFile.size === file.size &&
            currentFile.lastModified === file.lastModified
        );

        if (!alreadySelected && existingCount + nextFiles.length < 5) {
          nextFiles.push(file);
        }
      });

      if (existingCount + (currentDraft.photos || []).length + files.length > 5) {
        setUploadError("You can keep up to 5 photos only.");
      } else {
        setUploadError("");
      }

      return {
        ...currentDraft,
        photos: nextFiles,
      };
    });
  };

  const handleRemoveExistingPhoto = (photoName) => {
    setUploadError("");
    setDraft((currentDraft) => ({
      ...currentDraft,
      photoNames: currentDraft.photoNames.filter((name) => name !== photoName),
      deletedImages: currentDraft.deletedImages.includes(photoName)
        ? currentDraft.deletedImages
        : [...currentDraft.deletedImages, photoName],
    }));
  };

  const handleRemoveNewPhoto = (photoIndex) => {
    setUploadError("");
    setDraft((currentDraft) => ({
      ...currentDraft,
      photos: currentDraft.photos.filter((_, index) => index !== photoIndex),
    }));
  };

  const handleSave = () => {
    const nextService = {
      ...draft,
      serviceName: draft.serviceName.trim(),
      categoryLabel: getCategoryLabel(draft.category),
      location: `${neighborhoodOptions.find((option) => option.value === draft.coverageArea)?.label || draft.coverageArea}, ${
        governorateOptions.find((option) => option.value === draft.governorate)?.label || draft.governorate
      }`,
      description: draft.description.trim(),
      longDescription: draft.longDescription.trim(),
      items: textToItems(draft.itemsText),
      photoNames: draft.photoNames,
      photos: draft.photos,
      deletedImages: draft.deletedImages,
    };

    delete nextService.itemsText;

    onSave(nextService);
  };

  return (
    <ModalShell onClose={onClose} widthClassName="max-w-[860px]">
      <div className="max-h-[calc(100vh-5rem)] overflow-y-auto pr-1">
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="font-['Roboto'] text-[28px] font-semibold leading-[40px] text-[#011C60]">
              Edit Service
            </h3>
            <p className="mt-1 font-['Roboto'] text-[14px] leading-5 text-[#6777A0]">
              Update the full service data saved through the provider API.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <FieldLabel>Service Name</FieldLabel>
              <input
                type="text"
                value={draft.serviceName}
                onChange={(event) => handleFieldChange("serviceName", event.target.value)}
                className={INPUT_CLASS_NAME}
              />
            </label>

            <label className="relative">
              <FieldLabel>Category</FieldLabel>
              <select
                value={draft.category}
                onChange={(event) => handleFieldChange("category", event.target.value)}
                className={SELECT_CLASS_NAME}
              >
                {!hasSelectedCategoryOption && draft.category && (
                  <option value={draft.category}>{draft.categoryLabel || draft.category}</option>
                )}
                {SERVICE_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <SelectArrow />
            </label>

            <label className="relative">
              <FieldLabel>Governorate</FieldLabel>
              <select
                value={draft.governorate}
                onChange={(event) => handleFieldChange("governorate", event.target.value)}
                className={SELECT_CLASS_NAME}
              >
                {!hasSelectedGovernorateOption && draft.governorate && (
                  <option value={draft.governorate}>{draft.governorate}</option>
                )}
                {governorateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <SelectArrow />
            </label>

            <label className="relative">
              <FieldLabel>Coverage Area</FieldLabel>
              <select
                value={draft.coverageArea}
                onChange={(event) => handleFieldChange("coverageArea", event.target.value)}
                className={SELECT_CLASS_NAME}
              >
                {!hasSelectedNeighborhoodOption && draft.coverageArea && (
                  <option value={draft.coverageArea}>{draft.coverageArea}</option>
                )}
                {neighborhoodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <SelectArrow />
            </label>

            <label>
              <FieldLabel>Price</FieldLabel>
              <input
                type="number"
                min="0"
                step="0.01"
                value={draft.price}
                onChange={(event) => handleFieldChange("price", event.target.value)}
                className={INPUT_CLASS_NAME}
              />
            </label>

            <label>
              <FieldLabel>Service Time</FieldLabel>
              <input
                type="number"
                min="1"
                step="1"
                value={draft.serviceTimeHours}
                onChange={(event) => handleFieldChange("serviceTimeHours", event.target.value)}
                className={INPUT_CLASS_NAME}
              />
            </label>
          </div>

          <label>
            <FieldLabel>Short Description</FieldLabel>
            <input
              type="text"
              value={draft.description}
              onChange={(event) => handleFieldChange("description", event.target.value)}
              className={INPUT_CLASS_NAME}
            />
          </label>

          <label>
            <FieldLabel>Long Description</FieldLabel>
            <textarea
              rows="4"
              value={draft.longDescription}
              onChange={(event) => handleFieldChange("longDescription", event.target.value)}
              className={TEXTAREA_CLASS_NAME}
            />
          </label>

          <div>
            <FieldLabel>Images</FieldLabel>
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

            {(draft.photoNames.length > 0 || draft.photos.length > 0) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {draft.photoNames.map((photoName) => (
                  <span
                    key={photoName}
                    className="inline-flex min-h-8 items-center gap-2 rounded-full bg-[#EAF0FF] px-3 py-1.5 font-['Roboto'] text-[13px] font-medium text-[#011C60]"
                  >
                    {photoName}
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingPhoto(photoName)}
                      aria-label={`Remove ${photoName}`}
                      className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-[#6777A0] transition hover:bg-white hover:text-[#011C60]"
                    >
                      x
                    </button>
                  </span>
                ))}

                {draft.photos.map((file, index) => (
                  <span
                    key={`${file.name}-${file.lastModified}`}
                    className="inline-flex min-h-8 items-center gap-2 rounded-full bg-[#EAF0FF] px-3 py-1.5 font-['Roboto'] text-[13px] font-medium text-[#011C60]"
                  >
                    {file.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveNewPhoto(index)}
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

          <label>
            <FieldLabel>Service Items</FieldLabel>
            <textarea
              rows="4"
              value={draft.itemsText}
              onChange={(event) => handleFieldChange("itemsText", event.target.value)}
              placeholder="Item name | price | description"
              className={TEXTAREA_CLASS_NAME}
            />
          </label>

          <div className="rounded-2xl border border-[#E6E8EF] bg-[#FCFCFE] p-4">
            <FieldLabel>Availability Days</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_OPTIONS.map((day) => {
                const isSelected = draft.availability.days.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`rounded-xl border px-3 py-2 font-['Roboto'] text-[13px] font-medium transition ${
                      isSelected
                        ? "border-[#011C60] bg-[#011C60] text-white"
                        : "border-[#CCD2DF] bg-white text-[#6777A0]"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="relative">
                <FieldLabel>From</FieldLabel>
                <select
                  value={draft.availability.startHour}
                  onChange={(event) => handleAvailabilityChange("startHour", event.target.value)}
                  className={SELECT_CLASS_NAME}
                  disabled={draft.availability.dailyWindow}
                >
                  {HOUR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </label>

              <label className="relative">
                <FieldLabel>To</FieldLabel>
                <select
                  value={draft.availability.endHour}
                  onChange={(event) => handleAvailabilityChange("endHour", event.target.value)}
                  className={SELECT_CLASS_NAME}
                  disabled={draft.availability.dailyWindow}
                >
                  {HOUR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </label>
            </div>

            <label className="mt-4 flex items-center gap-3">
              <input
                type="checkbox"
                checked={draft.availability.dailyWindow}
                onChange={(event) =>
                  handleAvailabilityChange("dailyWindow", event.target.checked)
                }
                className="h-4 w-4"
              />
              <span className="font-['Roboto'] text-[14px] font-medium text-[#011C60]">
                Daily Window
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-12 cursor-pointer rounded-2xl border border-[#011C60] px-6 font-['Roboto'] text-[16px] font-semibold text-[#011C60]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="min-h-12 cursor-pointer rounded-2xl bg-[#011C60] px-8 font-['Roboto'] text-[16px] font-semibold text-white transition hover:bg-[#02267F]"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
