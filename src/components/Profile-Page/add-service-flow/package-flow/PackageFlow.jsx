import { useMemo, useState } from "react";

import Toast from "../../../common/Toast";
import { getErrorMessage } from "../../../../api/api.utils";
import {
  PACKAGE_BILLING_PERIOD_OPTIONS,
  createEmptyPackageDraft,
  formatMoney,
} from "../shared/partnerFlowData";
import {
  EditIcon,
  FieldLabel,
  FlowActions,
  INPUT_CLASS_NAME,
  ModalShell,
  PANEL_CLASS_NAME,
  PackageIcon,
  SELECT_CLASS_NAME,
  SectionHeading,
  SelectArrow,
  TrashIcon,
  joinClasses,
} from "../shared/PartnerFlowShared";

const createPackageDraftFromPackage = (partnerPackage) => ({
  id: partnerPackage.id,
  name: partnerPackage.name || "",
  billingPeriod: partnerPackage.billingPeriod || "Monthly",
  duration: String(partnerPackage.duration ?? 1),
  price: String(partnerPackage.price ?? ""),
  serviceId: partnerPackage.serviceId || partnerPackage.serviceIds?.[0] || "",
  includedItemIds: partnerPackage.includedItemIds || [],
});

const isPackageFormComplete = (draft) =>
  [draft.name, draft.billingPeriod, draft.duration, draft.price, draft.serviceId].every(
    (value) => String(value || "").trim()
  ) &&
  Number(draft.duration) > 0 &&
  Number(draft.price) > 0;

function PackageSuccessModal({ isEdit, onClose, onAddAnother }) {
  return (
    <ModalShell onClose={onClose} widthClassName="max-w-3xl">
      <div className="grid gap-5 lg:grid-cols-[1.1fr,1fr]">
        <div className="rounded-[24px] border border-[#E6E8EF] bg-[#FCFCFE] p-6">
          <h3 className="font-['Roboto'] text-[34px] font-semibold leading-[46px] text-[#011C60]">
            {isEdit ? "Your package was updated" : "Your Package is Live !"}
          </h3>
          <p className="mt-4 max-w-md font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
            {isEdit
              ? "Your latest package edits are saved and ready on your dashboard."
              : "Customers can now view and book your package through your professional profile."}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-[24px] border border-[#E6E8EF] bg-white p-6 text-center shadow-[0px_12px_40px_rgba(17,27,71,0.06)]">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EFF3FF]">
            <PackageIcon className="h-10 w-10" />
          </span>

          <h4 className="mt-5 font-['Roboto'] text-[28px] font-semibold leading-[40px] text-[#011C60]">
            {isEdit ? "Package Updated" : "Your Package is Live !"}
          </h4>

          <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:justify-between">
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
                Add Another Package
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

export default function PackageFlow({
  packages,
  services,
  isLoading,
  onCreatePackage,
  onUpdatePackage,
  onSwitchToService,
}) {
  const [mode, setMode] = useState("dashboard");
  const [draft, setDraft] = useState(createEmptyPackageDraft());
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successState, setSuccessState] = useState(null);

  const selectedService = useMemo(
    () => services.find((service) => service.id === draft.serviceId) || null,
    [draft.serviceId, services]
  );

  const selectedFeatures = useMemo(() => {
    if (!selectedService) return [];

    return selectedService.items.filter((item) =>
      draft.includedItemIds.includes(item.id)
    );
  }, [draft.includedItemIds, selectedService]);

  const showToast = (type, message) => {
    setToast({
      id: Date.now(),
      type,
      message,
    });
  };

  const resetDraft = () => {
    setDraft(createEmptyPackageDraft());
  };

  const openCreateForm = () => {
    resetDraft();
    setMode("form");
  };

  const openEditForm = (partnerPackage) => {
    setDraft(createPackageDraftFromPackage(partnerPackage));
    setMode("form");
  };

  const handleReview = () => {
    if (!isPackageFormComplete(draft)) {
      showToast("error", "Please complete the required package fields first.");
      return;
    }

    setMode("review");
  };

  const handlePublish = async () => {
    setIsSubmitting(true);

    try {
      if (draft.id) {
        await onUpdatePackage(draft);
      } else {
        await onCreatePackage(draft);
      }

      setSuccessState({ isEdit: Boolean(draft.id) });
      resetDraft();
      setMode("dashboard");
    } catch (error) {
      showToast(
        "error",
        getErrorMessage(error, "We couldn't publish the package right now.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className={PANEL_CLASS_NAME}>
        <div className="rounded-[20px] border border-[#E6E8EF] bg-[#FCFCFE] p-8 text-center font-['Roboto'] text-[16px] text-[#6777A0]">
          Loading your package workspace...
        </div>
      </section>
    );
  }

  if (services.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <Toast
          key={toast?.id}
          type={toast?.type}
          message={toast?.message}
          onClose={() => setToast(null)}
        />

        <section className={PANEL_CLASS_NAME}>
          <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF3FF]">
              <PackageIcon className="h-7 w-7" />
            </span>
            <h3 className="mt-6 font-['Roboto'] text-[30px] font-medium leading-[42px] text-[#011C60]">
              Create a service before you publish packages
            </h3>
            <p className="mt-3 max-w-xl font-['Roboto'] text-[16px] leading-6 text-[#6777A0]">
              Packages must be linked to one of your services first. Add a service, then come back to bundle it.
            </p>
            <button
              type="button"
              onClick={onSwitchToService}
              className="mt-8 min-h-12 min-w-[220px] cursor-pointer rounded-2xl bg-[#011C60] px-6 py-3 font-['Roboto'] text-[16px] font-semibold text-white transition hover:bg-[#02267F]"
            >
              Offer a Service First
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Toast
        key={toast?.id}
        type={toast?.type}
        message={toast?.message}
        onClose={() => setToast(null)}
      />

      {mode === "dashboard" && (
        <section className={PANEL_CLASS_NAME}>
          <div className="flex flex-col gap-6">
            <SectionHeading
              title="Package Dashboard"
              description="Create and manage the packages that bundle your service offerings."
              action={
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="min-h-12 min-w-[190px] cursor-pointer rounded-2xl bg-[#011C60] px-5 py-3 font-['Roboto'] text-[16px] font-semibold text-white transition hover:bg-[#02267F]"
                >
                  Create Package
                </button>
              }
            />

            {isLoading ? (
              <div className="rounded-[20px] border border-[#E6E8EF] bg-[#FCFCFE] p-8 text-center font-['Roboto'] text-[16px] text-[#6777A0]">
                Loading your packages...
              </div>
            ) : packages.length === 0 ? (
              <div className="rounded-[20px] border border-[#E6E8EF] bg-[#FCFCFE] p-8 text-center">
                <h3 className="font-['Roboto'] text-[28px] font-semibold leading-[40px] text-[#011C60]">
                  Create your first package
                </h3>
                <p className="mt-3 font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
                  Start packaging your service into a ready-made offer customers can book faster.
                </p>
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="mt-6 min-h-12 min-w-[200px] cursor-pointer rounded-2xl bg-[#011C60] px-6 py-3 font-['Roboto'] text-[16px] font-semibold text-white transition hover:bg-[#02267F]"
                >
                  Create Package
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-[20px] border border-[#E6E8EF]">
                <table className="min-w-[560px] w-full border-collapse">
                  <thead className="bg-[#F8F9FC]">
                    <tr>
                      <th className="px-5 py-4 text-left font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
                        Package Name
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
                    {packages.map((partnerPackage) => (
                      <tr key={partnerPackage.id} className="border-t border-[#E6E8EF]">
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-['Roboto'] text-[15px] font-semibold text-[#011C60]">
                              {partnerPackage.name}
                            </p>
                            <p className="mt-1 font-['Roboto'] text-[13px] text-[#6777A0]">
                              {partnerPackage.billingPeriod}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-['Roboto'] text-[15px] text-[#011C60]">
                          {formatMoney(partnerPackage.price)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditForm(partnerPackage)}
                              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#EFF3FF]"
                            >
                              <EditIcon />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                showToast(
                                  "info",
                                  "Package delete is not available yet because the current swagger does not include a delete endpoint."
                                )
                              }
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
      )}

      {mode === "form" && (
        <section className={PANEL_CLASS_NAME}>
          <div className="flex flex-col gap-8">
            <SectionHeading
              title={draft.id ? "Edit your package" : "Create your first package"}
              description="Define how you want to be booked. You can add more packages later."
            />

            <div className="rounded-[20px] border border-[#E6E8EF] bg-[#FCFCFE] p-5">
              <h3 className="font-['Roboto'] text-[22px] font-medium leading-8 text-[#011C60]">
                Packages Details
              </h3>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="relative">
                  <FieldLabel>Service</FieldLabel>
                  <select
                    value={draft.serviceId}
                    onChange={(event) => {
                      const nextServiceId = event.target.value;
                      const nextService = services.find(
                        (service) => service.id === nextServiceId
                      );
                      const validItemIds = nextService?.items.map((item) => item.id) || [];

                      setDraft((currentDraft) => ({
                        ...currentDraft,
                        serviceId: nextServiceId,
                        includedItemIds: currentDraft.includedItemIds.filter((itemId) =>
                          validItemIds.includes(itemId)
                        ),
                      }));
                    }}
                    className={SELECT_CLASS_NAME}
                  >
                    <option value="">Choose a service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                  <SelectArrow />
                </label>

                <label>
                  <FieldLabel>Package Name</FieldLabel>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(event) =>
                      setDraft((currentDraft) => ({
                        ...currentDraft,
                        name: event.target.value,
                      }))
                    }
                    placeholder="e.g. Premium Home Cleaning"
                    className={INPUT_CLASS_NAME}
                  />
                </label>

                <label className="relative">
                  <FieldLabel>Pricing Type</FieldLabel>
                  <select
                    value={draft.billingPeriod}
                    onChange={(event) =>
                      setDraft((currentDraft) => ({
                        ...currentDraft,
                        billingPeriod: event.target.value,
                      }))
                    }
                    className={SELECT_CLASS_NAME}
                  >
                    {PACKAGE_BILLING_PERIOD_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <SelectArrow />
                </label>

                <label>
                  <FieldLabel>Duration</FieldLabel>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={draft.duration}
                    onChange={(event) =>
                      setDraft((currentDraft) => ({
                        ...currentDraft,
                        duration: event.target.value,
                      }))
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
                    value={draft.price}
                    onChange={(event) =>
                      setDraft((currentDraft) => ({
                        ...currentDraft,
                        price: event.target.value,
                      }))
                    }
                    placeholder="50.00"
                    className={INPUT_CLASS_NAME}
                  />
                </label>
              </div>

              <div className="mt-6">
                <FieldLabel>Included Features</FieldLabel>

                {selectedService?.items?.length ? (
                  <div className="flex flex-wrap gap-3">
                    {selectedService.items.map((item) => {
                      const isSelected = draft.includedItemIds.includes(item.id);

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setDraft((currentDraft) => ({
                              ...currentDraft,
                              includedItemIds: isSelected
                                ? currentDraft.includedItemIds.filter(
                                    (itemId) => itemId !== item.id
                                  )
                                : [...currentDraft.includedItemIds, item.id],
                            }))
                          }
                          className={joinClasses(
                            "cursor-pointer rounded-full border px-4 py-2 font-['Roboto'] text-[14px] font-medium transition",
                            isSelected
                              ? "border-[#011C60] bg-[#011C60] text-white"
                              : "border-[#D7DDED] bg-white text-[#6777A0] hover:border-[#011C60] hover:text-[#011C60]"
                          )}
                        >
                          {item.itemName}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
                    {draft.serviceId
                      ? "This service doesn't have items yet. Add service items first if you want selectable features."
                      : "Choose a service first, then select package features from its items."}
                  </p>
                )}
              </div>
            </div>

            <FlowActions
              secondaryLabel="Cancel"
              onSecondary={() => {
                resetDraft();
                setMode("dashboard");
              }}
              primaryLabel="Review Package"
              onPrimary={handleReview}
              primaryDisabled={!isPackageFormComplete(draft)}
            />
          </div>
        </section>
      )}

      {mode === "review" && (
        <div className="grid gap-5 lg:grid-cols-[1.1fr,1fr]">
          <section className={PANEL_CLASS_NAME}>
            <div className="flex flex-col gap-6">
              <SectionHeading
                title="Review Your Package"
                description="Double-check the package before publishing it."
              />

              <div className="rounded-[20px] border border-[#E6E8EF] bg-[#FCFCFE] p-5">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF3FF]">
                    <PackageIcon />
                  </span>
                  <div>
                    <p className="font-['Roboto'] text-[14px] leading-5 text-[#6777A0]">
                      Package name
                    </p>
                    <h3 className="mt-1 font-['Roboto'] text-[22px] font-semibold text-[#011C60]">
                      {draft.name}
                    </h3>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="font-['Roboto'] text-[14px] leading-5 text-[#6777A0]">
                      Linked service
                    </p>
                    <p className="mt-1 font-['Roboto'] text-[18px] font-medium text-[#011C60]">
                      {selectedService?.name}
                    </p>
                  </div>

                  <div>
                    <p className="font-['Roboto'] text-[14px] leading-5 text-[#6777A0]">
                      Billing period
                    </p>
                    <p className="mt-1 font-['Roboto'] text-[18px] font-medium text-[#011C60]">
                      {draft.billingPeriod}
                    </p>
                  </div>

                  <div>
                    <p className="font-['Roboto'] text-[14px] leading-5 text-[#6777A0]">
                      Duration
                    </p>
                    <p className="mt-1 font-['Roboto'] text-[18px] font-medium text-[#011C60]">
                      {draft.duration} Hours
                    </p>
                  </div>

                  <div>
                    <p className="font-['Roboto'] text-[14px] leading-5 text-[#6777A0]">
                      Price
                    </p>
                    <p className="mt-1 font-['Roboto'] text-[18px] font-medium text-[#011C60]">
                      {formatMoney(draft.price)}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="font-['Roboto'] text-[14px] leading-5 text-[#6777A0]">
                    Included Features
                  </p>

                  {selectedFeatures.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedFeatures.map((feature) => (
                        <span
                          key={feature.id}
                          className="rounded-full bg-[#EFF3FF] px-3 py-1.5 font-['Roboto'] text-[13px] font-medium text-[#011C60]"
                        >
                          {feature.itemName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
                      No optional features selected for this package.
                    </p>
                  )}
                </div>
              </div>

              <FlowActions
                secondaryLabel="Edit"
                onSecondary={() => setMode("form")}
                primaryLabel="Publish package"
                onPrimary={handlePublish}
                primaryLoading={isSubmitting}
              />
            </div>
          </section>

          <section className={PANEL_CLASS_NAME}>
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EFF3FF]">
                <PackageIcon className="h-10 w-10" />
              </span>
              <h3 className="mt-6 font-['Roboto'] text-[32px] font-semibold leading-[44px] text-[#011C60]">
                Review before publishing
              </h3>
              <p className="mt-3 max-w-md font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
                Once published, your package will appear on your provider profile and can be updated later.
              </p>
            </div>
          </section>
        </div>
      )}

      {successState && (
        <PackageSuccessModal
          isEdit={successState.isEdit}
          onClose={() => setSuccessState(null)}
          onAddAnother={() => {
            setSuccessState(null);
            openCreateForm();
          }}
        />
      )}
    </div>
  );
}
