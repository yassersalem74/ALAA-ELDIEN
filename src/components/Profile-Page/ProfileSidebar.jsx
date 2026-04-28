import { NavLink } from "react-router-dom";
import ProfileNavIcon from "./ProfileNavIcon";
import { PROFILE_NAV_ITEMS } from "./profileData";

const navItemClassName = ({ isActive }) =>
  `flex items-center gap-3 rounded-2xl px-4 py-3 text-left font-['Roboto'] text-[18px] font-semibold leading-6 transition sm:text-[20px] ${
    isActive
      ? "bg-white text-[#011C60] shadow-[0px_12px_30px_rgba(17,27,71,0.08)]"
      : "text-[#6777A0] hover:bg-white/80 hover:text-[#011C60]"
  }`;

export default function ProfileSidebar({ onLogout }) {
  return (
    <aside className="rounded-l-2xl bg-[#F3F4F7] px-4 py-6 sm:px-6 lg:sticky lg:top-24 lg:min-h-[720px] lg:self-start lg:px-6 lg:py-12">
      <nav className="flex flex-col gap-2">
        {PROFILE_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.slug}
            to={`/profile/${item.slug}`}
            className={navItemClassName}
          >
            <ProfileNavIcon name={item.icon} className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 border-t border-[#E1E5F0] pt-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-left font-['Roboto'] text-[18px] font-semibold leading-6 text-[#DC2626] transition hover:bg-white hover:shadow-[0px_12px_30px_rgba(17,27,71,0.08)] sm:text-[20px]"
        >
          <ProfileNavIcon name="logout" className="h-5 w-5 shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
