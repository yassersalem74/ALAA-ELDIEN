import { useEffect, useRef, useState } from "react";

const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

export const formatReviewCount = (value) =>
  new Intl.NumberFormat("en-US").format(value || 0);

export const formatCurrency = (value) =>
  `${new Intl.NumberFormat("en-US").format(value || 0)} EGP`;

export const formatBookingDate = (value) => {
  if (!value) return "";

  const [year, month, day] = value.split("-").map(Number);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
};

export const getTodayInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export function ArrowLeftIcon({ className = "h-6 w-6", stroke = "white" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M14.5 6.5L9 12L14.5 17.5"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowRightIcon({ className = "h-4 w-4", stroke = "#011C60" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M9.5 6.5L15 12L9.5 17.5"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SearchIcon({ className = "h-[27px] w-[27px]" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="11" cy="11" r="6.5" stroke="#EECE42" strokeWidth="2" />
      <path
        d="M16 16L20 20"
        stroke="#EECE42"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StarIcon({ className = "h-4 w-4", fill = "#EECE42" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 3.75L14.64 9.11L20.56 9.97L16.28 14.14L17.29 20.03L12 17.25L6.71 20.03L7.72 14.14L3.44 9.97L9.36 9.11L12 3.75Z"
        fill={fill}
      />
    </svg>
  );
}

export function LocationIcon({ className = "h-4 w-4", stroke = "#808DAF" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 13.5C13.6569 13.5 15 12.1569 15 10.5C15 8.84315 13.6569 7.5 12 7.5C10.3431 7.5 9 8.84315 9 10.5C9 12.1569 10.3431 13.5 12 13.5Z"
        stroke={stroke}
        strokeWidth="1.8"
      />
      <path
        d="M19.5 10.5C19.5 16.5 12 21 12 21C12 21 4.5 16.5 4.5 10.5C4.5 6.36 7.86 3 12 3C16.14 3 19.5 6.36 19.5 10.5Z"
        stroke={stroke}
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function CalendarIcon({ className = "h-5 w-5", stroke = "#011C60" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M8 2.75V6"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M16 2.75V6"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect
        x="3.5"
        y="4.5"
        width="17"
        height="16"
        rx="2.5"
        stroke={stroke}
        strokeWidth="1.8"
      />
      <path d="M3.5 9H20.5" stroke={stroke} strokeWidth="1.8" />
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

export function ChevronDownIcon({
  className = "h-5 w-5",
  stroke = "#808DAF",
  isOpen = false,
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={joinClasses(
        className,
        "transition-transform duration-200",
        isOpen ? "rotate-180" : ""
      )}
    >
      <path
        d="M6.5 9.5L12 15L17.5 9.5"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BackCircleButton({ onClick, size = "default" }) {
  const dimensions =
    size === "large" ? "h-[72px] w-[72px]" : "h-[66px] w-[66px]";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Go back"
      className={joinClasses(
        "flex items-center justify-center rounded-full bg-[#B3BBCF] shadow-[0px_12px_24px_rgba(179,187,207,0.3)] transition hover:-translate-y-0.5 hover:bg-[#9ea8bf] cursor-pointer",
        dimensions
      )}
    >
      <ArrowLeftIcon className="h-7 w-7" />
    </button>
  );
}

export function ServicePageIntro({ title, description }) {
  return (
    <div className="mx-auto max-w-[860px] text-center">
      <h1 className="font-['Roboto'] text-[28px] font-semibold leading-[40px] text-[#011C60] sm:text-[36px] sm:leading-[56px]">
        {title}
      </h1>
      <p className="mt-3 font-['Roboto'] text-[18px] font-medium leading-[30px] text-[#808DAF] sm:text-[24px] sm:leading-[40px]">
        {description}
      </p>
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search what are you looking for",
  className = "",
  size = "regular",
}) {
  const isCompact = size === "compact";

  return (
    <label
      className={joinClasses(
        "flex w-full items-center gap-4 rounded-2xl border border-[#D8DDEB] bg-white px-6 shadow-[8px_4px_16px_0px_rgba(226,232,243,0.5)] transition hover:border-[#EECE42] hover:shadow-[0px_12px_28px_rgba(204,210,223,0.45)] focus-within:border-[#EECE42]",
        isCompact ? "h-12" : "h-16",
        className
      )}
    >
      <SearchIcon className={isCompact ? "h-5 w-5" : "h-[27px] w-[27px]"} />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={joinClasses(
          "min-w-0 flex-1 bg-transparent font-['Roboto'] text-[#011C60] outline-none placeholder:text-[#B3BBCF]",
          isCompact
            ? "text-[14px] sm:text-[16px]"
            : "text-[18px] sm:text-[24px] sm:leading-[40px]"
        )}
      />
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EECE42]">
        <ArrowRightIcon className="h-4 w-4" stroke="#011C60" />
      </span>
    </label>
  );
}

export function CreativeDropdown({
  label,
  value,
  options,
  onChange,
  placeholder,
  leading,
  className = "",
  menuClassName = "",
  renderValue,
  renderOption,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const selectedOption = options.find(
    (option) => String(option.value) === String(value)
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (rootRef.current?.contains(event.target)) return;
      setIsOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className={joinClasses("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={joinClasses(
          "flex h-12 w-full items-center justify-between gap-4 rounded-[14px] border border-[#D8DDEB] bg-white px-4 shadow-[8px_4px_16px_0px_rgba(226,232,243,0.5)] transition hover:-translate-y-0.5 hover:border-[#EECE42] hover:shadow-[0px_12px_28px_rgba(204,210,223,0.45)]",
          isOpen ? "border-[#EECE42]" : ""
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex min-w-0 items-center gap-3">
          {leading && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F8F9FC] text-[#011C60] shadow-[0px_6px_16px_rgba(204,210,223,0.35)]">
              {leading}
            </span>
          )}

          <div className="min-w-0 text-left">
            <p className="font-['Roboto'] text-[11px] font-medium uppercase tracking-[0.08em] text-[#808DAF]">
              {label}
            </p>
            <div className="truncate font-['Roboto'] text-[14px] font-semibold text-[#011C60]">
              {selectedOption
                ? renderValue
                  ? renderValue(selectedOption)
                  : selectedOption.label
                : placeholder}
            </div>
          </div>
        </div>

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F8F9FC]">
          <ChevronDownIcon
            stroke={isOpen ? "#011C60" : "#808DAF"}
            isOpen={isOpen}
          />
        </span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={joinClasses(
            "absolute left-0 top-[calc(100%+12px)] z-30 w-full rounded-[20px] border border-[#E6E8EF] bg-white p-3 shadow-[0px_20px_48px_rgba(1,28,96,0.14)]",
            menuClassName
          )}
        >
          <div className="max-h-72 overflow-y-auto">
            {options.map((option) => {
              const isSelected =
                String(option.value) === String(selectedOption?.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={joinClasses(
                    "flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-3 text-left transition",
                    isSelected
                      ? "bg-[#FFF4C4] text-[#011C60]"
                      : "text-[#011C60] hover:bg-[#F5F7FC]"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    {renderOption ? renderOption(option, isSelected) : option.label}
                  </div>

                  {isSelected && (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EECE42]">
                      <ArrowRightIcon className="h-4 w-4" stroke="#011C60" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function CallyDatePicker({
  value,
  min,
  onChange,
  className = "",
}) {
  const calendarRef = useRef(null);

  useEffect(() => {
    const calendar = calendarRef.current;

    if (!calendar) return undefined;

    const handleChange = () => {
      onChange(calendar.value || "");
    };

    calendar.addEventListener("change", handleChange);

    return () => {
      calendar.removeEventListener("change", handleChange);
    };
  }, [onChange]);

  useEffect(() => {
    const calendar = calendarRef.current;

    if (calendar && calendar.value !== value) {
      calendar.value = value || "";
    }
  }, [value]);

  return (
    <div
      className={joinClasses(
        "rounded-[28px] bg-[linear-gradient(180deg,rgba(238,206,66,0.14)_0%,rgba(230,232,239,0.34)_100%)] p-[1px]",
        className
      )}
    >
      <calendar-date
        ref={calendarRef}
        className="service-cally block rounded-[27px] bg-white p-4"
        value={value}
        min={min}
        locale="en-GB"
        first-day-of-week="6"
        format-weekday="short"
        show-outside-days=""
      >
        <svg
          aria-label="Previous"
          className="h-4 w-4 fill-none stroke-current"
          slot="previous"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path
            d="M15.75 19.5L8.25 12L15.75 4.5"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <svg
          aria-label="Next"
          className="h-4 w-4 fill-none stroke-current"
          slot="next"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path
            d="M8.25 19.5L15.75 12L8.25 4.5"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <calendar-month className="service-cally-month"></calendar-month>
      </calendar-date>
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="rounded-[24px] border border-dashed border-[#CCD2DF] bg-white px-6 py-12 text-center shadow-[0px_8px_24px_rgba(204,210,223,0.22)]">
      <h3 className="font-['Roboto'] text-[22px] font-semibold leading-8 text-[#011C60]">
        {title}
      </h3>
      <p className="mt-3 font-['Roboto'] text-[16px] leading-6 text-[#808DAF]">
        {description}
      </p>
    </div>
  );
}

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-xl border border-[#CCD2DF] px-4 py-2 font-['Roboto'] text-sm font-medium text-[#011C60] transition hover:bg-[#F5F7FC] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Prev
      </button>

      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
        (pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            className={joinClasses(
              "h-10 min-w-10 rounded-xl px-3 font-['Roboto'] text-sm font-semibold transition",
              currentPage === pageNumber
                ? "bg-[#011C60] text-white"
                : "border border-[#CCD2DF] bg-white text-[#011C60] hover:bg-[#F5F7FC]"
            )}
          >
            {pageNumber}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-xl border border-[#CCD2DF] px-4 py-2 font-['Roboto'] text-sm font-medium text-[#011C60] transition hover:bg-[#F5F7FC] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
