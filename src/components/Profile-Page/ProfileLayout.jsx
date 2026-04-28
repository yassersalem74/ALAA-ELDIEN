import { useEffect, useState } from "react";
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import ProfileSidebar from "./ProfileSidebar";
import {
  createProfileDetails,
  PROFILE_NAV_ITEMS,
  PROFILE_PERSONAL_INFO_FIELDS,
} from "./profileData";
import ProfileDashboardSection from "./sections/ProfileDashboardSection";
import ProfilePersonalInfoSection from "./sections/ProfilePersonalInfoSection";
import ProfileNotificationsSection from "./sections/ProfileNotificationsSection";
import ProfileChatsSection from "./sections/ProfileChatsSection";
import ProfileCartSection from "./sections/ProfileCartSection";
import ProfileOrdersSection from "./sections/ProfileOrdersSection";
import ProfileBecomeProviderSection from "./sections/ProfileBecomeProviderSection";
import ProfileSettingsSection from "./sections/ProfileSettingsSection";
import LogoutConfirmModal from "../common/LogoutConfirmModal";
import ProfileNavIcon from "./ProfileNavIcon";

const mobileNavItemClassName = ({ isActive }) =>
  `flex items-center gap-3 rounded-2xl px-4 py-3 text-left font-['Roboto'] text-[18px] font-semibold leading-6 transition ${
    isActive
      ? "bg-white text-[#011C60] shadow-[0px_12px_30px_rgba(17,27,71,0.08)]"
      : "text-[#6777A0] hover:bg-white/80 hover:text-[#011C60]"
  }`;

export default function ProfileLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [savedProfile, setSavedProfile] = useState(() =>
    createProfileDetails(user)
  );
  const [draftProfile, setDraftProfile] = useState(() =>
    createProfileDetails(user)
  );
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const nextProfile = createProfileDetails(user);

    setSavedProfile(nextProfile);
    setDraftProfile(nextProfile);
  }, [user]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  const hasChanges = PROFILE_PERSONAL_INFO_FIELDS.some(
    (field) => savedProfile[field.name] !== draftProfile[field.name]
  );

  const stripDerivedProfileFields = (profile) => {
    const { avatarInitial, fullName, welcomeName, ...editableProfile } =
      profile;

    return editableProfile;
  };

  const handleFieldChange = (fieldName, value) => {
    setDraftProfile((currentProfile) =>
      createProfileDetails({
        ...stripDerivedProfileFields(currentProfile),
        [fieldName]: value,
      })
    );
  };

  const handleCancel = () => {
    setDraftProfile(savedProfile);
  };

  const handleSave = () => {
    const nextProfile = createProfileDetails(
      stripDerivedProfileFields(draftProfile)
    );

    setSavedProfile(nextProfile);
    setDraftProfile(nextProfile);
  };

  const requestLogout = () => {
    setIsMobileSidebarOpen(false);
    setIsLogoutConfirmOpen(true);
  };

  const cancelLogout = () => {
    setIsLogoutConfirmOpen(false);
  };

  const confirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const openMobileSidebar = () => {
    setIsMobileSidebarOpen(true);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <section className="min-h-screen bg-[#F8F9FC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full items-start lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <ProfileSidebar onLogout={requestLogout} />
        </div>

        <div className="flex min-w-0 flex-col gap-6 rounded-2xl bg-white p-6 lg:rounded-l-none">
          <div className="lg:hidden">
            <button
              type="button"
              onClick={openMobileSidebar}
              className="inline-flex cursor-pointer items-center gap-3 rounded-2xl border border-[#D7DDED] bg-[#F8F9FC] px-4 py-3 shadow-[0px_10px_30px_rgba(17,27,71,0.08)] transition hover:border-[#011C60] hover:bg-white"
            >
              <span className="flex flex-col gap-1.5" aria-hidden="true">
                <span className="h-0.5 w-6 rounded-full bg-[#011C60]" />
                <span className="h-0.5 w-4 rounded-full bg-[#011C60]" />
                <span className="h-0.5 w-6 rounded-full bg-[#011C60]" />
              </span>
              <span className="font-['Roboto'] text-[16px] font-semibold leading-6 text-[#011C60]">
                Profile Menu
              </span>
            </button>
          </div>

          <header>
            <h1 className="font-['Roboto'] text-[28px] font-bold leading-[42px] text-[#011C60] sm:text-[36px] sm:leading-[56px]">
              Welcome back, {savedProfile.welcomeName}
            </h1>
            <p className="mt-1 max-w-2xl font-['Roboto'] text-[16px] leading-6 text-[#6777A0] sm:text-[18px]">
              Your digital concierge is ready to help you manage your home.
            </p>
          </header>

          <section className="rounded-2xl bg-[#EFF1F7] px-6 py-4 shadow-[0px_12px_40px_rgba(17,27,71,0.06)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-[100px] w-[94px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#011C60] to-[#274697] font-['Roboto'] text-[36px] font-bold text-white shadow-[0px_12px_30px_rgba(1,28,96,0.24)]">
                {savedProfile.avatarInitial}
              </div>

              <div className="min-w-0">
                <h2 className="truncate font-['Roboto'] text-[24px] font-medium leading-10 text-[#011C60]">
                  {savedProfile.fullName}
                </h2>
                <p className="break-all font-['Roboto'] text-[16px] leading-6 text-[#011C60]">
                  {savedProfile.email || "No email available"}
                </p>
              </div>
            </div>
          </section>

          <Routes>
            <Route index element={<Navigate to="personal-info" replace />} />
            <Route path="dashboard" element={<ProfileDashboardSection />} />
            <Route
              path="personal-info"
              element={
                <ProfilePersonalInfoSection
                  profile={draftProfile}
                  hasChanges={hasChanges}
                  onFieldChange={handleFieldChange}
                  onCancel={handleCancel}
                  onSave={handleSave}
                />
              }
            />
            <Route
              path="notifications"
              element={<ProfileNotificationsSection />}
            />
            <Route path="chats" element={<ProfileChatsSection />} />
            <Route path="cart" element={<ProfileCartSection />} />
            <Route path="orders" element={<ProfileOrdersSection />} />
            <Route
              path="become-provider"
              element={<ProfileBecomeProviderSection />}
            />
            <Route path="settings" element={<ProfileSettingsSection />} />
            <Route path="*" element={<Navigate to="personal-info" replace />} />
          </Routes>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[170] lg:hidden ${
          isMobileSidebarOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <button
          type="button"
          aria-label="Close profile menu overlay"
          onClick={closeMobileSidebar}
          className={`absolute inset-0 bg-[#011C60]/30 transition-opacity duration-300 ${
            isMobileSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          className={`absolute left-0 top-0 flex h-full w-[clamp(240px,33vw,360px)] max-w-[85vw] flex-col rounded-r-[28px] bg-[#F3F4F7] shadow-[0px_20px_50px_rgba(17,27,71,0.18)] transition-transform duration-300 ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#DCE2F1] px-4 py-4">
            <div>
              <p className="font-['Roboto'] text-[18px] font-semibold leading-6 text-[#011C60]">
                Profile Menu
              </p>
              <p className="mt-1 font-['Roboto'] text-[13px] leading-5 text-[#6777A0]">
                Quick access to your profile pages
              </p>
            </div>

            <button
              type="button"
              onClick={closeMobileSidebar}
              aria-label="Close profile menu"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#D7DDED] bg-white text-[#011C60] transition hover:border-[#011C60] hover:bg-[#F8F9FC]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5">
            <nav className="flex flex-col gap-2">
              {PROFILE_NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.slug}
                  to={`/profile/${item.slug}`}
                  className={mobileNavItemClassName}
                >
                  <ProfileNavIcon
                    name={item.icon}
                    className="h-5 w-5 shrink-0"
                  />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-6 border-t border-[#DCE2F1] pt-4">
              <button
                type="button"
                onClick={requestLogout}
                className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-left font-['Roboto'] text-[18px] font-semibold leading-6 text-[#DC2626] transition hover:bg-white hover:shadow-[0px_12px_30px_rgba(17,27,71,0.08)]"
              >
                <ProfileNavIcon
                  name="logout"
                  className="h-5 w-5 shrink-0"
                />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />
    </section>
  );
}
