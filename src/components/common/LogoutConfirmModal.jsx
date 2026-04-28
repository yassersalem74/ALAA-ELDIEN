export default function LogoutConfirmModal({
  isOpen,
  onCancel,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-[0px_12px_32px_rgba(23,26,30,0.25)]">
        <h2 className="text-xl font-bold text-[#011C60]">Confirm logout</h2>
        <p className="mt-2 text-sm text-[#808DAF]">
          Are you sure you want to logout?
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-lg border border-[#BEC6DE] px-4 py-2 font-semibold text-[#011C60] transition hover:bg-[#E6E8EF]"
          >
            No
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
