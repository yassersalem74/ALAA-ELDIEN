import { useState } from "react";

import { FLOW_ASSETS } from "./partnerFlowData";
import {
  BriefcaseIcon,
  FieldLabel,
  FlowActions,
  INPUT_CLASS_NAME,
  ModalShell,
  PANEL_CLASS_NAME,
  PlusIcon,
  ProgressStepper,
  SectionHeading,
  TEXTAREA_CLASS_NAME,
} from "./PartnerFlowShared";

const createEmptyItem = () => ({
  itemName: "",
  price: "",
  description: "",
});

export default function ServiceItemsStep({
  items,
  onAddItem,
  onBack,
  onNext,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [draftItem, setDraftItem] = useState(createEmptyItem());
  const [formError, setFormError] = useState("");

  const handleFieldChange = (fieldName, value) => {
    setDraftItem((currentItem) => ({
      ...currentItem,
      [fieldName]: value,
    }));
  };

  const resetModalState = () => {
    setDraftItem(createEmptyItem());
    setFormError("");
  };

  const handleOpenModal = () => {
    resetModalState();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetModalState();
  };

  const handleSaveItem = () => {
    if (
      !draftItem.itemName.trim() ||
      !draftItem.price.trim() ||
      !draftItem.description.trim()
    ) {
      setFormError("Please complete item name, price, and description.");
      return;
    }

    onAddItem({
      id: `service-item-${Date.now()}`,
      itemName: draftItem.itemName.trim(),
      price: draftItem.price.trim(),
      description: draftItem.description.trim(),
    });

    setIsModalOpen(false);
    resetModalState();
    setIsSuccessOpen(true);
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <ProgressStepper currentStep={3} />

        <section className={PANEL_CLASS_NAME}>
          <div className="flex flex-col gap-8">
            <SectionHeading
              title="Service Items"
              description="Define your offerings for Alaa Eldeen. Clients will see these prices when booking."
            />

            <div className="grid gap-4 md:grid-cols-2">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[20px] border border-[#E6E8EF] bg-white p-5 shadow-[0px_12px_24px_rgba(17,27,71,0.05)]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF3FF]">
                    <BriefcaseIcon />
                  </span>

                  <h3 className="mt-5 font-['Roboto'] text-[24px] font-medium leading-9 text-[#011C60]">
                    {item.itemName}
                  </h3>

                  <p className="mt-3 font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
                    {item.description}
                  </p>

                  <p className="mt-5 font-['Roboto'] text-[30px] font-semibold leading-10 text-[#011C60]">
                    EGP {item.price}
                  </p>
                </article>
              ))}

              <button
                type="button"
                onClick={handleOpenModal}
                className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed border-[#CCD2DF] bg-white p-5 text-center transition hover:border-[#011C60] hover:bg-[#FAFBFF]"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF3FF]">
                  <PlusIcon />
                </span>
                <span className="mt-4 font-['Roboto'] text-[18px] font-medium leading-7 text-[#6777A0]">
                  Add new item
                </span>
              </button>
            </div>

            {items.length === 0 && (
              <p className="font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
                Start with at least one service item if you want to build
                packages from selectable features later.
              </p>
            )}

            <FlowActions
              secondaryLabel="Back"
              onSecondary={onBack}
              primaryLabel="Next"
              onPrimary={onNext}
            />
          </div>
        </section>
      </div>

      {isModalOpen && (
        <ModalShell onClose={handleCloseModal}>
          <div className="flex flex-col gap-7">
            <div className="text-center">
              <h3 className="font-['Roboto'] text-[28px] font-semibold leading-[40px] text-[#011C60]">
                Add service item
              </h3>
            </div>

            <div className="flex flex-col gap-5">
              <label>
                <FieldLabel>Item name</FieldLabel>
                <input
                  type="text"
                  value={draftItem.itemName}
                  onChange={(event) =>
                    handleFieldChange("itemName", event.target.value)
                  }
                  placeholder="Item name"
                  className={INPUT_CLASS_NAME}
                />
              </label>

              <label>
                <FieldLabel>Price</FieldLabel>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draftItem.price}
                  onChange={(event) =>
                    handleFieldChange("price", event.target.value)
                  }
                  placeholder="price"
                  className={INPUT_CLASS_NAME}
                />
              </label>

              <label>
                <FieldLabel>Description</FieldLabel>
                <textarea
                  rows="5"
                  value={draftItem.description}
                  onChange={(event) =>
                    handleFieldChange("description", event.target.value)
                  }
                  placeholder="Item description"
                  className={TEXTAREA_CLASS_NAME}
                />
              </label>
            </div>

            {formError && (
              <p className="font-['Roboto'] text-[14px] leading-5 text-[#DC2626]">
                {formError}
              </p>
            )}

            <button
              type="button"
              onClick={handleSaveItem}
              className="min-h-12 w-full cursor-pointer rounded-2xl bg-[#011C60] px-6 py-3 font-['Roboto'] text-[16px] font-semibold text-white transition hover:bg-[#02267F]"
            >
              Save
            </button>
          </div>
        </ModalShell>
      )}

      {isSuccessOpen && (
        <ModalShell onClose={() => setIsSuccessOpen(false)} widthClassName="max-w-md">
          <div className="flex flex-col items-center justify-center gap-5 py-3 text-center">
            <img
              src={FLOW_ASSETS.successAddServiceImage}
              alt="Service item added successfully"
              className="h-auto w-full max-w-[180px] object-contain"
            />
            <h3 className="font-['Roboto'] text-[28px] font-semibold leading-[40px] text-[#011C60]">
              Item has been confirmed successfully
            </h3>
            <button
              type="button"
              onClick={() => setIsSuccessOpen(false)}
              className="min-h-12 min-w-[160px] cursor-pointer rounded-2xl bg-[#011C60] px-6 py-3 font-['Roboto'] text-[16px] font-semibold text-white transition hover:bg-[#02267F]"
            >
              Done
            </button>
          </div>
        </ModalShell>
      )}
    </>
  );
}
