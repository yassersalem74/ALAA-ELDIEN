export default function DeleteConfirmModal({
  isOpen,
  itemType,
  itemName,
  onCancel,
  onConfirm,
}) {
  if (!isOpen) return null;

  const readableType = itemType === "package" ? "package" : "service";

  return (
    <div className="fixed inset-0 z-[230] flex items-center justify-center bg-[#011C60]/45 px-4 py-6">
      <button
        type="button"
        aria-label="Cancel delete"
        onClick={onCancel}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-[1] w-full max-w-[440px] rounded-[24px] border border-[#FFE2E2] bg-white p-6 text-center shadow-[0px_24px_60px_rgba(1,28,96,0.2)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF0F0]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-8 w-8 text-[#DC2626]"
            aria-hidden="true"
          >
            <path
              d="M5 6.5H19M9 6.5V5C9 4.45 9.45 4 10 4H14C14.55 4 15 4.45 15 5V6.5M8 9.5V17M12 9.5V17M16 9.5V17M7 6.5L7.8 20H16.2L17 6.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 className="mt-5 font-['Roboto'] text-[26px] font-semibold leading-9 text-[#011C60]">
          Delete {readableType}?
        </h2>

        <p className="mt-2 font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[#011C60]">
            {itemName || `this ${readableType}`}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-12 cursor-pointer rounded-2xl border border-[#BEC6DE] bg-white px-4 font-['Roboto'] text-[16px] font-semibold text-[#011C60] transition hover:bg-[#F3F4F7]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-12 cursor-pointer rounded-2xl bg-[#DC2626] px-4 font-['Roboto'] text-[16px] font-semibold text-white transition hover:bg-[#B91C1C]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
