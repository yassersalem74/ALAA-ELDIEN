import { FLOW_STEPS } from "./partnerFlowData";

export const PANEL_CLASS_NAME =
  "rounded-[24px] border border-[#E6E8EF] bg-white p-5 shadow-[0px_12px_40px_rgba(17,27,71,0.06)] sm:p-6";

export const INPUT_CLASS_NAME =
  "h-12 w-full rounded-2xl border border-[#F3F4F7] bg-[#F3F4F7] px-4 font-['Roboto'] text-[15px] leading-6 text-[#011C60] outline-none transition placeholder:text-[#9AA6C7] focus:border-[#011C60] focus:bg-white";

export const TEXTAREA_CLASS_NAME =
  "w-full rounded-2xl border border-[#F3F4F7] bg-[#F3F4F7] px-4 py-3 font-['Roboto'] text-[15px] leading-6 text-[#011C60] outline-none transition placeholder:text-[#9AA6C7] focus:border-[#011C60] focus:bg-white";

export const SELECT_CLASS_NAME =
  "h-12 w-full appearance-none rounded-2xl border border-[#F3F4F7] bg-[#F3F4F7] px-4 pr-11 font-['Roboto'] text-[15px] leading-6 text-[#011C60] outline-none transition focus:border-[#011C60] focus:bg-white";

export const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

export function SectionHeading({ title, description }) {
  return (
    <div>
      <h2 className="font-['Roboto'] text-[28px] font-semibold leading-[40px] text-[#011C60] sm:text-[32px] sm:leading-[48px]">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
        {description}
      </p>
    </div>
  );
}

export function ProgressStepper({ currentStep }) {
  return (
    <div className="w-full" aria-label="Become a partner progress">
      <div className="grid grid-cols-5 gap-2">
        {FLOW_STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isComplete = currentStep > step.id;

          return (
            <div key={step.id} className="min-w-0 text-center">
              <div
                className={joinClasses(
                  "mx-auto flex h-9 w-9 items-center justify-center rounded-full border text-[13px] font-semibold transition",
                  isActive || isComplete
                    ? "border-[#011C60] bg-[#011C60] text-white"
                    : "border-[#D7DDED] bg-white text-[#9AA6C7]"
                )}
              >
                {step.id}
              </div>
              <p
                className={joinClasses(
                  "mt-2 truncate font-['Roboto'] text-[11px] font-medium leading-4 sm:text-[12px]",
                  isActive || isComplete ? "text-[#011C60]" : "text-[#9AA6C7]"
                )}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#E6E8EF]">
        <div
          className="h-full rounded-full bg-[#011C60] transition-all duration-300"
          style={{
            width: `${((currentStep - 1) / (FLOW_STEPS.length - 1)) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

export function FlowActions({
  secondaryLabel,
  onSecondary,
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
}) {
  return (
    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onSecondary}
        className="min-h-12 min-w-[150px] cursor-pointer rounded-2xl border border-[#011C60] bg-white px-6 py-3 font-['Roboto'] text-[16px] font-semibold leading-6 text-[#011C60] transition hover:bg-[#F5F7FC]"
      >
        {secondaryLabel}
      </button>

      <button
        type="button"
        onClick={onPrimary}
        disabled={primaryDisabled}
        className={joinClasses(
          "min-h-12 min-w-[190px] rounded-2xl px-8 py-3 font-['Roboto'] text-[16px] font-semibold leading-6 text-white transition",
          primaryDisabled
            ? "cursor-not-allowed bg-[#B2BBD2]"
            : "cursor-pointer bg-[#011C60] hover:bg-[#02267F]"
        )}
      >
        {primaryLabel}
      </button>
    </div>
  );
}

export function FieldLabel({ children }) {
  return (
    <span className="mb-2 block font-['Roboto'] text-[16px] font-medium leading-6 text-[#011C60]">
      {children}
    </span>
  );
}

export function SelectArrow() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9AA6C7]"
      aria-hidden="true"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ModalShell({
  children,
  onClose,
  widthClassName = "max-w-[600px]",
}) {
  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-[#011C60]/45 px-4 py-6">
      <button
        type="button"
        aria-label="Close modal overlay"
        onClick={onClose}
        className="absolute inset-0"
      />
      <div
        className={joinClasses(
          "relative z-[1] w-full rounded-2xl border border-[#E6E8EF] bg-white p-6 shadow-[0px_24px_60px_rgba(1,28,96,0.18)]",
          widthClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function CheckIcon({ className = "h-4 w-4", stroke = "white" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5 10.5L8.2 13.5L15 6.5"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon({ className = "h-5 w-5", stroke = "#011C60" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 4V16"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 10H16"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BriefcaseIcon({ className = "h-5 w-5", stroke = "#011C60" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="7.5"
        width="17"
        height="12"
        rx="2.5"
        stroke={stroke}
        strokeWidth="1.8"
      />
      <path
        d="M9 7V6C9 4.9 9.9 4 11 4H13C14.1 4 15 4.9 15 6V7"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M3.5 12H20.5" stroke={stroke} strokeWidth="1.8" />
    </svg>
  );
}

export function PackageIcon({ className = "h-5 w-5", stroke = "#011C60" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 3L20 7V17L12 21L4 17V7L12 3Z"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M4 7L12 11L20 7" stroke={stroke} strokeWidth="1.8" />
      <path d="M12 11V21" stroke={stroke} strokeWidth="1.8" />
    </svg>
  );
}

export function ClockIcon({ className = "h-5 w-5", stroke = "#011C60" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" stroke={stroke} strokeWidth="1.8" />
      <path
        d="M12 7.5V12L15 14"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
