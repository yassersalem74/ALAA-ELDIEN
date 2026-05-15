import { useState } from "react";

import {
  FieldLabel,
  INPUT_CLASS_NAME,
  ModalShell,
  PlusIcon,
  SELECT_CLASS_NAME,
  SelectArrow,
  joinClasses,
} from "../add-service-flow/PartnerFlowShared";

const PRICING_TYPE_OPTIONS = [
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
];

const getServiceItems = (service) =>
  (service?.items || [])
    .map((item) => item.itemName || item.name)
    .filter((itemName) => String(itemName || "").trim());

const normalizeIncludedItems = (includedItems) => {
  if (Array.isArray(includedItems)) {
    return includedItems
      .map((item) =>
        typeof item === "string"
          ? item
          : item.itemName || item.name || item.title || item.description || ""
      )
      .map((itemName) => String(itemName || "").trim())
      .filter(Boolean);
  }

  return String(includedItems || "")
    .split(",")
    .map((itemName) => itemName.trim())
    .filter(Boolean);
};

export default function PackageEditModal({
  packageItem,
  savedServices = [],
  onClose,
  onSave,
}) {
  const selectedPackageService = savedServices.find(
    (service) => service.id === packageItem.serviceId
  );
  const initialIncludedItems = normalizeIncludedItems(packageItem.includedItems);
  const [draft, setDraft] = useState({
    ...packageItem,
    pricingType:
      (packageItem.pricingType || packageItem.packageType || "").charAt(0).toUpperCase() +
      (packageItem.pricingType || packageItem.packageType || "").slice(1).toLowerCase(),
    times: packageItem.times || packageItem.durationHours || "",
    includedItems:
      initialIncludedItems.length > 0
        ? initialIncludedItems
        : getServiceItems(selectedPackageService),
  });
  const [newFeature, setNewFeature] = useState("");

  const selectedService = savedServices.find(
    (service) => service.id === draft.serviceId
  );

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
      includedItems: getServiceItems(nextService),
    }));
  };

  const handleRemoveFeature = (featureName) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      includedItems: (currentDraft.includedItems || []).filter(
        (includedItem) => includedItem !== featureName
      ),
    }));
  };

  const handleAddFeature = () => {
    const trimmedFeature = newFeature.trim();

    if (!trimmedFeature) return;

    setDraft((currentDraft) => ({
      ...currentDraft,
      includedItems: (currentDraft.includedItems || []).includes(trimmedFeature)
        ? currentDraft.includedItems
        : [...(currentDraft.includedItems || []), trimmedFeature],
    }));
    setNewFeature("");
  };

  const handleSave = () => {
    const nextPackage = {
      ...draft,
      packageName: draft.packageName.trim(),
      serviceName: draft.serviceName.trim(),
      pricingType: draft.pricingType,
      times: draft.times,
      price: String(draft.price || "").trim(),
      includedItems: draft.includedItems || [],
    };

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
              Update the full package data saved through the provider API.
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

          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <FieldLabel>Included Features</FieldLabel>
              <button
                type="button"
                onClick={handleAddFeature}
                className="inline-flex min-h-9 cursor-pointer items-center gap-2 self-start rounded-xl px-3 font-['Roboto'] text-[14px] font-medium text-[#011C60] transition hover:bg-[#EFF3FF]"
              >
                <PlusIcon className="h-4 w-4" />
                Add Feature
              </button>
            </div>

            {(draft.includedItems || []).length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {draft.includedItems.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-[#F3F4F7] px-4 font-['Roboto'] text-[13px] font-medium leading-5 text-[#6777A0]"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(feature)}
                      aria-label={`Remove ${feature}`}
                      className="cursor-pointer text-[#6777A0] transition hover:text-[#011C60]"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="font-['Roboto'] text-[14px] leading-5 text-[#6777A0]">
                {selectedService
                  ? "This service has no items yet. Add package features manually."
                  : "Choose a service to load its items, or add package features manually."}
              </p>
            )}

            <div className="mt-3 flex max-w-[260px] items-center gap-2 rounded-xl bg-white shadow-[0px_8px_24px_rgba(17,27,71,0.08)]">
              <input
                type="text"
                value={newFeature}
                onChange={(event) => setNewFeature(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="Type new feature"
                className="min-h-9 min-w-0 flex-1 rounded-xl px-3 font-['Roboto'] text-[13px] font-medium text-[#011C60] outline-none placeholder:text-[#6777A0]"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className={joinClasses(
                  "mr-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-[#EFF3FF] transition",
                  newFeature.trim() ? "text-[#011C60]" : "text-[#9AA6C7]"
                )}
                aria-label="Add typed feature"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
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
