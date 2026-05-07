import { useState } from "react";

import {
  FieldLabel,
  INPUT_CLASS_NAME,
  ModalShell,
  TEXTAREA_CLASS_NAME,
} from "../add-service-flow/PartnerFlowShared";

export default function PackageEditModal({ packageItem, onClose, onSave }) {
  const [draft, setDraft] = useState({
    ...packageItem,
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

  const handleSave = () => {
    const nextPackage = {
      ...draft,
      packageName: draft.packageName.trim(),
      serviceName: draft.serviceName.trim(),
      description: draft.description.trim(),
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

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <FieldLabel>Package Name</FieldLabel>
              <input
                type="text"
                value={draft.packageName}
                onChange={(event) => handleFieldChange("packageName", event.target.value)}
                className={INPUT_CLASS_NAME}
              />
            </label>

            <label>
              <FieldLabel>Service Name</FieldLabel>
              <input
                type="text"
                value={draft.serviceName}
                onChange={(event) => handleFieldChange("serviceName", event.target.value)}
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

            <label>
              <FieldLabel>Duration</FieldLabel>
              <input
                type="number"
                min="1"
                step="1"
                value={draft.durationHours}
                onChange={(event) => handleFieldChange("durationHours", event.target.value)}
                className={INPUT_CLASS_NAME}
              />
            </label>
          </div>

          <label>
            <FieldLabel>Included Items</FieldLabel>
            <input
              type="text"
              value={draft.includedItemsText}
              onChange={(event) => handleFieldChange("includedItemsText", event.target.value)}
              className={INPUT_CLASS_NAME}
            />
          </label>

          <label>
            <FieldLabel>Description</FieldLabel>
            <textarea
              rows="5"
              value={draft.description}
              onChange={(event) => handleFieldChange("description", event.target.value)}
              className={TEXTAREA_CLASS_NAME}
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
