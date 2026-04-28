import { useAuth } from "../context/useAuth";
import {
  getSafeProfileEntries,
  getUserDisplayName,
  getUserEmail,
  getUserInitial,
} from "../utils/auth/userProfile";

const detailClass =
  "rounded-lg border border-[#E6E8EF] bg-white p-4 shadow-[0px_4px_16px_rgba(190,198,222,0.35)]";

export default function ProfilePage() {
  const { accountType, user } = useAuth();
  const displayName = getUserDisplayName(user);
  const email = getUserEmail(user);
  const initial = getUserInitial(user);
  const profileEntries = getSafeProfileEntries(user);
  const summaryItems = [
    ["Account Type", accountType || user?.accountType || "Not provided"],
    ["Email", email || "Not provided"],
    ["Profile Status", user ? "Active" : "No user data"],
  ];

  return (
    <section className="min-h-screen bg-[#E6E8EF] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="rounded-lg bg-white p-5 shadow-[0px_8px_24px_rgba(23,26,30,0.12)] sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#011C60] text-3xl font-bold text-white shadow-[0px_8px_18px_rgba(1,28,96,0.25)]">
                {initial}
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#808DAF]">
                  Profile
                </p>
                <h1 className="mt-1 text-md md:text-2xl font-bold text-[#011C60] sm:text-3xl">
                  {displayName}
                </h1>
                {email && (
                  <p className="mt-1 break-all text-sm text-[#808DAF] sm:text-base">
                    {email}
                  </p>
                )}
              </div>
            </div>

            <div className="inline-flex w-fit rounded-full border border-[#BEC6DE] bg-[#F8F9FC] px-4 py-2 text-sm font-semibold capitalize text-[#011C60]">
              {accountType || user?.accountType || "User"}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className={detailClass}>
            <h2 className="text-xl font-bold text-[#011C60]">Account Overview</h2>
            <div className="mt-5 flex flex-col gap-3">
              {summaryItems.map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 rounded-lg bg-[#F8F9FC] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm font-medium text-[#808DAF]">
                    {label}
                  </span>
                  <span className="break-all text-sm font-semibold text-[#011C60]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={detailClass}>
            <h2 className="text-xl font-bold text-[#011C60]">User Information</h2>
            {profileEntries.length > 0 ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {profileEntries.map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-[#F8F9FC] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#808DAF]">
                      {label}
                    </p>
                    <p className="mt-2 break-words text-sm font-semibold text-[#011C60]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 rounded-lg bg-[#F8F9FC] px-4 py-3 text-sm text-[#808DAF]">
                No profile details are available yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
