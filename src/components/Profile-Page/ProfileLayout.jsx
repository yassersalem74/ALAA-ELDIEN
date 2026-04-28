import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import ProfileSidebar from "./ProfileSidebar";
import {
  createProfileDetails,
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

export default function ProfileLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [savedProfile, setSavedProfile] = useState(() =>
    createProfileDetails(user)
  );
  const [draftProfile, setDraftProfile] = useState(() =>
    createProfileDetails(user)
  );
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    const nextProfile = createProfileDetails(user);

    setSavedProfile(nextProfile);
    setDraftProfile(nextProfile);
  }, [user]);

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

  return (
    <section className="min-h-screen bg-[#F8F9FC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full  lg:grid-cols-[320px_minmax(0,1fr)]">
        <ProfileSidebar onLogout={requestLogout} />

        <div className="flex min-w-0 flex-col gap-6 bg-white p-6 rounded-r-2xl">
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

      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />
    </section>
  );
}
