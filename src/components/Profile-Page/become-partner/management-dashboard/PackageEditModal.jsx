import { useState } from "react";

import {
  FieldLabel,
  INPUT_CLASS_NAME,
  ModalShell,
  SELECT_CLASS_NAME,
  SelectArrow,
} from "../add-service-flow/PartnerFlowShared";

const PRICING_TYPE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const getServiceItems = (service) =>
  (service?.items || [])
    .map((item) => item.itemName)
    .filter((itemName) => String(itemName || "").trim());

export default function PackageEditModal({
  packageItem,
  savedServices = [],
  onClose,
  onSave,
}) {
  const [draft, setDraft] = useState({
    ...packageItem,
    pricingType: packageItem.pricingType || packageItem.packageType || "",
    times: packageItem.times || packageItem.durationHours || "",
    includedItemsText: Array.isArray(packageItem.includedItems)
      ? packageItem.includedItems.join(", ")
      : packageItem.includedItems || "",
  });

  const handleFieldChange = (fieldName, value) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [fieldName]: value,
    }));
  };

  const handleServiceChange = (serviceId) => {
    const nextService = savedServices.find((service) => service.id === serviceId);

    setDraft((currentDraft) => ({
      ...currentDraft,
      serviceId,
      serviceName: nextService?.serviceName || "",
      includedItemsText: getServiceItems(nextService).join(", "),
    }));
  };

  const handleSave = () => {
    const nextPackage = {
      ...draft,
      packageName: draft.packageName.trim(),
      serviceName: draft.serviceName.trim(),
      pricingType: draft.pricingType,
      times: draft.times,
      price: String(draft.price || "").trim(),
      includedItems: draft.includedItemsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    delete nextPackage.includedItemsText;
    onSave(nextPackage);
  };

  return (
    <ModalShell onClose={onClose} widthClassName="max-w-[760px]">
      <div className="max-h-[calc(100vh-5rem)] overflow-y-auto pr-1">
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="font-['Roboto'] text-[28px] font-semibold leading-[40px] text-[#011C60]">
              Edit Package
            </h3>
            <p className="mt-1 font-['Roboto'] text-[14px] leading-5 text-[#6777A0]">
              Update the full package data saved in local storage.
            </p>
          </div>

          <label className="relative">
            <FieldLabel>Service Name</FieldLabel>
            <select
              value={draft.serviceId || ""}
              onChange={(event) => handleServiceChange(event.target.value)}
              className={SELECT_CLASS_NAME}
            >
              <option value="">Select service</option>
              {savedServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.serviceName}
                </option>
              ))}
            </select>
            <SelectArrow />
          </label>

          {!savedServices.some((service) => service.id === draft.serviceId) &&
            draft.serviceName && (
              <label>
                <FieldLabel>Saved Service Name</FieldLabel>
                <input
                  type="text"
                  value={draft.serviceName}
                  onChange={(event) =>
                    handleFieldChange("serviceName", event.target.value)
                  }
                  className={INPUT_CLASS_NAME}
                />
              </label>
            )}

          <label>
            <FieldLabel>Package Name</FieldLabel>
            <input
              type="text"
              value={draft.packageName}
              onChange={(event) =>
                handleFieldChange("packageName", event.target.value)
              }
              className={INPUT_CLASS_NAME}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="relative">
              <FieldLabel>Pricing Type</FieldLabel>
              <select
                value={draft.pricingType}
                onChange={(event) =>
                  handleFieldChange("pricingType", event.target.value)
                }
                className={SELECT_CLASS_NAME}
              >
                <option value="">Pricing Type</option>
                {PRICING_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <SelectArrow />
            </label>

            <label>
              <FieldLabel>Times</FieldLabel>
              <input
                type="text"
                value={draft.times}
                onChange={(event) => handleFieldChange("times", event.target.value)}
                className={INPUT_CLASS_NAME}
              />
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
          </div>

          <label>
            <FieldLabel>Included Features</FieldLabel>
            <input
              type="text"
              value={draft.includedItemsText}
              onChange={(event) =>
                handleFieldChange("includedItemsText", event.target.value)
              }
              className={INPUT_CLASS_NAME}
            />
          </label>

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
