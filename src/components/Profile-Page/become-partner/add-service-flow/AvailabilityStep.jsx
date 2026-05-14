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
  onDayFieldChange,
  onBack,
  onSave,
  onStepClick,
  isSaving = false,
}) {
  const getDayWindow = (day) =>
    availability.dayWindows?.[day] || {
      startHour: availability.startHour || "9",
      endHour: availability.endHour || "17",
      dailyWindow: Boolean(availability.dailyWindow),
    };
  const selectedDayRows = (availability.days || []).map((day) => {
    const window = getDayWindow(day);
    const totalHours = calculateTotalHours(window.startHour, window.endHour);

    return {
      day,
      window,
      totalHours,
      isValid: window.dailyWindow || totalHours > 0,
    };
  });
  const isTimeValid = selectedDayRows.every((row) => row.isValid);
  const hasSelectedDays = selectedDayRows.length > 0;
  const canSave = isTimeValid && hasSelectedDays;
  const handleDayFieldChange =
    onDayFieldChange ||
    ((day, fieldName, value) => {
      onFieldChange("dayWindows", {
        ...(availability.dayWindows || {}),
        [day]: {
          ...getDayWindow(day),
          [fieldName]: value,
        },
      });
    });
  const handleDailyWindowChange = (day, nextValue) => {
    handleDayFieldChange(day, "dailyWindow", nextValue);

    if (nextValue) {
      handleDayFieldChange(day, "startHour", "0");
      handleDayFieldChange(day, "endHour", "0");
    } else {
      handleDayFieldChange(day, "startHour", "9");
      handleDayFieldChange(day, "endHour", "17");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <ProgressStepper currentStep={4} onStepClick={onStepClick} />

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

            {hasSelectedDays && (
              <div className="mt-6 flex flex-col gap-3">
                {selectedDayRows.map(({ day, window, totalHours, isValid }) => (
                  <div
                    key={day}
                    className="rounded-2xl border border-[#E6E8EF] bg-white p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                      <div className="flex min-w-[130px] items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F4F7]">
                          <ClockIcon />
                        </span>
                        <div>
                          <p className="font-['Roboto'] text-[16px] font-medium leading-6 text-[#011C60]">
                            {day}
                          </p>
                          <p className="font-['Roboto'] text-[13px] leading-5 text-[#6777A0]">
                            {window.dailyWindow
                              ? "12:00 AM to 11:59 PM"
                              : `${formatHourLabel(
                                  window.startHour
                                )} to ${formatHourLabel(window.endHour)}`}
                          </p>
                        </div>
                      </div>

                      <label className="relative flex-1">
                        <FieldLabel>From</FieldLabel>
                        <select
                          value={window.startHour}
                          onChange={(event) =>
                            handleDayFieldChange(day, "startHour", event.target.value)
                          }
                          className={SELECT_CLASS_NAME}
                          disabled={window.dailyWindow}
                        >
                          {HOUR_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <SelectArrow />
                      </label>

                      <label className="relative flex-1">
                        <FieldLabel>To</FieldLabel>
                        <select
                          value={window.endHour}
                          onChange={(event) =>
                            handleDayFieldChange(day, "endHour", event.target.value)
                          }
                          className={SELECT_CLASS_NAME}
                          disabled={window.dailyWindow}
                        >
                          {HOUR_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <SelectArrow />
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          handleDailyWindowChange(day, !window.dailyWindow)
                        }
                        className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-2xl bg-[#F3F4F7] px-4"
                      >
                        <span className="font-['Roboto'] text-[14px] font-medium text-[#011C60]">
                          Daily Window
                        </span>
                        <span
                          className={joinClasses(
                            "relative inline-flex h-7 w-12 rounded-full transition",
                            window.dailyWindow ? "bg-[#011C60]" : "bg-[#C9D0E3]"
                          )}
                        >
                          <span
                            className={joinClasses(
                              "absolute top-1 h-5 w-5 rounded-full bg-white shadow-[0px_4px_12px_rgba(17,27,71,0.18)] transition",
                              window.dailyWindow ? "left-6" : "left-1"
                            )}
                          />
                        </span>
                      </button>
                    </div>

                    <p
                      className={joinClasses(
                        "mt-3 font-['Roboto'] text-[14px] leading-5",
                        isValid ? "text-[#6777A0]" : "text-[#DC2626]"
                      )}
                    >
                      Total hours: {window.dailyWindow ? 24 : totalHours}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {!isTimeValid && (
              <p className="mt-4 font-['Roboto'] text-[14px] leading-5 text-[#DC2626]">
                End hour must be after the start hour. For a full day, turn on
                Daily Window.
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
            primaryLoading={isSaving}
          />
        </div>
      </section>
    </div>
  );
}
