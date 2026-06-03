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

const DAILY_RECURRENCE = "Daily";

const normalizeServiceIds = (serviceIds) => [
  ...new Set(
    (serviceIds || []).map((serviceId) => String(serviceId || "").trim()).filter(Boolean)
  ),
];

const getPackageServiceIds = (packageItem) =>
  normalizeServiceIds([
    ...(Array.isArray(packageItem.serviceIds) ? packageItem.serviceIds : []),
    packageItem.serviceId,
    ...(Array.isArray(packageItem.services)
      ? packageItem.services.map((service) => service?.id)
      : []),
  ]);

const getServiceId = (service) => String(service?.id || "");

const getServiceName = (service) =>
  service?.serviceName || service?.name || "Saved service";

export default function PackageEditModal({
  packageItem,
  savedServices = [],
  onClose,
  onSave,
}) {
  const initialPricingType =
    (packageItem.pricingType || packageItem.packageType || "").charAt(0).toUpperCase() +
    (packageItem.pricingType || packageItem.packageType || "").slice(1).toLowerCase();
  const [draft, setDraft] = useState({
    ...packageItem,
    serviceIds: getPackageServiceIds(packageItem),
    pricingType: initialPricingType,
    times:
      initialPricingType === DAILY_RECURRENCE
        ? "1"
        : packageItem.times || packageItem.durationHours || "",
  });
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const isDailyPackage = draft.pricingType === DAILY_RECURRENCE;

  const handleFieldChange = (fieldName, value) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [fieldName]: value,
      ...(fieldName === "pricingType" && value === DAILY_RECURRENCE
        ? { times: "1" }
        : {}),
    }));
  };

  const handleAddService = () => {
    const serviceId = selectedServiceId.trim();

    if (!serviceId) return;

    setDraft((currentDraft) => ({
      ...currentDraft,
      serviceIds: normalizeServiceIds([...(currentDraft.serviceIds || []), serviceId]),
    }));
    setSelectedServiceId("");
  };

  const handleRemoveService = (serviceId) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      serviceIds: (currentDraft.serviceIds || []).filter(
        (includedServiceId) => includedServiceId !== serviceId
      ),
    }));
  };

  const handleSave = () => {
    const nextPackage = {
      ...draft,
      packageName: draft.packageName.trim(),
      pricingType: draft.pricingType,
      times: isDailyPackage ? "1" : draft.times,
      price: String(draft.price || "").trim(),
      serviceIds: normalizeServiceIds(draft.serviceIds),
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
                disabled={isDailyPackage}
                onChange={(event) => handleFieldChange("times", event.target.value)}
                className={joinClasses(
                  INPUT_CLASS_NAME,
                  isDailyPackage && "cursor-not-allowed opacity-70"
                )}
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
              <FieldLabel>Included Services</FieldLabel>
              <button
                type="button"
                onClick={handleAddService}
                disabled={!selectedServiceId}
                className={joinClasses(
                  "inline-flex min-h-9 items-center gap-2 self-start rounded-xl px-3 font-['Roboto'] text-[14px] font-medium transition",
                  selectedServiceId
                    ? "cursor-pointer text-[#011C60] hover:bg-[#EFF3FF]"
                    : "cursor-not-allowed text-[#9AA6C7]"
                )}
              >
                <PlusIcon className="h-4 w-4" />
                Add Service
              </button>
            </div>

            {(draft.serviceIds || []).length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {draft.serviceIds.map((serviceId) => {
                  const service = savedServices.find(
                    (savedService) => getServiceId(savedService) === serviceId
                  );
                  const serviceName = getServiceName(service) || serviceId;

                  return (
                  <span
                    key={serviceId}
                    className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-[#F3F4F7] px-4 font-['Roboto'] text-[13px] font-medium leading-5 text-[#6777A0]"
                  >
                    {serviceName}
                    <button
                      type="button"
                      onClick={() => handleRemoveService(serviceId)}
                      aria-label={`Remove ${serviceName}`}
                      className="cursor-pointer text-[#6777A0] transition hover:text-[#011C60]"
                    >
                      x
                    </button>
                  </span>
                  );
                })}
              </div>
            ) : (
              <p className="font-['Roboto'] text-[14px] leading-5 text-[#6777A0]">
                Choose one or more saved services to include in this package.
              </p>
            )}

            <label className="relative mt-3 block max-w-[360px]">
              <select
                value={selectedServiceId}
                onChange={(event) => setSelectedServiceId(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddService();
                  }
                }}
                className={SELECT_CLASS_NAME}
              >
                <option value="">Select service</option>
                {savedServices
                  .filter(
                    (service) => !(draft.serviceIds || []).includes(getServiceId(service))
                  )
                  .map((service) => (
                    <option key={getServiceId(service)} value={getServiceId(service)}>
                      {getServiceName(service)}
                    </option>
                  ))}
              </select>
              <SelectArrow />
            </label>

            {savedServices.length === 0 && (
              <p className="mt-3 font-['Roboto'] text-[14px] leading-5 text-[#6777A0]">
                Add a service first, then include it in a package.
              </p>
            )}
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
