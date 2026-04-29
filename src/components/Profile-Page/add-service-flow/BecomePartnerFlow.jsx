import { useState } from "react";

import Toast from "../../common/Toast";
import AvailabilityStep from "./AvailabilityStep";
import MyServicesStep from "./MyServicesStep";
import PackagesStep from "./PackagesStep";
import ServiceDetailsStep from "./ServiceDetailsStep";
import ServiceItemsStep from "./ServiceItemsStep";
import {
  FLOW_ASSETS,
  PARTNER_TABS,
  createEmptyAvailabilityData,
  createEmptyPackageData,
  createEmptyServiceDetails,
  getCategoryLabel,
  getGovernorateLabel,
  isPackageComplete,
  isPackageEmpty,
} from "./partnerFlowData";
import {
  BriefcaseIcon,
  PANEL_CLASS_NAME,
  joinClasses,
} from "./PartnerFlowShared";

const isServiceDetailsComplete = (details) =>
  [
    details.serviceName,
    details.category,
    details.governorate,
    details.coverageArea,
    details.description,
    details.longDescription,
    details.price,
  ].every((value) => String(value || "").trim());

const createEmptyDraft = () => ({
  selectedPartnerType: "",
  serviceDetails: createEmptyServiceDetails(),
  serviceItems: [],
  packageData: createEmptyPackageData(),
  availability: createEmptyAvailabilityData(),
});

export default function BecomePartnerFlow() {
  const [activeTab, setActiveTab] = useState("services");
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPartnerType, setSelectedPartnerType] = useState("");
  const [serviceDetails, setServiceDetails] = useState(createEmptyServiceDetails);
  const [serviceItems, setServiceItems] = useState([]);
  const [packageData, setPackageData] = useState(createEmptyPackageData);
  const [availability, setAvailability] = useState(createEmptyAvailabilityData);
  const [uploadError, setUploadError] = useState("");
  const [packageError, setPackageError] = useState("");
  const [savedServices, setSavedServices] = useState([]);
  const [toast, setToast] = useState(null);

  const resetDraft = () => {
    const emptyDraft = createEmptyDraft();

    setCurrentStep(1);
    setSelectedPartnerType(emptyDraft.selectedPartnerType);
    setServiceDetails(emptyDraft.serviceDetails);
    setServiceItems(emptyDraft.serviceItems);
    setPackageData(emptyDraft.packageData);
    setAvailability(emptyDraft.availability);
    setUploadError("");
    setPackageError("");
  };

  const openServiceFlow = () => {
    resetDraft();
    setActiveTab("services");
    setIsCreating(true);
  };

  const cancelServiceFlow = () => {
    resetDraft();
    setIsCreating(false);
    setActiveTab("services");
  };

  const handleTopTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsCreating(false);
  };

  const handleMyServicesNext = () => {
    if (!selectedPartnerType) return;

    if (selectedPartnerType !== "services") {
      setActiveTab(selectedPartnerType);
      setIsCreating(false);
      return;
    }

    setCurrentStep(2);
  };

  const handleDetailsChange = (fieldName, value) => {
    setServiceDetails((currentDetails) => {
      if (fieldName === "governorate") {
        return {
          ...currentDetails,
          governorate: value,
          coverageArea: "",
        };
      }

      return {
        ...currentDetails,
        [fieldName]: value,
      };
    });
  };

  const handlePhotoChange = (fileList) => {
    const files = Array.from(fileList || []);

    if (files.length > 5) {
      setUploadError("You can upload up to 5 photos only.");
      setServiceDetails((currentDetails) => ({
        ...currentDetails,
        photos: files.slice(0, 5),
      }));
      return;
    }

    setUploadError("");
    setServiceDetails((currentDetails) => ({
      ...currentDetails,
      photos: files,
    }));
  };

  const handleAddItem = (nextItem) => {
    setServiceItems((currentItems) => [...currentItems, nextItem]);
  };

  const handlePackageFieldChange = (fieldName, value) => {
    setPackageError("");
    setPackageData((currentPackage) => ({
      ...currentPackage,
      [fieldName]: value,
    }));
  };

  const handleToggleFeature = (itemId) => {
    setPackageData((currentPackage) => {
      const hasFeature = currentPackage.includedItemIds.includes(itemId);

      return {
        ...currentPackage,
        includedItemIds: hasFeature
          ? currentPackage.includedItemIds.filter((id) => id !== itemId)
          : [...currentPackage.includedItemIds, itemId],
      };
    });
  };

  const handlePackageNext = () => {
    if (isPackageEmpty(packageData) || isPackageComplete(packageData)) {
      setPackageError("");
      setCurrentStep(5);
      return;
    }

    setPackageError(
      "Complete every package field or leave the package empty to skip it."
    );
  };

  const handleAvailabilityFieldChange = (fieldName, value) => {
    setAvailability((currentAvailability) => ({
      ...currentAvailability,
      [fieldName]: value,
    }));
  };

  const handleToggleDay = (day) => {
    setAvailability((currentAvailability) => {
      const isSelected = currentAvailability.days.includes(day);

      return {
        ...currentAvailability,
        days: isSelected
          ? currentAvailability.days.filter((currentDay) => currentDay !== day)
          : [...currentAvailability.days, day],
      };
    });
  };

  const handleSaveService = () => {
    setSavedServices((currentServices) => [
      {
        id: `partner-service-${Date.now()}`,
        serviceName: serviceDetails.serviceName.trim(),
        categoryLabel: getCategoryLabel(serviceDetails.category),
        location: `${serviceDetails.coverageArea}, ${getGovernorateLabel(
          serviceDetails.governorate
        )}`,
        description: serviceDetails.description.trim(),
        longDescription: serviceDetails.longDescription.trim(),
        price: serviceDetails.price,
        items: serviceItems,
        packageData: isPackageEmpty(packageData) ? null : packageData,
        availability,
      },
      ...currentServices,
    ]);

    setToast({
      id: Date.now(),
      type: "success",
      message: "Your service has been saved successfully.",
    });

    setIsCreating(false);
    setActiveTab("services");
    resetDraft();
  };

  const serviceCount = savedServices.length;
  const tabCounts = {
    services: serviceCount,
    store: 0,
    marketplace: 0,
  };

  const renderPartnerTabs = () => (
    <div className="grid gap-3 sm:grid-cols-3">
      {PARTNER_TABS.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTopTabChange(tab.id)}
            className={joinClasses(
              "flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-left transition",
              isActive
                ? "border-[#011C60] bg-white shadow-[0px_12px_26px_rgba(17,27,71,0.08)]"
                : "border-[#E6E8EF] bg-[#F8F9FC] hover:border-[#011C60] hover:bg-white"
            )}
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF3FF]">
                <img src={tab.image} alt="" className="h-6 w-6 object-contain" />
              </span>
              <span className="font-['Roboto'] text-[18px] font-medium leading-7 text-[#011C60]">
                {tab.label}
              </span>
            </span>

            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#EFF3FF] px-2 font-['Roboto'] text-[13px] font-semibold text-[#011C60]">
              {tabCounts[tab.id]}
            </span>
          </button>
        );
      })}
    </div>
  );

  const renderEmptyServiceState = () => (
    <section className={PANEL_CLASS_NAME}>
      <div className="mx-auto flex max-w-[700px] flex-col items-center text-center">
        <img
          src={FLOW_ASSETS.emptyServiceImage}
          alt="Empty services illustration"
          className="h-auto w-full max-w-[619px] object-contain"
        />

        <h3 className="mt-6 font-['Roboto'] text-center text-[30px] font-medium leading-[46px] text-[#011C60] sm:text-[36px] sm:leading-[56px]">
          You don&apos;t have any service yet
        </h3>

        <p className="mt-3 max-w-[540px] font-['Roboto'] text-center text-[16px] leading-6 text-[#6777A0]">
          A single friendly character standing in an empty space, looking
          around or slightly confused, holding nothing or an empty card.
        </p>

        <button
          type="button"
          onClick={openServiceFlow}
          className="mt-8 min-h-12 w-full cursor-pointer rounded-2xl bg-[#011C60] px-6 py-3 font-['Roboto'] text-[16px] font-semibold leading-6 text-white transition hover:bg-[#02267F]"
        >
          Add New Service
        </button>
      </div>
    </section>
  );

  const renderSavedServices = () => (
    <section className={PANEL_CLASS_NAME}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-['Roboto'] text-[28px] font-semibold leading-[40px] text-[#011C60]">
              My Services
            </h3>
            <p className="mt-2 font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
              Manage the services your clients can book through the platform.
            </p>
          </div>

          <button
            type="button"
            onClick={openServiceFlow}
            className="min-h-12 min-w-[190px] cursor-pointer rounded-2xl bg-[#011C60] px-6 py-3 font-['Roboto'] text-[16px] font-semibold leading-6 text-white transition hover:bg-[#02267F]"
          >
            Add New Service
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {savedServices.map((service) => (
            <article
              key={service.id}
              className="rounded-[20px] border border-[#E6E8EF] bg-white p-5 shadow-[0px_12px_30px_rgba(17,27,71,0.05)]"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EFF3FF]">
                  <BriefcaseIcon className="h-6 w-6" />
                </span>

                <div className="min-w-0">
                  <h4 className="font-['Roboto'] text-[22px] font-semibold leading-8 text-[#011C60]">
                    {service.serviceName}
                  </h4>
                  <p className="mt-1 font-['Roboto'] text-[14px] font-medium leading-5 text-[#6777A0]">
                    {service.categoryLabel}
                  </p>
                </div>
              </div>

              <p className="mt-5 font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
                {service.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#EFF3FF] px-3 py-1.5 font-['Roboto'] text-[13px] font-medium text-[#011C60]">
                  {service.location}
                </span>
                <span className="rounded-full bg-[#EFF3FF] px-3 py-1.5 font-['Roboto'] text-[13px] font-medium text-[#011C60]">
                  {service.items.length} items
                </span>
                <span className="rounded-full bg-[#EFF3FF] px-3 py-1.5 font-['Roboto'] text-[13px] font-medium text-[#011C60]">
                  EGP {service.price}
                </span>
                <span className="rounded-full bg-[#EFF3FF] px-3 py-1.5 font-['Roboto'] text-[13px] font-medium text-[#011C60]">
                  {service.availability.days.length} days available
                </span>
              </div>

              {service.packageData?.packageName && (
                <p className="mt-5 font-['Roboto'] text-[14px] leading-5 text-[#6777A0]">
                  Package: {service.packageData.packageName}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );

  const renderBlankState = (tabLabel) => (
    <section className={PANEL_CLASS_NAME}>
      <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF3FF]">
          <BriefcaseIcon className="h-7 w-7" />
        </span>
        <h3 className="mt-6 font-['Roboto'] text-[30px] font-medium leading-[42px] text-[#011C60]">
          {tabLabel} flow is not ready yet
        </h3>
        <p className="mt-3 max-w-xl font-['Roboto'] text-[16px] leading-6 text-[#6777A0]">
          This page is intentionally left blank until the {tabLabel.toLowerCase()} onboarding
          flow is implemented.
        </p>
      </div>
    </section>
  );

  return (
    <div className="flex flex-col gap-6">
      <Toast
        key={toast?.id}
        type={toast?.type}
        message={toast?.message}
        onClose={() => setToast(null)}
      />

      <div>
        <p className="font-['Roboto'] text-[28px] font-medium leading-[40px] text-[#9AA6C7] sm:text-[32px] sm:leading-[48px]">
          Add service
        </p>
      </div>

      {isCreating ? (
        <>
          {currentStep === 1 && (
            <MyServicesStep
              selectedOption={selectedPartnerType}
              onSelect={setSelectedPartnerType}
              onCancel={cancelServiceFlow}
              onNext={handleMyServicesNext}
            />
          )}

          {currentStep === 2 && (
            <ServiceDetailsStep
              details={serviceDetails}
              onChange={handleDetailsChange}
              onBack={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
              onPhotoChange={handlePhotoChange}
              canContinue={isServiceDetailsComplete(serviceDetails)}
              uploadError={uploadError}
            />
          )}

          {currentStep === 3 && (
            <ServiceItemsStep
              items={serviceItems}
              onAddItem={handleAddItem}
              onBack={() => setCurrentStep(2)}
              onNext={() => setCurrentStep(4)}
            />
          )}

          {currentStep === 4 && (
            <PackagesStep
              packageData={packageData}
              items={serviceItems}
              onFieldChange={handlePackageFieldChange}
              onToggleFeature={handleToggleFeature}
              onBack={() => setCurrentStep(3)}
              onNext={handlePackageNext}
              error={packageError}
            />
          )}

          {currentStep === 5 && (
            <AvailabilityStep
              availability={availability}
              onToggleDay={handleToggleDay}
              onFieldChange={handleAvailabilityFieldChange}
              onBack={() => setCurrentStep(4)}
              onSave={handleSaveService}
            />
          )}
        </>
      ) : (
        <>
          {renderPartnerTabs()}

          {activeTab === "services" &&
            (savedServices.length > 0
              ? renderSavedServices()
              : renderEmptyServiceState())}

          {activeTab === "store" && renderBlankState("Store")}
          {activeTab === "marketplace" && renderBlankState("Marketplace")}
        </>
      )}
    </div>
  );
}
