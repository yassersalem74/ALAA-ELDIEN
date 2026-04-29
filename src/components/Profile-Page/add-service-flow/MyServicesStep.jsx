import { PARTNER_ENTRY_OPTIONS } from "./partnerFlowData";
import {
  BriefcaseIcon,
  CheckIcon,
  FlowActions,
  PANEL_CLASS_NAME,
  ProgressStepper,
  SectionHeading,
  joinClasses,
} from "./PartnerFlowShared";

export default function MyServicesStep({
  selectedOption,
  onSelect,
  onCancel,
  onNext,
}) {
  return (
    <div className="flex flex-col gap-6">
      <ProgressStepper currentStep={1} />

      <section className={PANEL_CLASS_NAME}>
        <div className="flex flex-col gap-8">
          <SectionHeading
            title="Become a Partner"
            description="Join our community of professionals and start growing your business with the Alaa El Deen concierge platform."
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PARTNER_ENTRY_OPTIONS.map((option) => {
              const isSelected = selectedOption === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelect(option.id)}
                  className={joinClasses(
                    "relative flex min-h-[220px] cursor-pointer flex-col rounded-[20px] border bg-[#E6E8EF]/50 p-5 text-left transition",
                    isSelected
                      ? "border-[#011C60] bg-white shadow-[0px_14px_30px_rgba(1,28,96,0.08)]"
                      : "border-[#E2E6F0] hover:border-[#011C60] hover:bg-white"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0px_10px_24px_rgba(17,27,71,0.08)]">
                      {option.image ? (
                        <img
                          src={option.image}
                          alt=""
                          className="h-8 w-8 object-contain"
                        />
                      ) : (
                        <BriefcaseIcon />
                      )}
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
            primaryDisabled={!selectedOption}
          />
        </div>
      </section>
    </div>
  );
}
