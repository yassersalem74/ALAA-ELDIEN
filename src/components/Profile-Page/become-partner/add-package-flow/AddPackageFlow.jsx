import { useEffect, useMemo, useState } from "react";

import {
  CheckIcon,
  FieldLabel,
  FlowActions,
  INPUT_CLASS_NAME,
  PackageIcon,
  PANEL_CLASS_NAME,
  SELECT_CLASS_NAME,
  SelectArrow,
  SectionHeading,
  joinClasses,
} from "../add-service-flow/PartnerFlowShared";
import { FLOW_ASSETS } from "../add-service-flow/partnerFlowData";

const PACKAGE_STORAGE_KEY = "alaa-partner-packages";
const SERVICE_STORAGE_KEY = "alaa-partner-services";

const PRICING_TYPE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const createEmptyPackage = () => ({
  serviceId: "",
  packageName: "",
  pricingType: "",
  times: "",
  price: "",
  selectedItemIds: [],
  customFeatureDraft: "",
  customFeatures: [],
});

const readStoredRecords = (storageKey) => {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
};

const writeStoredPackages = (packages) => {
  localStorage.setItem(PACKAGE_STORAGE_KEY, JSON.stringify(packages));
};

const getSelectedService = (services, serviceId) =>
  services.find((service) => service.id === serviceId) || null;

const getFeatureLabels = (service, draftPackage) => {
  const serviceFeatures =
    service?.items
      ?.filter((item) => draftPackage.selectedItemIds.includes(item.id))
      .map((item) => item.itemName) || [];

  return [...serviceFeatures, ...draftPackage.customFeatures];
};

const isPackageComplete = (draftPackage, selectedService) =>
  [
    draftPackage.serviceId,
    draftPackage.packageName,
    draftPackage.pricingType,
    draftPackage.times,
    draftPackage.price,
  ].every((value) => String(value || "").trim()) &&
  getFeatureLabels(selectedService, draftPackage).length > 0;

export default function AddPackageFlow({ onBack, onToast, onPackageSaved }) {
  const [step, setStep] = useState("form");
  const [draftPackage, setDraftPackage] = useState(createEmptyPackage);
  const [savedPackages, setSavedPackages] = useState(() =>
    readStoredRecords(PACKAGE_STORAGE_KEY)
  );
  const [savedServices] = useState(() => readStoredRecords(SERVICE_STORAGE_KEY));

  const selectedService = useMemo(
    () => getSelectedService(savedServices, draftPackage.serviceId),
    [draftPackage.serviceId, savedServices]
  );
  const selectedFeatureLabels = getFeatureLabels(selectedService, draftPackage);
  const canReview = isPackageComplete(draftPackage, selectedService);

  useEffect(() => {
    writeStoredPackages(savedPackages);
  }, [savedPackages]);

  const handleFieldChange = (fieldName, value) => {
    setDraftPackage((currentPackage) => {
      if (fieldName === "serviceId") {
        return {
          ...currentPackage,
          serviceId: value,
          selectedItemIds: [],
          customFeatureDraft: "",
          customFeatures: [],
        };
      }

      return {
        ...currentPackage,
        [fieldName]: value,
      };
    });
  };

  const handleToggleFeature = (itemId) => {
    setDraftPackage((currentPackage) => {
      const isSelected = currentPackage.selectedItemIds.includes(itemId);

      return {
        ...currentPackage,
        selectedItemIds: isSelected
          ? currentPackage.selectedItemIds.filter((id) => id !== itemId)
          : [...currentPackage.selectedItemIds, itemId],
      };
    });
  };

  const handleAddCustomFeature = () => {
    const nextFeature = draftPackage.customFeatureDraft.trim();

    if (!nextFeature) return;

    setDraftPackage((currentPackage) => ({
      ...currentPackage,
      customFeatureDraft: "",
      customFeatures: [...currentPackage.customFeatures, nextFeature],
    }));
  };

  const handleRemoveCustomFeature = (featureName) => {
    setDraftPackage((currentPackage) => ({
      ...currentPackage,
      customFeatures: currentPackage.customFeatures.filter(
        (feature) => feature !== featureName
      ),
    }));
  };

  const handleSave = () => {
    if (!canReview) return;

    const nextPackageId = `partner-package-${savedPackages.length + 1}`;
    const nextPackage = {
      id: nextPackageId,
      serviceId: draftPackage.serviceId,
      serviceName: selectedService.serviceName,
      packageName: draftPackage.packageName.trim(),
      pricingType: draftPackage.pricingType,
      times: draftPackage.times,
      price: draftPackage.price,
      includedFeatures: selectedFeatureLabels,
    };

    setSavedPackages((currentPackages) => [nextPackage, ...currentPackages]);
    onPackageSaved(nextPackage);
    setStep("success");
    onToast({
      id: nextPackageId,
      type: "success",
      message: "Your package has been saved successfully.",
    });
  };

  const resetForAnotherPackage = () => {
    setDraftPackage(createEmptyPackage());
    setStep("form");
  };

  const renderNoServicesState = () => (
    <section className={PANEL_CLASS_NAME}>
      <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF3FF]">
          <PackageIcon className="h-7 w-7" />
        </span>
        <h2 className="mt-6 font-['Roboto'] text-[28px] font-semibold leading-10 text-[#011C60]">
          Create a service first
        </h2>
        <p className="mt-3 max-w-xl font-['Roboto'] text-[16px] leading-6 text-[#6777A0]">
          Packages use the items from an existing service, so add a service with
          items before creating a package.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-8 min-h-12 min-w-[180px] cursor-pointer rounded-2xl bg-[#011C60] px-6 py-3 font-['Roboto'] text-[16px] font-semibold text-white transition hover:bg-[#02267F]"
        >
          Back
        </button>
      </div>
    </section>
  );

  const renderForm = () => (
    <section className={PANEL_CLASS_NAME}>
      <div className="flex flex-col gap-8">
        <SectionHeading
          title="Create your first package"
          description="Define how you want to be booked. You can add more packages later."
        />

        <div className="rounded-[20px] border border-[#E6E8EF] bg-white p-5 shadow-[0px_12px_30px_rgba(17,27,71,0.04)]">
          <h3 className="font-['Roboto'] text-[20px] font-semibold leading-8 text-[#011C60]">
            Package Details
          </h3>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="relative">
              <FieldLabel>Service name</FieldLabel>
              <select
                value={draftPackage.serviceId}
                onChange={(event) =>
                  handleFieldChange("serviceId", event.target.value)
                }
                className={SELECT_CLASS_NAME}
              >
                <option value="">Choose service</option>
                {savedServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.serviceName}
                  </option>
                ))}
              </select>
              <SelectArrow />
            </label>

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

            <label className="relative">
              <FieldLabel>Pricing Type</FieldLabel>
              <select
                value={draftPackage.pricingType}
                onChange={(event) =>
                  handleFieldChange("pricingType", event.target.value)
                }
                className={SELECT_CLASS_NAME}
              >
                <option value="">Pricing type</option>
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
                type="number"
                min="1"
                step="1"
                value={draftPackage.times}
                onChange={(event) =>
                  handleFieldChange("times", event.target.value)
                }
                placeholder="Estimated duration"
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

          <div className="mt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <FieldLabel>Included Features</FieldLabel>
              <span className="font-['Roboto'] text-[14px] leading-5 text-[#6777A0]">
                From selected service items
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-3">
              {selectedService?.items?.map((item) => {
                const isSelected = draftPackage.selectedItemIds.includes(
                  item.id
                );

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleFeature(item.id)}
                    className={joinClasses(
                      "inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-2xl border px-4 font-['Roboto'] text-[14px] font-medium transition",
                      isSelected
                        ? "border-[#011C60] bg-[#011C60] text-white"
                        : "border-[#E6E8EF] bg-[#F3F4F7] text-[#6777A0] hover:border-[#011C60] hover:text-[#011C60]"
                    )}
                  >
                    {isSelected && <CheckIcon className="h-4 w-4" />}
                    {item.itemName}
                  </button>
                );
              })}

              {draftPackage.customFeatures.map((feature) => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => handleRemoveCustomFeature(feature)}
                  className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-2xl bg-[#EFF3FF] px-4 font-['Roboto'] text-[14px] font-medium text-[#011C60]"
                >
                  {feature}
                  <span aria-hidden="true">x</span>
                </button>
              ))}
            </div>

            {selectedService && selectedService.items.length === 0 && (
              <p className="mt-3 font-['Roboto'] text-[14px] leading-5 text-[#6777A0]">
                This service has no saved items yet. Add a temporary feature
                below for now.
              </p>
            )}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={draftPackage.customFeatureDraft}
                onChange={(event) =>
                  handleFieldChange("customFeatureDraft", event.target.value)
                }
                placeholder="Type new feature"
                className={INPUT_CLASS_NAME}
              />
              <button
                type="button"
                onClick={handleAddCustomFeature}
                className="min-h-12 shrink-0 cursor-pointer rounded-2xl border border-[#D7DDED] bg-[#EFF3FF] px-5 font-['Roboto'] text-[15px] font-semibold text-[#011C60] transition hover:border-[#011C60] hover:bg-white"
              >
                Add Feature
              </button>
            </div>
          </div>
        </div>

        <FlowActions
          secondaryLabel="Skip"
          onSecondary={onBack}
          primaryLabel="Review Package"
          onPrimary={() => setStep("review")}
          primaryDisabled={!canReview}
        />
      </div>
    </section>
  );

  const renderReview = () => (
    <section className={PANEL_CLASS_NAME}>
      <div className="flex flex-col gap-8">
        <SectionHeading
          title="Review Your Package"
          description="Check the package details before publishing."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <ReviewItem label="Service name" value={selectedService.serviceName} />
          <ReviewItem label="Package name" value={draftPackage.packageName} />
          <ReviewItem
            label="Pricing type"
            value={
              PRICING_TYPE_OPTIONS.find(
                (option) => option.value === draftPackage.pricingType
              )?.label
            }
          />
          <ReviewItem label="Times" value={`${draftPackage.times} times`} />
          <ReviewItem label="Price" value={`${draftPackage.price} EGP`} />
        </div>

        <div>
          <FieldLabel>Included Features</FieldLabel>
          <div className="flex flex-wrap gap-3">
            {selectedFeatureLabels.map((feature) => (
              <span
                key={feature}
                className="inline-flex min-h-10 items-center rounded-2xl bg-[#EFF3FF] px-4 font-['Roboto'] text-[14px] font-medium text-[#011C60]"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        <FlowActions
          secondaryLabel="Edit"
          onSecondary={() => setStep("form")}
          primaryLabel="Publish package"
          onPrimary={handleSave}
        />
      </div>
    </section>
  );

  const renderSuccess = () => (
    <section className={PANEL_CLASS_NAME}>
      <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
        <img
          src={FLOW_ASSETS.successAddServiceImage}
          alt="Package added successfully"
          className="h-auto w-full max-w-[190px] object-contain"
        />
        <h2 className="mt-6 font-['Roboto'] text-[30px] font-semibold leading-[44px] text-[#011C60]">
          Your Package is Live !
        </h2>
        <p className="mt-3 max-w-lg font-['Roboto'] text-[16px] leading-6 text-[#6777A0]">
          Customers can now view and book your package through your professional
          profile.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onBack}
            className="min-h-12 min-w-[160px] cursor-pointer rounded-2xl border border-[#011C60] bg-white px-6 font-['Roboto'] text-[16px] font-semibold text-[#011C60] transition hover:bg-[#F5F7FC]"
          >
            Go to Dashboard
          </button>
          <button
            type="button"
            onClick={resetForAnotherPackage}
            className="min-h-12 min-w-[190px] cursor-pointer rounded-2xl bg-[#011C60] px-6 font-['Roboto'] text-[16px] font-semibold text-white transition hover:bg-[#02267F]"
          >
            Add Another Package
          </button>
        </div>
      </div>
    </section>
  );

  if (savedServices.length === 0) {
    return renderNoServicesState();
  }

  if (step === "review") return renderReview();
  if (step === "success") return renderSuccess();

  return <div className="flex flex-col gap-6">{renderForm()}</div>;
}

function ReviewItem({ label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-[20px] border border-[#E6E8EF] bg-white p-4">
      <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFF3FF]">
        <PackageIcon className="h-4 w-4" />
      </span>
      <div>
        <p className="font-['Roboto'] text-[13px] font-medium leading-5 text-[#6777A0]">
          {label}
        </p>
        <p className="mt-1 font-['Roboto'] text-[16px] font-semibold leading-6 text-[#011C60]">
          {value}
        </p>
      </div>
    </div>
  );
}
