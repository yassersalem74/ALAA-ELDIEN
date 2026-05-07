import { addService, createOrUpdateItems, createOrUpdateAgendas } from "../../api/services/service.api.js";
import { useState } from "react";

import Toast from "../../common/Toast";
import AvailabilityStep from "./AvailabilityStep";
import ServiceDashboard from "./ServiceDashboard";
import MyServicesStep from "./MyServicesStep";
import PackagesStep from "./PackagesStep";
import ServiceDetailsStep from "./ServiceDetailsStep";
import ServiceItemsStep from "./ServiceItemsStep";
import {
  FLOW_ASSETS,
  createEmptyAvailabilityData,
  createEmptyPackageData,
  createEmptyServiceDetails,
  isPackageComplete,
  isPackageEmpty,
} from "./partnerFlowData";
import {
  PANEL_CLASS_NAME,
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
  };

  const handleMyServicesNext = () => {
    if (!selectedPartnerType) return;

    if (selectedPartnerType !== "services") {
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

  const handleSaveService = async () => {
    try {
      // First, add the service
      const serviceData = {
        name: serviceDetails.serviceName.trim(),
        price: serviceDetails.price,
        currency: "EGY", // Assuming default
        categoryName: serviceDetails.category, // This should match the API
        timeslotDurationInMin: serviceDetails.timeslotDuration || 60,
        numberOfCustomerPerTimeSlots: serviceDetails.numberOfCustomerPerTimeSlots || 1,
      };

      const response = await addService(serviceData);
      const serviceId = response.data.id; // Assuming the response has the service id

      // Then, add items if any
      if (serviceItems.length > 0) {
        await createOrUpdateItems(serviceId, { items: serviceItems });
      }

      // Then, add agendas if any
      if (availability.days.length > 0) {
        const agendas = availability.days.map(day => ({
          day: day.charAt(0).toUpperCase() + day.slice(1), // Capitalize first letter
          from: availability.fromTime,
          to: availability.toTime,
        }));
        await createOrUpdateAgendas(serviceId, { agendas });
      }

      setToast({
        id: Date.now(),
        type: "success",
        message: "Your service has been saved successfully.",
      });

      setIsCreating(false);
      resetDraft();
    } catch (error) {
      setToast({
        id: Date.now(),
        type: "error",
        message: "Failed to save service. Please try again.",
      });
      console.error(error);
    }
  };

  const serviceCount = savedServices.length;

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
        <ServiceDashboard onAddNewService={openServiceFlow} />
      )}
    </div>
  );
}
