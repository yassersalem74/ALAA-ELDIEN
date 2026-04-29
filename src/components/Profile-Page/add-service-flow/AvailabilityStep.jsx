import {
  HOUR_OPTIONS,
  WEEKDAY_OPTIONS,
  calculateTotalHours,
  formatHourLabel,
} from "./partnerFlowData";
import {
  ClockIcon,
  FieldLabel,
  FlowActions,
  PANEL_CLASS_NAME,
  ProgressStepper,
  SELECT_CLASS_NAME,
  SelectArrow,
  SectionHeading,
  joinClasses,
} from "./PartnerFlowShared";

export default function AvailabilityStep({
  availability,
  onToggleDay,
  onFieldChange,
  onBack,
  onSave,
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
      <ProgressStepper currentStep={5} />

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
                      onClick={() => onToggleDay(day)}
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
                  onChange={(event) =>
                    onFieldChange("startHour", event.target.value)
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
                  onChange={(event) =>
                    onFieldChange("endHour", event.target.value)
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
                  onFieldChange("dailyWindow", !availability.dailyWindow)
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
                      Set your peak hours
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
          />
        </div>
      </section>
    </div>
  );
}
