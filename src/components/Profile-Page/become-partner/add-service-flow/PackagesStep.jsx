import {
  isPackageEmpty,
} from "./partnerFlowData";
import {
  FieldLabel,
  FlowActions,
  INPUT_CLASS_NAME,
  PANEL_CLASS_NAME,
  ProgressStepper,
  SectionHeading,
  joinClasses,
} from "./PartnerFlowShared";

export default function PackagesStep({
  packageData,
  items,
  onFieldChange,
  onToggleFeature,
  onBack,
  onNext,
  error,
}) {
  const hasStartedPackage = !isPackageEmpty(packageData);

  return (
    <div className="flex flex-col gap-6">
      <ProgressStepper currentStep={4} />

      <section className={PANEL_CLASS_NAME}>
        <div className="flex flex-col gap-8">
          <SectionHeading
            title="Create your first package"
            description="Define how you want to be booked. You can add more packages later."
          />

          <div className="rounded-[20px] border border-[#E6E8EF] bg-[#FCFCFE] p-5">
            <h3 className="font-['Roboto'] text-[22px] font-medium leading-8 text-[#011C60]">
              Packages Details
            </h3>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label>
                <FieldLabel>Package Name</FieldLabel>
                <input
                  type="text"
                  value={packageData.packageName}
                  onChange={(event) =>
                    onFieldChange("packageName", event.target.value)
                  }
                  placeholder="e.g. Premium Home Cleaning"
                  className={INPUT_CLASS_NAME}
                />
              </label>

              <label>
                <FieldLabel>Package Type</FieldLabel>
                <input
                  type="text"
                  value={packageData.packageType}
                  onChange={(event) =>
                    onFieldChange("packageType", event.target.value)
                  }
                  placeholder="Pricing Type"
                  className={INPUT_CLASS_NAME}
                />
              </label>

              <label>
                <FieldLabel>Duration</FieldLabel>
                <input
                  type="text"
                  value={packageData.duration}
                  onChange={(event) =>
                    onFieldChange("duration", event.target.value)
                  }
                  placeholder="Estimated Duration"
                  className={INPUT_CLASS_NAME}
                />
              </label>

              <label>
                <FieldLabel>Price</FieldLabel>
                <input
                  type="text"
                  value={packageData.price}
                  onChange={(event) => onFieldChange("price", event.target.value)}
                  placeholder="50.00"
                  className={INPUT_CLASS_NAME}
                />
              </label>
            </div>

            <div className="mt-6">
              <FieldLabel>Included Features</FieldLabel>

              {items.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {items.map((item) => {
                    const isSelected = packageData.includedItemIds.includes(
                      item.id
                    );

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onToggleFeature(item.id)}
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
                  Add service items first, then choose which ones are included
                  in this package.
                </p>
              )}
            </div>

            {hasStartedPackage && (
              <p className="mt-5 font-['Roboto'] text-[14px] leading-5 text-[#6777A0]">
                Package setup is optional. If you start one, fill all package
                fields before continuing.
              </p>
            )}
          </div>

          {error && (
            <p className="font-['Roboto'] text-[14px] leading-5 text-[#DC2626]">
              {error}
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
  );
}
