import { useEffect, useMemo, useState } from "react";

import Toast from "../../../common/Toast";
import { getApiList, getErrorMessage, getItemId, getItemName } from "../../../../api/api.utils";
import { getGovernorates, getNeighborhoods } from "../../../../api/auth/auth.api";
import {
  HOUR_OPTIONS,
  PARTNER_FLOW_ASSETS,
  SERVICE_CATEGORY_OPTIONS,
  SERVICE_CHANNEL_OPTIONS,
  SERVICE_STEPS,
  WEEKDAY_OPTIONS,
  calculateTotalHours,
  createAvailabilityFromAgendas,
  createEmptyAvailabilityData,
  createEmptyServiceDraft,
  formatHourLabel,
  formatMoney,
} from "../shared/partnerFlowData";
import {
  BriefcaseIcon,
  CheckIcon,
  ClockIcon,
  DashboardStatCard,
  EditIcon,
  FieldLabel,
  FlowActions,
  INPUT_CLASS_NAME,
  ModalShell,
  PANEL_CLASS_NAME,
  PlusIcon,
  ProgressStepper,
  SELECT_CLASS_NAME,
  SectionHeading,
  SelectArrow,
  TEXTAREA_CLASS_NAME,
  TrashIcon,
  joinClasses,
} from "../shared/PartnerFlowShared";

const createEmptyItemDraft = () => ({
  id: "",
  itemName: "",
  price: "",
  description: "",
});

const createServiceDraftFromService = (service) => ({
  id: service.id,
  partnerType: service.partnerType || "services",
  name: service.name || "",
  categoryName: service.categoryName || "",
  price: String(service.price ?? ""),
  currency: service.currency || "EGP",
  timeslotDurationInMin: String(service.timeslotDurationInMin ?? 60),
  numberOfCustomerPerTimeSlots: String(
    service.numberOfCustomerPerTimeSlots ?? 1
  ),
  description: service.description || "",
  subDescription: service.subDescription || "",
  governorateId: service.governorateId || "",
  governorateName: service.governorateName || "",
  neighborhoodId: service.neighborhoodId || "",
  neighborhoodName: service.neighborhoodName || "",
  imageFiles: [],
  existingImages: service.imageUrls || [],
  deletedImages: [],
  items: service.items || [],
  availability:
    service.availability ||
    createAvailabilityFromAgendas(service.agendas || []),
});

const isServiceDetailsComplete = (draft) =>
  [
    draft.name,
    draft.categoryName,
    draft.price,
    draft.currency,
    draft.timeslotDurationInMin,
    draft.numberOfCustomerPerTimeSlots,
    draft.description,
    draft.subDescription,
    draft.governorateId,
    draft.neighborhoodId,
  ].every((value) => String(value || "").trim()) &&
  Number(draft.price) > 0 &&
  Number(draft.timeslotDurationInMin) > 0 &&
  Number(draft.numberOfCustomerPerTimeSlots) > 0 &&
  draft.imageFiles.length + draft.existingImages.length > 0;

function ServiceTypeStep({
  draft,
  onPatch,
  onNext,
  onCancel,
  onStepClick,
  canNavigateToStep,
}) {
  return (
    <div className="flex flex-col gap-6">
      <ProgressStepper
        steps={SERVICE_STEPS}
        currentStep={1}
        onStepClick={onStepClick}
        canNavigateToStep={canNavigateToStep}
      />

      <section className={PANEL_CLASS_NAME}>
        <div className="flex flex-col gap-8">
          <SectionHeading
            title="Become a Partner"
            description="Choose what kind of offering you want to add to your profile."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {SERVICE_CHANNEL_OPTIONS.map((option) => {
              const isSelected = draft.partnerType === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onPatch({ partnerType: option.id })}
                  className={joinClasses(
                    "relative flex min-h-[220px] cursor-pointer flex-col rounded-[20px] border bg-[#E6E8EF]/50 p-5 text-left transition",
                    isSelected
                      ? "border-[#011C60] bg-white shadow-[0px_14px_30px_rgba(1,28,96,0.08)]"
                      : "border-[#E2E6F0] hover:border-[#011C60] hover:bg-white"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0px_10px_24px_rgba(17,27,71,0.08)]">
                      <img
                        src={option.image}
                        alt=""
                        className="h-8 w-8 object-contain"
                      />
                    </span>

                    {isSelected && (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#011C60] bg-[#011C60]">
                        <CheckIcon />
                      </span>
                    )}
                  </div>

                  <div className="mt-8">
                    <h3 className="font-['Roboto'] text-[24px] font-medium leading-9 text-[#011C60]">
                      {option.label}
                    </h3>
                    <p className="mt-3 font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <FlowActions
            secondaryLabel="Cancel"
            onSecondary={onCancel}
            primaryLabel="Next"
            onPrimary={onNext}
            primaryDisabled={!draft.partnerType}
          />
        </div>
      </section>
    </div>
  );
}

function ServiceDetailsStep({
  draft,
  onPatch,
  onBack,
  onNext,
  onStepClick,
  canNavigateToStep,
}) {
  const [governorates, setGovernorates] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [locationError, setLocationError] = useState("");
  const [isLoadingGovernorates, setIsLoadingGovernorates] = useState(false);
  const [isLoadingNeighborhoods, setIsLoadingNeighborhoods] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadGovernorates = async () => {
      setIsLoadingGovernorates(true);
      setLocationError("");

      try {
        const payload = await getGovernorates("en");

        if (!isMounted) return;

        setGovernorates(
          getApiList(payload, ["governorates", "data", "result", "results"])
        );
      } catch (error) {
        if (!isMounted) return;

        setLocationError(
          getErrorMessage(error, "Could not load governorates right now.")
        );
      } finally {
        if (isMounted) {
          setIsLoadingGovernorates(false);
        }
      }
    };

    loadGovernorates();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadNeighborhoods = async () => {
      if (!draft.governorateId) {
        setNeighborhoods([]);
        return;
      }

      setIsLoadingNeighborhoods(true);
      setLocationError("");

      try {
        const payload = await getNeighborhoods(draft.governorateId, "en");

        if (!isMounted) return;

        setNeighborhoods(
          getApiList(payload, [
            "neighborhoods",
            "areas",
            "data",
            "result",
            "results",
          ])
        );
      } catch (error) {
        if (!isMounted) return;

        setLocationError(
          getErrorMessage(error, "Could not load neighborhoods right now.")
        );
      } finally {
        if (isMounted) {
          setIsLoadingNeighborhoods(false);
        }
      }
    };

    loadNeighborhoods();

    return () => {
      isMounted = false;
    };
  }, [draft.governorateId]);

  const handleExistingImageRemove = (imageUrl) => {
    onPatch({
      existingImages: draft.existingImages.filter((currentImage) => currentImage !== imageUrl),
      deletedImages: [...draft.deletedImages, imageUrl],
    });
  };

  const handleNewImageRemove = (fileIndex) => {
    onPatch({
      imageFiles: draft.imageFiles.filter((_, index) => index !== fileIndex),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <ProgressStepper
        steps={SERVICE_STEPS}
        currentStep={2}
        onStepClick={onStepClick}
        canNavigateToStep={canNavigateToStep}
      />

      <section className={PANEL_CLASS_NAME}>
        <div className="flex flex-col gap-8">
          <SectionHeading
            title="Service Details"
            description="Tell us about the specialized service you'll provide to your clients."
          />

          {locationError && (
            <p className="font-['Roboto'] text-[14px] leading-5 text-[#DC2626]">
              {locationError}
            </p>
          )}

          <div>
            <FieldLabel>Service</FieldLabel>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(event) => onPatch({ name: event.target.value })}
                  placeholder="Service Name"
                  className={INPUT_CLASS_NAME}
                />
              </label>

              <label className="relative">
                <select
                  value={draft.categoryName}
                  onChange={(event) =>
                    onPatch({ categoryName: event.target.value })
                  }
                  className={SELECT_CLASS_NAME}
                >
                  <option value="">Service category</option>
                  {SERVICE_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </label>
            </div>
          </div>

          <div>
            <label className="block cursor-pointer rounded-[20px] border border-dashed border-[#D7DDED] bg-white p-4 transition hover:border-[#011C60]">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) =>
                  onPatch({
                    imageFiles: Array.from(event.target.files || []).slice(0, 5),
                  })
                }
              />

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3F4F7]">
                    <img
                      src={PARTNER_FLOW_ASSETS.addImageIllustration}
                      alt=""
                      className="h-8 w-8 object-contain"
                    />
                  </span>

                  <div>
                    <p className="font-['Roboto'] text-[24px] font-medium leading-10 text-[#011C60]">
                      Add Service Photo
                    </p>
                    <p className="font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
                      Upload up to 5 images for your service.
                    </p>
                  </div>
                </div>

                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#011C60]">
                  <PlusIcon stroke="white" />
                </span>
              </div>
            </label>

            {(draft.existingImages.length > 0 || draft.imageFiles.length > 0) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {draft.existingImages.map((imageUrl, index) => (
                  <button
                    key={`${imageUrl}-${index}`}
                    type="button"
                    onClick={() => handleExistingImageRemove(imageUrl)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#EAF0FF] px-3 py-1.5 font-['Roboto'] text-[13px] font-medium text-[#011C60]"
                  >
                    <span>{`Existing image ${index + 1}`}</span>
                    <span className="text-[#DC2626]">x</span>
                  </button>
                ))}

                {draft.imageFiles.map((file, index) => (
                  <button
                    key={`${file.name}-${file.lastModified}`}
                    type="button"
                    onClick={() => handleNewImageRemove(index)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#EAF0FF] px-3 py-1.5 font-['Roboto'] text-[13px] font-medium text-[#011C60]"
                  >
                    <span>{file.name}</span>
                    <span className="text-[#DC2626]">x</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <FieldLabel>Location</FieldLabel>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="relative">
                <select
                  value={draft.governorateId}
                  onChange={(event) => {
                    const nextGovernorateId = event.target.value;
                    const selectedGovernorate = governorates.find(
                      (governorate) => getItemId(governorate) === nextGovernorateId
                    );

                    onPatch({
                      governorateId: nextGovernorateId,
                      governorateName: getItemName(selectedGovernorate),
                      neighborhoodId: "",
                      neighborhoodName: "",
                    });
                  }}
                  disabled={isLoadingGovernorates}
                  className={SELECT_CLASS_NAME}
                >
                  <option value="">
                    {isLoadingGovernorates ? "Loading governorates..." : "Select governorate"}
                  </option>
                  {governorates.map((governorate) => (
                    <option
                      key={getItemId(governorate)}
                      value={getItemId(governorate)}
                    >
                      {getItemName(governorate)}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </label>

              <label className="relative">
                <select
                  value={draft.neighborhoodId}
                  onChange={(event) => {
                    const nextNeighborhoodId = event.target.value;
                    const selectedNeighborhood = neighborhoods.find(
                      (neighborhood) => getItemId(neighborhood) === nextNeighborhoodId
                    );

                    onPatch({
                      neighborhoodId: nextNeighborhoodId,
                      neighborhoodName: getItemName(selectedNeighborhood),
                    });
                  }}
                  disabled={!draft.governorateId || isLoadingNeighborhoods}
                  className={SELECT_CLASS_NAME}
                >
                  <option value="">
                    {isLoadingNeighborhoods ? "Loading neighborhoods..." : "Coverage area"}
                  </option>
                  {neighborhoods.map((neighborhood) => (
                    <option
                      key={getItemId(neighborhood)}
                      value={getItemId(neighborhood)}
                    >
                      {getItemName(neighborhood)}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </label>
            </div>
          </div>

          <div>
            <FieldLabel>Description</FieldLabel>
            <div className="flex flex-col gap-4">
              <label>
                <input
                  type="text"
                  value={draft.description}
                  onChange={(event) =>
                    onPatch({ description: event.target.value })
                  }
                  placeholder="Write a simple, catchy one-line summary of your service"
                  className={INPUT_CLASS_NAME}
                />
              </label>

              <label>
                <textarea
                  rows="5"
                  value={draft.subDescription}
                  onChange={(event) =>
                    onPatch({ subDescription: event.target.value })
                  }
                  placeholder="Describe your service in clear, helpful details"
                  className={TEXTAREA_CLASS_NAME}
                />
              </label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label>
              <FieldLabel>Price</FieldLabel>
              <input
                type="number"
                min="0"
                step="0.01"
                value={draft.price}
                onChange={(event) => onPatch({ price: event.target.value })}
                placeholder="Price"
                className={INPUT_CLASS_NAME}
              />
            </label>

            <label>
              <FieldLabel>Currency</FieldLabel>
              <input
                type="text"
                value={draft.currency}
                onChange={(event) => onPatch({ currency: event.target.value })}
                placeholder="EGP"
                className={INPUT_CLASS_NAME}
              />
            </label>

            <label>
              <FieldLabel>Service Time</FieldLabel>
              <input
                type="number"
                min="1"
                step="1"
                value={draft.timeslotDurationInMin}
                onChange={(event) =>
                  onPatch({ timeslotDurationInMin: event.target.value })
                }
                placeholder="60"
                className={INPUT_CLASS_NAME}
              />
            </label>

            <label>
              <FieldLabel>Customers Per Slot</FieldLabel>
              <input
                type="number"
                min="1"
                step="1"
                value={draft.numberOfCustomerPerTimeSlots}
                onChange={(event) =>
                  onPatch({
                    numberOfCustomerPerTimeSlots: event.target.value,
                  })
                }
                placeholder="1"
                className={INPUT_CLASS_NAME}
              />
            </label>
          </div>

          <FlowActions
            secondaryLabel="Back"
            onSecondary={onBack}
            primaryLabel="Next"
            onPrimary={onNext}
            primaryDisabled={!isServiceDetailsComplete(draft)}
          />
        </div>
      </section>
    </div>
  );
}

function ServiceItemsStep({
  items,
  onBack,
  onNext,
  onSaveItem,
  onEditItem,
  onDeleteItem,
  onStepClick,
  canNavigateToStep,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftItem, setDraftItem] = useState(createEmptyItemDraft());
  const [formError, setFormError] = useState("");

  const resetModal = () => {
    setDraftItem(createEmptyItemDraft());
    setFormError("");
  };

  const openNewModal = () => {
    resetModal();
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setDraftItem(item);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (
      !draftItem.itemName.trim() ||
      !draftItem.price ||
      !draftItem.description.trim()
    ) {
      setFormError("Please complete item name, price, and description.");
      return;
    }

    if (draftItem.id) {
      onEditItem({
        ...draftItem,
        itemName: draftItem.itemName.trim(),
        description: draftItem.description.trim(),
      });
    } else {
      onSaveItem({
        ...draftItem,
        id: `service-item-${Date.now()}`,
        itemName: draftItem.itemName.trim(),
        description: draftItem.description.trim(),
      });
    }

    setIsModalOpen(false);
    resetModal();
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <ProgressStepper
          steps={SERVICE_STEPS}
          currentStep={3}
          onStepClick={onStepClick}
          canNavigateToStep={canNavigateToStep}
        />

        <section className={PANEL_CLASS_NAME}>
          <div className="flex flex-col gap-8">
            <SectionHeading
              title="Service Items"
              description="Define your offerings. These can also be used later as package features."
            />

            <div className="grid gap-4 md:grid-cols-2">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[20px] border border-[#E6E8EF] bg-white p-5 shadow-[0px_12px_24px_rgba(17,27,71,0.05)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF3FF]">
                      <BriefcaseIcon />
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#EFF3FF]"
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#FFF1F1]"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>

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
                onClick={openNewModal}
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
                Items are optional, but adding them now makes package creation much easier later.
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
        <ModalShell onClose={() => setIsModalOpen(false)} widthClassName="max-w-lg">
          <div className="flex flex-col gap-7">
            <div className="text-center">
              <h3 className="font-['Roboto'] text-[28px] font-semibold leading-[40px] text-[#011C60]">
                {draftItem.id ? "Edit service item" : "Add service item"}
              </h3>
            </div>

            <div className="flex flex-col gap-5">
              <label>
                <FieldLabel>Item name</FieldLabel>
                <input
                  type="text"
                  value={draftItem.itemName}
                  onChange={(event) =>
                    setDraftItem((currentItem) => ({
                      ...currentItem,
                      itemName: event.target.value,
                    }))
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
                    setDraftItem((currentItem) => ({
                      ...currentItem,
                      price: event.target.value,
                    }))
                  }
                  placeholder="Price"
                  className={INPUT_CLASS_NAME}
                />
              </label>

              <label>
                <FieldLabel>Description</FieldLabel>
                <textarea
                  rows="5"
                  value={draftItem.description}
                  onChange={(event) =>
                    setDraftItem((currentItem) => ({
                      ...currentItem,
                      description: event.target.value,
                    }))
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
              onClick={handleSave}
              className="min-h-12 w-full cursor-pointer rounded-2xl bg-[#011C60] px-6 py-3 font-['Roboto'] text-[16px] font-semibold text-white transition hover:bg-[#02267F]"
            >
              Save
            </button>
          </div>
        </ModalShell>
      )}
    </>
  );
}

function AvailabilityStep({
  availability,
  onPatch,
  onBack,
  onSave,
  onStepClick,
  canNavigateToStep,
  isSubmitting,
}) {
  const totalHours = calculateTotalHours(
    availability.startHour,
    availability.endHour
  );
  const isTimeValid = totalHours > 0;
  const hasSelectedDays = availability.days.length > 0;
  const canSave = isTimeValid && hasSelectedDays;

  return (
    <div className="flex flex-col gap-6">
      <ProgressStepper
        steps={SERVICE_STEPS}
        currentStep={4}
        onStepClick={onStepClick}
        canNavigateToStep={canNavigateToStep}
      />

      <section className={PANEL_CLASS_NAME}>
        <div className="flex flex-col gap-8">
          <SectionHeading
            title="When are you available?"
            description="Set your weekly recurring schedule. Clients will only be able to book you during these hours."
          />

          <div className="rounded-[20px] border border-[#E6E8EF] bg-[#FCFCFE] p-5">
            <div>
              <FieldLabel>Select Days</FieldLabel>
              <div className="flex flex-wrap gap-3">
                {WEEKDAY_OPTIONS.map((day) => {
                  const isSelected = availability.days.includes(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() =>
                        onPatch({
                          days: isSelected
                            ? availability.days.filter((currentDay) => currentDay !== day)
                            : [...availability.days, day],
                        })
                      }
                      className={joinClasses(
                        "cursor-pointer rounded-xl border px-4 py-2 font-['Roboto'] text-[14px] font-medium transition",
                        isSelected
                          ? "border-[#011C60] bg-[#011C60] text-white"
                          : "border-[#CCD2DF] bg-white text-[#6777A0] hover:border-[#011C60] hover:text-[#011C60]"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="relative">
                <FieldLabel>From</FieldLabel>
                <select
                  value={availability.startHour}
                  disabled={availability.dailyWindow}
                  onChange={(event) =>
                    onPatch({ startHour: event.target.value })
                  }
                  className={SELECT_CLASS_NAME}
                >
                  {HOUR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </label>

              <label className="relative">
                <FieldLabel>To</FieldLabel>
                <select
                  value={availability.endHour}
                  disabled={availability.dailyWindow}
                  onChange={(event) =>
                    onPatch({ endHour: event.target.value })
                  }
                  className={SELECT_CLASS_NAME}
                >
                  {HOUR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </label>
            </div>

            <div className="mt-6 rounded-2xl bg-[#F3F4F7] p-4">
              <button
                type="button"
                onClick={() =>
                  onPatch(
                    availability.dailyWindow
                      ? {
                          dailyWindow: false,
                          startHour: "9",
                          endHour: "17",
                        }
                      : {
                          dailyWindow: true,
                          startHour: "0",
                          endHour: "24",
                        }
                  )
                }
                className="flex w-full cursor-pointer items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 text-left">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                    <ClockIcon />
                  </span>

                  <div>
                    <p className="font-['Roboto'] text-[18px] font-medium leading-7 text-[#011C60]">
                      Daily Window
                    </p>
                    <p className="font-['Roboto'] text-[14px] leading-5 text-[#6777A0]">
                      Set a full-day window from 12 AM to 12 AM
                    </p>
                  </div>
                </div>

                <span
                  className={joinClasses(
                    "relative inline-flex h-7 w-12 rounded-full transition",
                    availability.dailyWindow ? "bg-[#011C60]" : "bg-[#C9D0E3]"
                  )}
                >
                  <span
                    className={joinClasses(
                      "absolute top-1 h-5 w-5 rounded-full bg-white shadow-[0px_4px_12px_rgba(17,27,71,0.18)] transition",
                      availability.dailyWindow ? "left-6" : "left-1"
                    )}
                  />
                </span>
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-[#E6E8EF] bg-white p-4">
              <p className="font-['Roboto'] text-[16px] font-medium leading-6 text-[#011C60]">
                Working window
              </p>
              <p className="mt-2 font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
                {formatHourLabel(availability.startHour)} to{" "}
                {formatHourLabel(availability.endHour)}
              </p>
              <p className="mt-2 font-['Roboto'] text-[15px] leading-6 text-[#011C60]">
                Total hours: {totalHours}
              </p>
            </div>

            {!isTimeValid && (
              <p className="mt-4 font-['Roboto'] text-[14px] leading-5 text-[#DC2626]">
                End hour must be after the start hour.
              </p>
            )}

            {!hasSelectedDays && (
              <p className="mt-4 font-['Roboto'] text-[14px] leading-5 text-[#6777A0]">
                Select at least one day to save your availability.
              </p>
            )}
          </div>

          <FlowActions
            secondaryLabel="Back"
            onSecondary={onBack}
            primaryLabel="Save Changes"
            onPrimary={onSave}
            primaryDisabled={!canSave}
            primaryLoading={isSubmitting}
          />
        </div>
      </section>
    </div>
  );
}

function ServiceSuccessModal({
  isEdit,
  onClose,
  onAddAnother,
}) {
  return (
    <ModalShell onClose={onClose} widthClassName="max-w-xl">
      <div className="flex flex-col items-center gap-5 text-center">
        <img
          src={PARTNER_FLOW_ASSETS.successAddServiceImage}
          alt="Service saved"
          className="h-auto w-full max-w-[220px] object-contain"
        />
        <h3 className="font-['Roboto'] text-[32px] font-semibold leading-[44px] text-[#011C60]">
          {isEdit ? "Your service was updated successfully" : "Your service is now live"}
        </h3>
        <p className="max-w-md font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
          {isEdit
            ? "Your latest service changes are saved and ready in your dashboard."
            : "Customers can now discover and book your service through your professional profile."}
        </p>

        <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 min-w-[170px] cursor-pointer rounded-2xl border border-[#011C60] bg-white px-6 py-3 font-['Roboto'] text-[16px] font-semibold text-[#011C60] transition hover:bg-[#F5F7FC]"
          >
            Go to Dashboard
          </button>
          {!isEdit && (
            <button
              type="button"
              onClick={onAddAnother}
              className="min-h-12 min-w-[190px] cursor-pointer rounded-2xl bg-[#011C60] px-6 py-3 font-['Roboto'] text-[16px] font-semibold text-white transition hover:bg-[#02267F]"
            >
              Add Another Service
            </button>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

export default function ServiceFlow({
  services,
  isLoading,
  onCreateService,
  onUpdateService,
  onDeleteService,
}) {
  const [activeDashboardTab, setActiveDashboardTab] = useState("services");
  const [mode, setMode] = useState("dashboard");
  const [currentStep, setCurrentStep] = useState(1);
  const [furthestStepReached, setFurthestStepReached] = useState(1);
  const [draft, setDraft] = useState(createEmptyServiceDraft());
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successState, setSuccessState] = useState(null);

  const dashboardCounts = useMemo(
    () => ({
      services: services.filter((service) => service.partnerType === "services").length,
      store: services.filter((service) => service.partnerType === "store").length,
      marketplace: services.filter((service) => service.partnerType === "marketplace").length,
    }),
    [services]
  );

  const visibleServices = useMemo(
    () => services.filter((service) => service.partnerType === activeDashboardTab),
    [activeDashboardTab, services]
  );

  const showToast = (type, message) => {
    setToast({
      id: Date.now(),
      type,
      message,
    });
  };

  const resetDraft = () => {
    setDraft(createEmptyServiceDraft());
    setCurrentStep(1);
    setFurthestStepReached(1);
  };

  const openCreateFlow = () => {
    resetDraft();
    setMode("create");
  };

  const openEditFlow = (service) => {
    setDraft(createServiceDraftFromService(service));
    setCurrentStep(1);
    setFurthestStepReached(4);
    setMode("edit");
  };

  const closeForm = () => {
    resetDraft();
    setMode("dashboard");
  };

  const handlePatch = (patch) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      ...patch,
    }));
  };

  const handleStepChange = (stepId) => {
    if (stepId <= furthestStepReached) {
      setCurrentStep(stepId);
    }
  };

  const handleStepOneNext = () => {
    if (draft.partnerType !== "services") {
      setActiveDashboardTab(draft.partnerType);
      setMode("dashboard");
      showToast("info", `${draft.partnerType} flow will be added in a later phase.`);
      resetDraft();
      return;
    }

    setCurrentStep(2);
    setFurthestStepReached((currentValue) => Math.max(currentValue, 2));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (mode === "edit") {
        await onUpdateService(draft);
      } else {
        await onCreateService(draft);
      }

      setSuccessState({ isEdit: mode === "edit" });
      resetDraft();
      setMode("dashboard");
      setActiveDashboardTab("services");
    } catch (error) {
      showToast(
        "error",
        getErrorMessage(error, "We couldn't save the service right now.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm("Delete this service permanently?")) return;

    try {
      await onDeleteService(serviceId);
      showToast("success", "Service deleted successfully.");
    } catch (error) {
      showToast(
        "error",
        getErrorMessage(error, "We couldn't delete the service right now.")
      );
    }
  };

  const renderDashboard = () => (
    <div className="flex flex-col gap-6">
      <Toast
        key={toast?.id}
        type={toast?.type}
        message={toast?.message}
        onClose={() => setToast(null)}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {SERVICE_CHANNEL_OPTIONS.map((option) => {
          const count = dashboardCounts[option.id];

          return (
            <DashboardStatCard
              key={option.id}
              label={option.label}
              count={count}
              isActive={activeDashboardTab === option.id}
              onClick={() => setActiveDashboardTab(option.id)}
              icon={
                <img src={option.image} alt="" className="h-6 w-6 object-contain" />
              }
            />
          );
        })}
      </div>

      <section className={PANEL_CLASS_NAME}>
        <div className="flex flex-col gap-6">
          <SectionHeading
            title="Service Dashboard"
            description="Manage your service listings from one place."
            action={
              activeDashboardTab === "services" ? (
                <button
                  type="button"
                  onClick={openCreateFlow}
                  className="min-h-12 min-w-[180px] cursor-pointer rounded-2xl bg-[#011C60] px-5 py-3 font-['Roboto'] text-[16px] font-semibold text-white transition hover:bg-[#02267F]"
                >
                  Add New Service
                </button>
              ) : null
            }
          />

          {isLoading ? (
            <div className="rounded-[20px] border border-[#E6E8EF] bg-[#FCFCFE] p-8 text-center font-['Roboto'] text-[16px] text-[#6777A0]">
              Loading your dashboard...
            </div>
          ) : activeDashboardTab !== "services" ? (
            <div className="rounded-[20px] border border-[#E6E8EF] bg-[#FCFCFE] p-8 text-center">
              <h3 className="font-['Roboto'] text-[24px] font-semibold text-[#011C60]">
                {activeDashboardTab === "store" ? "Store" : "Marketplace"} dashboard is still empty
              </h3>
              <p className="mt-3 font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
                We kept this tab ready for the next phase, but no records are shown here yet.
              </p>
            </div>
          ) : visibleServices.length === 0 ? (
            <div className="mx-auto flex max-w-[700px] flex-col items-center text-center">
              <img
                src={PARTNER_FLOW_ASSETS.emptyServiceImage}
                alt="Empty services illustration"
                className="h-auto w-full max-w-[420px] object-contain"
              />
              <h3 className="mt-6 font-['Roboto'] text-[30px] font-medium leading-[42px] text-[#011C60]">
                You don't have any service yet
              </h3>
              <p className="mt-3 max-w-[520px] font-['Roboto'] text-[16px] leading-6 text-[#6777A0]">
                Start by adding your first service so clients can discover and book you.
              </p>
              <button
                type="button"
                onClick={openCreateFlow}
                className="mt-8 min-h-12 w-full max-w-[320px] cursor-pointer rounded-2xl bg-[#011C60] px-6 py-3 font-['Roboto'] text-[16px] font-semibold text-white transition hover:bg-[#02267F]"
              >
                Add New Service
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[20px] border border-[#E6E8EF]">
              <table className="min-w-[620px] w-full border-collapse">
                <thead className="bg-[#F8F9FC]">
                  <tr>
                    <th className="px-5 py-4 text-left font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                      Service Name
                    </th>
                    <th className="px-5 py-4 text-left font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                      Price
                    </th>
                    <th className="px-5 py-4 text-right font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleServices.map((service) => (
                    <tr key={service.id} className="border-t border-[#E6E8EF]">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-['Roboto'] text-[15px] font-semibold text-[#011C60]">
                            {service.name}
                          </p>
                          <p className="mt-1 font-['Roboto'] text-[13px] text-[#6777A0]">
                            {String(service.categoryName || "Service").replaceAll("_", " ")}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-['Roboto'] text-[15px] text-[#011C60]">
                        {formatMoney(service.price, service.currency)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditFlow(service)}
                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#EFF3FF]"
                          >
                            <EditIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(service.id)}
                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#FFF1F1]"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {successState && (
        <ServiceSuccessModal
          isEdit={successState.isEdit}
          onClose={() => setSuccessState(null)}
          onAddAnother={() => {
            setSuccessState(null);
            openCreateFlow();
          }}
        />
      )}
    </div>
  );

  if (mode === "dashboard") {
    return renderDashboard();
  }

  return (
    <div className="flex flex-col gap-6">
      <Toast
        key={toast?.id}
        type={toast?.type}
        message={toast?.message}
        onClose={() => setToast(null)}
      />

      {currentStep === 1 && (
        <ServiceTypeStep
          draft={draft}
          onPatch={handlePatch}
          onNext={handleStepOneNext}
          onCancel={closeForm}
          onStepClick={handleStepChange}
          canNavigateToStep={(stepId) => stepId <= furthestStepReached}
        />
      )}

      {currentStep === 2 && (
        <ServiceDetailsStep
          draft={draft}
          onPatch={handlePatch}
          onBack={() => setCurrentStep(1)}
          onNext={() => {
            setCurrentStep(3);
            setFurthestStepReached((currentValue) => Math.max(currentValue, 3));
          }}
          onStepClick={handleStepChange}
          canNavigateToStep={(stepId) => stepId <= furthestStepReached}
        />
      )}

      {currentStep === 3 && (
        <ServiceItemsStep
          items={draft.items}
          onBack={() => setCurrentStep(2)}
          onNext={() => {
            setCurrentStep(4);
            setFurthestStepReached((currentValue) => Math.max(currentValue, 4));
          }}
          onSaveItem={(item) =>
            handlePatch({
              items: [...draft.items, item],
            })
          }
          onEditItem={(item) =>
            handlePatch({
              items: draft.items.map((currentItem) =>
                currentItem.id === item.id ? item : currentItem
              ),
            })
          }
          onDeleteItem={(itemId) =>
            handlePatch({
              items: draft.items.filter((item) => item.id !== itemId),
            })
          }
          onStepClick={handleStepChange}
          canNavigateToStep={(stepId) => stepId <= furthestStepReached}
        />
      )}

      {currentStep === 4 && (
        <AvailabilityStep
          availability={draft.availability || createEmptyAvailabilityData()}
          onPatch={(patch) =>
            handlePatch({
              availability: {
                ...draft.availability,
                ...patch,
              },
            })
          }
          onBack={() => setCurrentStep(3)}
          onSave={handleSubmit}
          onStepClick={handleStepChange}
          canNavigateToStep={(stepId) => stepId <= furthestStepReached}
          isSubmitting={isSubmitting}
        />
      )}

      {successState && (
        <ServiceSuccessModal
          isEdit={successState.isEdit}
          onClose={() => setSuccessState(null)}
          onAddAnother={() => {
            setSuccessState(null);
            openCreateFlow();
          }}
        />
      )}
    </div>
  );
}
