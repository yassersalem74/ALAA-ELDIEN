import {
  FLOW_ASSETS,
  GOVERNORATE_OPTIONS,
  SERVICE_CATEGORY_OPTIONS,
  getCoverageAreaOptions,
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
  canContinue,
  uploadError,
}) {
  const coverageAreaOptions = getCoverageAreaOptions(details.governorate);

  return (
    <div className="flex flex-col gap-6">
      <ProgressStepper currentStep={2} />

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
                onChange={(event) => onPhotoChange(event.target.files)}
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
                      you can upload up to 5 photos
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
                {details.photos.map((file) => (
                  <span
                    key={`${file.name}-${file.lastModified}`}
                    className="rounded-full bg-[#EAF0FF] px-3 py-1.5 font-['Roboto'] text-[13px] font-medium text-[#011C60]"
                  >
                    {file.name}
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
                  <option value="">Select governorate</option>
                  {GOVERNORATE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </label>

              <label className="relative">
                <select
                  value={details.coverageArea}
                  onChange={(event) =>
                    onChange("coverageArea", event.target.value)
                  }
                  className={SELECT_CLASS_NAME}
                  disabled={!details.governorate}
                >
                  <option value="">Coverage area</option>
                  {coverageAreaOptions.map((option) => (
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

          <div className="max-w-[400px]">
            <FieldLabel>Price</FieldLabel>
            <label>
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
