const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

function BackArrowIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M14.5 6.5L9 12L14.5 17.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FlowBackButton({
  onClick,
  label = "Back",
  ariaLabel,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel || label}
      className={joinClasses(
        "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-[#D7DDED] bg-white px-2.5 pr-4 font-['Roboto'] text-[14px] font-semibold leading-5 text-[#011C60] shadow-[0px_10px_24px_rgba(17,27,71,0.08)] transition hover:-translate-y-0.5 hover:border-[#011C60] hover:bg-[#F8F9FC] hover:shadow-[0px_14px_30px_rgba(17,27,71,0.12)] focus:outline-none focus:ring-2 focus:ring-[#011C60]/20",
        className
      )}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#011C60] text-white shadow-[0px_8px_18px_rgba(1,28,96,0.22)]">
        <BackArrowIcon />
      </span>
      <span>{label}</span>
    </button>
  );
}
