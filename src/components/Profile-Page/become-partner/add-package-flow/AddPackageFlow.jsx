import { useEffect, useState } from "react";

import {
  FieldLabel,
  FlowActions,
  INPUT_CLASS_NAME,
  PackageIcon,
  PANEL_CLASS_NAME,
  SectionHeading,
  TEXTAREA_CLASS_NAME,
} from "../add-service-flow/PartnerFlowShared";

const STORAGE_KEY = "alaa-partner-packages";

const createEmptyPackage = () => ({
  packageName: "",
  serviceName: "",
  description: "",
  includedItems: "",
  price: "",
  durationHours: "",
});

const readStoredPackages = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const writeStoredPackages = (packages) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(packages));
};

const isPackageComplete = (draft) =>
  [
    draft.packageName,
    draft.serviceName,
    draft.description,
    draft.includedItems,
    draft.price,
    draft.durationHours,
  ].every((value) => String(value || "").trim());

export default function AddPackageFlow({ onBack, onToast }) {
  const [draftPackage, setDraftPackage] = useState(createEmptyPackage);
  const [savedPackages, setSavedPackages] = useState(readStoredPackages);

  useEffect(() => {
    writeStoredPackages(savedPackages);
  }, [savedPackages]);

  const handleFieldChange = (fieldName, value) => {
    setDraftPackage((currentPackage) => ({
      ...currentPackage,
      [fieldName]: value,
    }));
  };

  const handleSave = () => {
    if (!isPackageComplete(draftPackage)) return;

    const nextPackage = {
      id: `partner-package-${Date.now()}`,
      ...draftPackage,
      includedItems: draftPackage.includedItems
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    setSavedPackages((currentPackages) => [nextPackage, ...currentPackages]);
    setDraftPackage(createEmptyPackage());
    onToast({
      id: Date.now(),
      type: "success",
      message: "Your package has been saved successfully.",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <section className={PANEL_CLASS_NAME}>
        <div className="flex flex-col gap-8">
          <SectionHeading
            title="Create a Package"
            description="Add a simple dummy package now. This structure is ready to replace with API data later."
          />

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <FieldLabel>Package Name</FieldLabel>
              <input
                type="text"
                value={draftPackage.packageName}
                onChange={(event) =>
                  handleFieldChange("packageName", event.target.value)
                }
                placeholder="Package name"
                className={INPUT_CLASS_NAME}
              />
            </label>

            <label>
              <FieldLabel>Service Name</FieldLabel>
              <input
                type="text"
                value={draftPackage.serviceName}
                onChange={(event) =>
                  handleFieldChange("serviceName", event.target.value)
                }
                placeholder="Related service"
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
                placeholder="Price"
                className={INPUT_CLASS_NAME}
              />
            </label>

            <label>
              <FieldLabel>Duration</FieldLabel>
              <input
                type="number"
                min="1"
                step="1"
                value={draftPackage.durationHours}
                onChange={(event) =>
                  handleFieldChange("durationHours", event.target.value)
                }
                placeholder="Number of hours"
                className={INPUT_CLASS_NAME}
              />
            </label>
          </div>

          <label>
            <FieldLabel>Included Items</FieldLabel>
            <input
              type="text"
              value={draftPackage.includedItems}
              onChange={(event) =>
                handleFieldChange("includedItems", event.target.value)
              }
              placeholder="Deep clean, windows, finishing touch"
              className={INPUT_CLASS_NAME}
            />
          </label>

          <label>
            <FieldLabel>Description</FieldLabel>
            <textarea
              rows="5"
              value={draftPackage.description}
              onChange={(event) =>
                handleFieldChange("description", event.target.value)
              }
              placeholder="Describe the package in clear, helpful details"
              className={TEXTAREA_CLASS_NAME}
            />
          </label>

          <FlowActions
            secondaryLabel="Back"
            onSecondary={onBack}
            primaryLabel="Save Package"
            onPrimary={handleSave}
            primaryDisabled={!isPackageComplete(draftPackage)}
          />
        </div>
      </section>

      {savedPackages.length > 0 && (
        <section className={PANEL_CLASS_NAME}>
          <div className="grid gap-4 md:grid-cols-2">
            {savedPackages.map((savedPackage) => (
              <article
                key={savedPackage.id}
                className="rounded-[20px] border border-[#E6E8EF] bg-white p-5 shadow-[0px_12px_30px_rgba(17,27,71,0.05)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF3FF]">
                  <PackageIcon />
                </span>
                <h3 className="mt-5 font-['Roboto'] text-[22px] font-semibold leading-8 text-[#011C60]">
                  {savedPackage.packageName}
                </h3>
                <p className="mt-2 font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
                  {savedPackage.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#EFF3FF] px-3 py-1.5 font-['Roboto'] text-[13px] font-medium text-[#011C60]">
                    {savedPackage.serviceName}
                  </span>
                  <span className="rounded-full bg-[#EFF3FF] px-3 py-1.5 font-['Roboto'] text-[13px] font-medium text-[#011C60]">
                    EGP {savedPackage.price}
                  </span>
                  <span className="rounded-full bg-[#EFF3FF] px-3 py-1.5 font-['Roboto'] text-[13px] font-medium text-[#011C60]">
                    {savedPackage.durationHours} hours
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
