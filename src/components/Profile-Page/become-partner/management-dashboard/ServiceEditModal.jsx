import { useState } from "react";

import {
  FieldLabel,
  INPUT_CLASS_NAME,
  ModalShell,
  SELECT_CLASS_NAME,
  SelectArrow,
  TEXTAREA_CLASS_NAME,
} from "../add-service-flow/PartnerFlowShared";
import {
  GOVERNORATE_OPTIONS,
  HOUR_OPTIONS,
  SERVICE_CATEGORY_OPTIONS,
  WEEKDAY_OPTIONS,
  getCategoryLabel,
  getCoverageAreaOptions,
  getGovernorateLabel,
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

export default function ServiceEditModal({ service, onClose, onSave }) {
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
    photoNamesText: (service.photoNames || []).join(", "),
  });

  const coverageAreaOptions = getCoverageAreaOptions(draft.governorate);

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

  const handleSave = () => {
    const nextService = {
      ...draft,
      serviceName: draft.serviceName.trim(),
      categoryLabel: getCategoryLabel(draft.category),
      location: `${draft.coverageArea}, ${getGovernorateLabel(draft.governorate)}`,
      description: draft.description.trim(),
      longDescription: draft.longDescription.trim(),
      items: textToItems(draft.itemsText),
      photoNames: draft.photoNamesText
        .split(",")
        .map((photoName) => photoName.trim())
        .filter(Boolean),
    };

    delete nextService.itemsText;
    delete nextService.photoNamesText;

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
              Update the full service data saved in local storage.
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
                {GOVERNORATE_OPTIONS.map((option) => (
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
                {coverageAreaOptions.map((option) => (
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

          <label>
            <FieldLabel>Photo Names</FieldLabel>
            <input
              type="text"
              value={draft.photoNamesText}
              onChange={(event) => handleFieldChange("photoNamesText", event.target.value)}
              className={INPUT_CLASS_NAME}
            />
          </label>

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
