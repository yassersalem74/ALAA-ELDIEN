import { PROFILE_PERSONAL_INFO_FIELDS } from "../profileData";

const inputClassName =
  "mt-3 h-12 w-full rounded-2xl border border-[#E6E8EF] bg-[#F3F4F7] px-4 font-['Roboto'] text-[16px] leading-6 text-[#011C60] outline-none transition placeholder:text-[#808DAF] focus:border-[#011C60] focus:bg-white";

export default function ProfilePersonalInfoSection({
  profile,
  hasChanges,
  onFieldChange,
  onCancel,
  onSave,
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSave();
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[24px] border border-[#E6E8EF] bg-white p-4 shadow-[0px_12px_40px_rgba(17,27,71,0.08)] sm:p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div>
            <h2 className="font-['Roboto'] text-[24px] font-semibold leading-10 text-[#011C60]">
              Personal Info
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {PROFILE_PERSONAL_INFO_FIELDS.map((field) => (
              <label
                key={field.name}
                className={field.fullWidth ? "sm:col-span-2" : ""}
              >
                <span className="font-['Roboto'] text-[18px] font-semibold leading-6 text-[#011C60] sm:text-[20px]">
                  {field.label}
                </span>
                <input
                  type={field.type}
                  autoComplete={field.autoComplete}
                  value={profile[field.name] || ""}
                  placeholder={field.placeholder}
                  onChange={(event) =>
                    onFieldChange(field.name, event.target.value)
                  }
                  className={inputClassName}
                />
              </label>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="min-h-12 min-w-[235px] cursor-pointer rounded-2xl border border-[#011C60] bg-white px-8 py-3 font-['Roboto'] text-[16px] font-semibold leading-6 text-[#011C60] transition hover:bg-[#F5F7FC]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`min-h-12 min-w-[235px] rounded-2xl px-8 py-3 font-['Roboto'] text-[16px] font-semibold leading-6 text-white transition ${
                hasChanges
                  ? "cursor-pointer bg-[#011C60] hover:bg-[#02267F]"
                  : "cursor-not-allowed bg-[#A0AACE]"
              }`}
              disabled={!hasChanges}
            >
              Save Changes
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[24px] border border-[#DC2626] bg-[#FFDAD61A] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-['Roboto'] text-[20px] font-semibold leading-6 text-[#DC2626]">
              Danger Zone
            </h3>
            <p className="mt-3 max-w-2xl font-['Roboto'] text-[16px] leading-6 text-[#808DAF]">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
          </div>

          <button
            type="button"
            className="min-h-12 min-w-[177px] rounded-2xl border border-[#BA1A1A33] bg-white px-6 py-3 font-['Roboto'] text-[16px] font-semibold leading-6 text-[#DC2626]"
          >
            Delete Account
          </button>
        </div>
      </section>
    </div>
  );
}
