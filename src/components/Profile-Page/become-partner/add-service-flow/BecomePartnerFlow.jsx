import { useEffect, useState } from "react";

import Toast from "../../../common/Toast";
import AddPackageFlow from "../add-package-flow/AddPackageFlow";
import AvailabilityStep from "./AvailabilityStep";
import MyServicesStep from "./MyServicesStep";
import ServiceDetailsStep from "./ServiceDetailsStep";
import ServiceItemsStep from "./ServiceItemsStep";
import {
  FLOW_ASSETS,
  PARTNER_TABS,
  createEmptyAvailabilityData,
  createEmptyServiceDetails,
  getCategoryLabel,
  getGovernorateLabel,
} from "./partnerFlowData";
import {
  BriefcaseIcon,
  PackageIcon,
  PANEL_CLASS_NAME,
  joinClasses,
} from "./PartnerFlowShared";

const STORAGE_KEY = "alaa-partner-services";

const readStoredServices = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const writeStoredServices = (services) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
};

const isServiceDetailsComplete = (details) =>
  [
    details.serviceName,
    details.category,
    details.governorate,
    details.coverageArea,
    details.description,
    details.longDescription,
    details.price,
    details.serviceTimeHours,
  ].every((value) => String(value || "").trim());

const createEmptyDraft = () => ({
  selectedPartnerType: "",
  serviceDetails: createEmptyServiceDetails(),
  serviceItems: [],
  availability: createEmptyAvailabilityData(),
});

export default function BecomePartnerFlow() {
  const [view, setView] = useState("entry");
  const [activeTab, setActiveTab] = useState("services");
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPartnerType, setSelectedPartnerType] = useState("");
  const [serviceDetails, setServiceDetails] = useState(createEmptyServiceDetails);
  const [serviceItems, setServiceItems] = useState([]);
  const [availability, setAvailability] = useState(createEmptyAvailabilityData);
  const [uploadError, setUploadError] = useState("");
  const [savedServices, setSavedServices] = useState(readStoredServices);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    writeStoredServices(savedServices);
  }, [savedServices]);

  const resetDraft = () => {
    const emptyDraft = createEmptyDraft();

    setCurrentStep(1);
    setSelectedPartnerType(emptyDraft.selectedPartnerType);
    setServiceDetails(emptyDraft.serviceDetails);
    setServiceItems(emptyDraft.serviceItems);
    setAvailability(emptyDraft.availability);
    setUploadError("");
  };

  const openServiceList = () => {
    resetDraft();
    setActiveTab("services");
    setView("services");
  };

  const openServiceFlow = () => {
    resetDraft();
    setActiveTab("services");
    setView("wizard");
  };

  const cancelServiceFlow = () => {
    resetDraft();
    setView("services");
    setActiveTab("services");
  };

  const handleTopTabChange = (tabId) => {
    setActiveTab(tabId);
    setView("services");
  };

  const handleMyServicesNext = () => {
    if (!selectedPartnerType) return;

    if (selectedPartnerType !== "services") {
      setActiveTab(selectedPartnerType);
      setView("services");
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
    const nextService = {
      id: `partner-service-${Date.now()}`,
      serviceName: serviceDetails.serviceName.trim(),
      category: serviceDetails.category,
      categoryLabel: getCategoryLabel(serviceDetails.category),
      location: `${serviceDetails.coverageArea}, ${getGovernorateLabel(
        serviceDetails.governorate
      )}`,
      governorate: serviceDetails.governorate,
      coverageArea: serviceDetails.coverageArea,
      description: serviceDetails.description.trim(),
      longDescription: serviceDetails.longDescription.trim(),
      price: serviceDetails.price,
      serviceTimeHours: serviceDetails.serviceTimeHours,
      photoNames: serviceDetails.photos.map((photo) => photo.name),
      items: serviceItems,
      availability,
    };

    setSavedServices((currentServices) => [nextService, ...currentServices]);
    setToast({
      id: Date.now(),
      type: "success",
      message: "Your service has been saved successfully.",
    });

    resetDraft();
    setView("services");
    setActiveTab("services");
  };

  const tabCounts = {
    services: savedServices.length,
    store: 0,
    marketplace: 0,
  };

  const renderEntryChoice = () => (
    <section className="rounded-[24px] bg-white p-5 sm:p-8">
      <div className="mx-auto max-w-[900px]">
        <h1 className="font-['Roboto'] text-[30px] font-bold leading-[42px] text-[#011C60] sm:text-[36px] sm:leading-[52px]">
          Start Your Journey as a Partner
        </h1>
        <p className="mt-3 max-w-2xl font-['Roboto'] text-[16px] leading-6 text-[#6777A0]">
          Choose how you want to offer your services on our platform. We provide
          the tools you need to excel in your profession.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <button
            type="button"
            onClick={openServiceList}
            className="group cursor-pointer rounded-[20px] border border-[#E6E8EF] bg-white p-5 text-left shadow-[0px_16px_36px_rgba(17,27,71,0.12)] transition hover:-translate-y-1 hover:border-[#011C60]"
          >
            <div className="flex h-[170px] items-center justify-center rounded-2xl bg-[#EFF3FF]">
              <img
                src={PARTNER_TABS[0].image}
                alt=""
                className="h-24 w-24 object-contain"
              />
            </div>
            <h2 className="mt-5 font-['Roboto'] text-[24px] font-semibold leading-9 text-[#011C60]">
              Offer a Service
            </h2>
            <p className="mt-2 font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
              Provide services directly and interact with clients for tailored
              care.
            </p>
            <span className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#011C60] px-5 font-['Roboto'] text-[16px] font-semibold text-white transition group-hover:bg-[#02267F]">
              Start as Service Provider
            </span>
          </button>

          <button
            type="button"
            onClick={() => setView("packages")}
            className="group cursor-pointer rounded-[20px] border border-[#E6E8EF] bg-white p-5 text-left shadow-[0px_16px_36px_rgba(17,27,71,0.12)] transition hover:-translate-y-1 hover:border-[#011C60]"
          >
            <div className="flex h-[170px] items-center justify-center rounded-2xl bg-[#EFF3FF]">
              <PackageIcon className="h-24 w-24" />
            </div>
            <h2 className="mt-5 font-['Roboto'] text-[24px] font-semibold leading-9 text-[#011C60]">
              Create a Package
            </h2>
            <p className="mt-2 font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
              Create predefined service packages with fixed pricing and included
              features.
            </p>
            <span className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#011C60] px-5 font-['Roboto'] text-[16px] font-semibold text-white transition group-hover:bg-[#02267F]">
              Start Creating Package
            </span>
          </button>
        </div>
      </div>
    </section>
  );

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
          Add your first service with dummy data now, then connect it to the API
          later.
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
                  {service.serviceTimeHours} hours
                </span>
                <span className="rounded-full bg-[#EFF3FF] px-3 py-1.5 font-['Roboto'] text-[13px] font-medium text-[#011C60]">
                  {service.availability.days.length} days available
                </span>
              </div>
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
          {tabLabel} setup is ready for API integration
        </h3>
        <p className="mt-3 max-w-xl font-['Roboto'] text-[16px] leading-6 text-[#6777A0]">
          Dummy counters are wired now. The next step is connecting real data.
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

      {view === "entry" && renderEntryChoice()}

      {view === "packages" && (
        <AddPackageFlow onBack={() => setView("entry")} onToast={setToast} />
      )}

      {view === "wizard" && (
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
            <AvailabilityStep
              availability={availability}
              onToggleDay={handleToggleDay}
              onFieldChange={handleAvailabilityFieldChange}
              onBack={() => setCurrentStep(3)}
              onSave={handleSaveService}
            />
          )}
        </>
      )}

      {view === "services" && (
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
