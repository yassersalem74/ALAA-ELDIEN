import {
  FLOW_ASSETS,
  MAX_SERVICE_TIME_HOURS,
  SERVICE_CATEGORY_OPTIONS,
} from "./partnerFlowData";
import {
  FieldLabel,
  FlowActions,
  INPUT_CLASS_NAME,
  PANEL_CLASS_NAME,
  PlusIcon,
  ProgressStepper,
  SELECT_CLASS_NAME,
  SelectArrow,
  SectionHeading,
  TEXTAREA_CLASS_NAME,
} from "./PartnerFlowShared";

export default function ServiceDetailsStep({
  details,
  onChange,
  onBack,
  onNext,
  onPhotoChange,
  onRemovePhoto,
  canContinue,
  uploadError,
  onStepClick,
  governorateOptions = [],
  neighborhoodOptions = [],
  isLoadingGovernorates = false,
  isLoadingNeighborhoods = false,
}) {
  const selectedCoverageAreaIds = Array.isArray(details.coverageArea)
    ? details.coverageArea
    : details.coverageArea
      ? [details.coverageArea]
      : [];

  const handleCoverageAreaToggle = (areaId) => {
    const nextCoverageAreas = selectedCoverageAreaIds.includes(areaId)
      ? selectedCoverageAreaIds.filter((currentAreaId) => currentAreaId !== areaId)
      : [...selectedCoverageAreaIds, areaId];

    onChange("coverageArea", nextCoverageAreas);
  };

  return (
    <div className="flex flex-col gap-6">
      <ProgressStepper currentStep={2} onStepClick={onStepClick} />

      <section className={PANEL_CLASS_NAME}>
        <div className="flex flex-col gap-8">
          <SectionHeading
            title="Service Details"
            description="Tell us about the specialized service you'll provide to your clients."
          />

          <div>
            <FieldLabel>Service</FieldLabel>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <input
                  type="text"
                  value={details.serviceName}
                  onChange={(event) =>
                    onChange("serviceName", event.target.value)
                  }
                  placeholder="Service Name"
                  className={INPUT_CLASS_NAME}
                />
              </label>

              <label className="relative">
                <select
                  value={details.category}
                  onChange={(event) => onChange("category", event.target.value)}
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
                onChange={(event) => {
                  onPhotoChange(event.target.files);
                  event.target.value = "";
                }}
              />

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3F4F7]">
                    <img
                      src={FLOW_ASSETS.addImageIllustration}
                      alt=""
                      className="h-8 w-8 object-contain"
                    />
                  </span>

                  <div>
                    <p className="font-['Roboto'] text-[24px] font-medium leading-10 text-[#011C60]">
                      Add Service Photo
                    </p>
                    <p className="font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
                      Upload 1 to 5 photos
                    </p>
                  </div>
                </div>

                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#011C60]">
                  <PlusIcon stroke="white" />
                </span>
              </div>
            </label>

            {details.photos.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {details.photos.map((file, index) => (
                  <span
                    key={`${file.name}-${file.lastModified}`}
                    className="inline-flex min-h-8 items-center gap-2 rounded-full bg-[#EAF0FF] px-3 py-1.5 font-['Roboto'] text-[13px] font-medium text-[#011C60]"
                  >
                    {file.name}
                    <button
                      type="button"
                      onClick={() => onRemovePhoto(index)}
                      aria-label={`Remove ${file.name}`}
                      className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-[#6777A0] transition hover:bg-white hover:text-[#011C60]"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}

            {uploadError && (
              <p className="mt-3 font-['Roboto'] text-[14px] leading-5 text-[#DC2626]">
                {uploadError}
              </p>
            )}
          </div>

          <div>
            <FieldLabel>Location</FieldLabel>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="relative">
                <select
                  value={details.governorate}
                  onChange={(event) =>
                    onChange("governorate", event.target.value)
                  }
                  className={SELECT_CLASS_NAME}
                >
                  <option value="">
                    {isLoadingGovernorates
                      ? "Loading governorates..."
                      : "Select governorate"}
                  </option>
                  {governorateOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </label>

              <div>
                <div className="rounded-[14px] border border-[#D8DDEB] bg-white p-3 shadow-[8px_4px_16px_0px_rgba(226,232,243,0.5)]">
                  <div className="max-h-44 overflow-y-auto pr-1">
                    {!details.governorate && (
                      <p className="font-['Roboto'] text-[14px] font-semibold leading-6 text-[#9AA6C7]">
                        Select governorate first
                      </p>
                    )}

                    {details.governorate && isLoadingNeighborhoods && (
                      <p className="font-['Roboto'] text-[14px] font-semibold leading-6 text-[#9AA6C7]">
                        Loading neighborhoods...
                      </p>
                    )}

                    {details.governorate &&
                      !isLoadingNeighborhoods &&
                      neighborhoodOptions.length === 0 && (
                        <p className="font-['Roboto'] text-[14px] font-semibold leading-6 text-[#9AA6C7]">
                          No coverage areas available
                        </p>
                      )}

                    {details.governorate &&
                      !isLoadingNeighborhoods &&
                      neighborhoodOptions.map((option) => {
                        const isSelected = selectedCoverageAreaIds.includes(
                          option.value
                        );

                        return (
                          <label
                            key={option.value}
                            className="flex min-h-10 cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-[#F5F7FC]"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleCoverageAreaToggle(option.value)}
                              className="h-4 w-4 accent-[#011C60]"
                            />
                            <span className="font-['Roboto'] text-[14px] font-semibold leading-6 text-[#011C60]">
                              {option.label}
                            </span>
                          </label>
                        );
                      })}
                  </div>
                </div>

                {selectedCoverageAreaIds.length > 0 && (
                  <p className="mt-2 font-['Roboto'] text-[13px] leading-5 text-[#6777A0]">
                    {selectedCoverageAreaIds.length} coverage{" "}
                    {selectedCoverageAreaIds.length === 1 ? "area" : "areas"}{" "}
                    selected
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <FieldLabel>Description</FieldLabel>
            <div className="flex flex-col gap-4">
              <label>
                <input
                  type="text"
                  value={details.description}
                  onChange={(event) =>
                    onChange("description", event.target.value)
                  }
                  placeholder="Write a simple, catchy one-line summary of your service"
                  className={INPUT_CLASS_NAME}
                />
              </label>

              <label>
                <textarea
                  value={details.longDescription}
                  onChange={(event) =>
                    onChange("longDescription", event.target.value)
                  }
                  placeholder="Describe your service in clear, helpful details"
                  rows="5"
                  className={TEXTAREA_CLASS_NAME}
                />
              </label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <FieldLabel>Price</FieldLabel>
              <input
                type="number"
                min="0"
                step="0.01"
                value={details.price}
                onChange={(event) => onChange("price", event.target.value)}
                placeholder="Price"
                className={INPUT_CLASS_NAME}
              />
            </label>

            <label>
              <FieldLabel>Service Time</FieldLabel>
              <input
                type="number"
                min="1"
                max={MAX_SERVICE_TIME_HOURS}
                step="1"
                value={details.serviceTimeHours}
                onChange={(event) =>
                  onChange("serviceTimeHours", event.target.value)
                }
                placeholder={`Hours, max ${MAX_SERVICE_TIME_HOURS}`}
                className={INPUT_CLASS_NAME}
              />
            </label>
          </div>

          <FlowActions
            secondaryLabel="Back"
            onSecondary={onBack}
            primaryLabel="Next"
            onPrimary={onNext}
            primaryDisabled={!canContinue}
          />
        </div>
      </section>
    </div>
  );
}
