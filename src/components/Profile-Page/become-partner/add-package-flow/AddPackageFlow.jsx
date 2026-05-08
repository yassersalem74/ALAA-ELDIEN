import { useState } from "react";

import { addPackage } from "../../../../api/services/service.api";
import {
  FieldLabel,
  FlowActions,
  INPUT_CLASS_NAME,
  PlusIcon,
  SELECT_CLASS_NAME,
  SelectArrow,
  SectionHeading,
  joinClasses,
} from "../add-service-flow/PartnerFlowShared";

const createEmptyPackage = () => ({
  packageName: "",
  serviceId: "",
  serviceName: "",
  pricingType: "",
  times: "",
  price: "",
  includedItems: [],
});

const isPackageComplete = (draft) =>
  [
    draft.packageName,
    draft.serviceId,
    draft.serviceName,
    draft.pricingType,
    draft.times,
    draft.price,
  ].every((value) => String(value || "").trim());

const PRICING_TYPE_OPTIONS = [
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
];

const getPackageValidationMessage = (draft) => {
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

  return "";
};

const buildPackagePayload = (packageItem) => ({
  name: packageItem.packageName.trim(),
  recurrence: packageItem.pricingType,
  daysPerInterval: Number(packageItem.times) || 1,
  price: Number(packageItem.price) || 0,
  serviceIds: [packageItem.serviceId].filter(Boolean),
});

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

const deleteCookie = (name) => {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};

const clearAuthSession = () => {
  if (typeof window === "undefined") return;

  ["token", "user", "accountType", "loggedInAs"].forEach((key) => {
    localStorage.removeItem(key);
  });

  deleteCookie("alaa_auth_session");
  deleteCookie("alaa_auth_token");
  deleteCookie("alaa_account_type");
};

const isUnauthorizedError = (error) => error?.response?.status === 401;

const getServiceItems = (service) =>
  (service?.items || [])
    .map((item) => item.itemName)
    .filter((itemName) => String(itemName || "").trim());

export default function AddPackageFlow({
  onBack,
  onToast,
  savedServices = [],
  onSaved,
  hasProviderAccess = true,
}) {
  const [draftPackage, setDraftPackage] = useState(createEmptyPackage);
  const [newFeature, setNewFeature] = useState("");

  const selectedService = savedServices.find(
    (service) => service.id === draftPackage.serviceId
  );

  const handleFieldChange = (fieldName, value) => {
    setDraftPackage((currentPackage) => ({
      ...currentPackage,
      [fieldName]: value,
    }));
  };

  const handleServiceChange = (serviceId) => {
    const nextService = savedServices.find((service) => service.id === serviceId);
    const nextIncludedItems = getServiceItems(nextService);

    setDraftPackage((currentPackage) => ({
      ...currentPackage,
      serviceId,
      serviceName: nextService?.serviceName || "",
      includedItems: nextIncludedItems,
    }));
  };

  const handleRemoveFeature = (featureName) => {
    setDraftPackage((currentPackage) => ({
      ...currentPackage,
      includedItems: currentPackage.includedItems.filter(
        (includedItem) => includedItem !== featureName
      ),
    }));
  };

  const handleAddFeature = () => {
    const trimmedFeature = newFeature.trim();

    if (!trimmedFeature) return;

    setDraftPackage((currentPackage) => ({
      ...currentPackage,
      includedItems: currentPackage.includedItems.includes(trimmedFeature)
        ? currentPackage.includedItems
        : [...currentPackage.includedItems, trimmedFeature],
    }));
    setNewFeature("");
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
      const response = await addPackage(buildPackagePayload(draftPackage));
      const didRefresh = await onSaved?.(response);

      if (didRefresh === false) {
        return;
      }

      setDraftPackage(createEmptyPackage());
      onToast({
        id: Date.now(),
        type: "success",
        message: "Your package has been saved successfully.",
      });
    } catch (error) {
      if (isUnauthorizedError(error)) {
        clearAuthSession();
        onToast({
          id: Date.now(),
          type: "error",
          message: "Your session expired. Please sign in again.",
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
      <section className="rounded-[24px] border border-[#E6E8EF] bg-white p-5 shadow-[0px_12px_40px_rgba(17,27,71,0.06)] sm:p-6 lg:max-w-[760px]">
        <div className="flex flex-col gap-8">
          <SectionHeading
            title="Create your first package"
            description="Define how you want to be booked. You can add more packages later."
          />

          <div className="rounded-[16px] border border-[#E6E8EF] bg-white p-4 shadow-[0px_10px_28px_rgba(17,27,71,0.05)] sm:p-5">
            <h3 className="font-['Roboto'] text-[16px] font-semibold leading-6 text-[#011C60]">
              Packages Details
            </h3>

            <div className="mt-6 grid gap-5">
              <label className="relative">
                <FieldLabel>Service name</FieldLabel>
                <select
                  value={draftPackage.serviceId}
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

              {savedServices.length === 0 && (
                <p className="font-['Roboto'] text-[14px] leading-5 text-[#6777A0]">
                  Add a service first, then create packages from its items.
                </p>
              )}

              <label>
                <FieldLabel>Package Name</FieldLabel>
                <input
                  type="text"
                  value={draftPackage.packageName}
                  onChange={(event) =>
                    handleFieldChange("packageName", event.target.value)
                  }
                  placeholder="e.g., Premium Home Cleaning"
                  className={INPUT_CLASS_NAME}
                />
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="relative">
                  <FieldLabel>Pricing Type</FieldLabel>
                  <select
                    value={draftPackage.pricingType}
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
                    value={draftPackage.times}
                    onChange={(event) =>
                      handleFieldChange("times", event.target.value)
                    }
                    placeholder="Estimated Duration"
                    className={INPUT_CLASS_NAME}
                  />
                </label>

                <label>
                  <FieldLabel>Price</FieldLabel>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={draftPackage.price}
                    onChange={(event) =>
                      handleFieldChange("price", event.target.value)
                    }
                    placeholder="$0.00"
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

                <div className="flex flex-wrap gap-3">
                  {draftPackage.includedItems.map((feature) => (
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

                {selectedService && draftPackage.includedItems.length === 0 && (
                  <p className="mt-3 font-['Roboto'] text-[14px] leading-5 text-[#6777A0]">
                    This service has no items yet. Add package features manually.
                  </p>
                )}
              </div>
            </div>
          </div>

          <FlowActions
            secondaryLabel="skip"
            onSecondary={onBack}
            primaryLabel="Save Changes"
            onPrimary={handleSave}
            primaryDisabled={!isPackageComplete(draftPackage)}
          />
        </div>
      </section>
    </div>
  );
}
