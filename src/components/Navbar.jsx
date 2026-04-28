import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  getUserDisplayName,
  getUserEmail,
  getUserInitial,
} from "../utils/auth/userProfile";
import LogoutConfirmModal from "./common/LogoutConfirmModal";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const hasUser = isAuthenticated && Boolean(user);
  const userInitial = getUserInitial(user);
  const userName = getUserDisplayName(user);
  const userEmail = getUserEmail(user);
  const cartItems = [];
  const cartCount = cartItems.reduce(
    (total, item) => total + (Number(item.quantity) || 1),
    0
  );
  const cartSubtotal = cartItems.reduce(
    (total, item) =>
      total + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const cartItemLabel = `${cartCount} ${cartCount === 1 ? "Item" : "Items"}`;

  const baseText =
    "font-['Roboto'] font-medium text-[16px] lg:text-[20px] whitespace-nowrap";

  const navLink = ({ isActive }) =>
    `${baseText} px-4 py-2 rounded-xl transition ${
      isActive
        ? "text-[#011C60] bg-[#E6E8EF]"
        : "text-[#808DAF] hover:text-[#011C60] hover:bg-[#E6E8EF]"
    }`;

  const logoutButton =
    `${baseText} bg-red-600 text-white px-4 py-2 rounded-xl transition hover:bg-red-700 hover:text-white cursor-pointer`;

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
    <header className="sticky top-0 z-50" role="navigation">
      <div className="navbar bg-white shadow-[0px_4px_16px_#BEC6DE80] px-4 lg:px-8">

        {/* ===== LEFT ===== */}
        <div className="navbar-start">

          {/* Mobile Burger */}
          <div className="dropdown">
            <label
              tabIndex={0}
              aria-label="Open menu"
              className="btn btn-ghost lg:hidden text-2xl text-[#011C60]"
            >
              ☰
            </label>

            {/* ===== MOBILE MENU ===== */}
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[100] p-3 shadow bg-white rounded-box w-64 gap-2"
            >
              <li><NavLink to="/" className={navLink}>Home</NavLink></li>
              <li><NavLink to="/services" className={navLink}>Services</NavLink></li>
              <li><NavLink to="/marketplace" className={navLink}>Marketplace</NavLink></li>
              <li><NavLink to="/store" className={navLink}>Store</NavLink></li>
              <li><NavLink to="/contact" className={navLink}>Contact us</NavLink></li>

              <div className="divider my-1" />

              <li><NavLink to="/about" className={navLink}>About Alaa Eldin</NavLink></li>
              <li><NavLink to="/overview" className={navLink}>Overview</NavLink></li>

              <div className="divider my-1" />

              {isAuthenticated ? (
                <>
                  {hasUser && <li><NavLink to="/profile/personal-info" className={navLink}>Profile</NavLink></li>}
                  <li>
                    <button type="button" onClick={requestLogout} className={logoutButton}>
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li><NavLink to="/login" className={navLink}>Login</NavLink></li>
                  <li><NavLink to="/signup" className={navLink}>Signup</NavLink></li>
                </>
              )}
            </ul>
          </div>

          {/* Logo */}
          <NavLink to="/" className="hidden md:block" aria-label="Go to homepage">
            <img
              src="/logo.png"
              alt="Alaa Eldin Logo"
              className="h-12 lg:h-14 object-contain"
            />
          </NavLink>
        </div>

        {/* ===== CENTER ===== */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-2">
            <li><NavLink to="/" className={navLink}>Home</NavLink></li>
            <li><NavLink to="/services" className={navLink}>Services</NavLink></li>
            <li><NavLink to="/marketplace" className={navLink}>Marketplace</NavLink></li>
            <li><NavLink to="/store" className={navLink}>Store</NavLink></li>
            <li><NavLink to="/overview" className={navLink}>Overview</NavLink></li>
            <li><NavLink to="/contact" className={navLink}>Contact us</NavLink></li>
          </ul>
        </div>

        {/* ===== RIGHT ===== */}
        <div className="navbar-end gap-3">

          {/* About → XL only */}
          <NavLink
            to="/about"
            className={`
              ${baseText}
              border border-[#011C60]
              text-[#011C60]
              px-5 py-2 rounded-xl
              hover:bg-[#E6E8EF]
              hidden xl:inline-flex
            `}
          >
            About Alaa Eldin
          </NavLink>

          {hasUser && (
            <div className="dropdown dropdown-end">
              <button
                type="button"
                tabIndex={0}
                aria-label="Open basket"
                className="btn btn-ghost btn-circle text-[#011C60] hover:bg-[#011C60] hover:text-white"
              >
                <div className="indicator">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="badge badge-sm indicator-item bg-white text-[#011C60] border-[#E6E8EF]">
                    {cartCount}
                  </span>
                </div>
              </button>

              <div
                tabIndex={0}
                className="card card-compact dropdown-content bg-white z-[100] mt-3 w-52 shadow-[0px_8px_24px_rgba(23,26,30,0.15)] rounded-lg"
              >
                <div className="card-body gap-3">
                  <span className="text-lg font-bold text-[#171A1E]">
                    {cartItemLabel}
                  </span>
                  <span className="text-info">Subtotal: ${cartSubtotal}</span>
                  <div className="card-actions">
                    <button
                      type="button"
                      onClick={() => navigate("/store")}
                      className="btn btn-block bg-[#011C60] border-[#011C60] text-white hover:bg-[#02237a] hover:border-[#02237a]"
                    >
                      View cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasUser ? (
            <div className="dropdown dropdown-end">
              <button
                type="button"
                tabIndex={0}
                aria-label="Open profile menu"
                className="btn btn-ghost btn-circle avatar placeholder"
              >
                <div className="w-10 flex justify-center items-center rounded-full bg-[#E6E8EF] text-[#011C60] ring-2 ring-[#BEC6DE]">
                  <span className="text-lg font-bold">{userInitial}</span>
                </div>
              </button>

              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-white rounded-lg z-[100] mt-3 w-56 p-2 shadow-[0px_8px_24px_rgba(23,26,30,0.15)] md:w-64 md:text-lg"
              >
                <li className="px-3 py-2">
                  <span className="block p-0 text-sm font-semibold text-[#011C60] hover:bg-transparent md:text-base">
                    {userName}
                  </span>
                  {userEmail && (
                    <span className="block p-0 text-xs text-[#808DAF] hover:bg-transparent md:text-sm">
                      {userEmail}
                    </span>
                  )}
                </li>
                <li>
                  <NavLink to="/profile/personal-info" className="justify-between text-[#011C60] md:text-lg">
                    Profile
                    <span className="badge bg-white text-[#011C60] border-[#E6E8EF]">
                      New
                    </span>
                  </NavLink>
                </li>
                <li>
                  <button type="button" className="text-[#011C60] md:text-lg">
                    Settings
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={requestLogout}
                    className="bg-red-600 text-white hover:bg-red-700 hover:text-white md:text-lg"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : isAuthenticated ? (
            <button type="button" onClick={requestLogout} className={logoutButton}>
              Logout
            </button>
          ) : (
            <div className="dropdown dropdown-end">
              <label
                tabIndex={0}
                aria-label="User menu"
                className="cursor-pointer"
              >
                <img
                  src="/user.png"
                  alt="User profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </label>

              <ul
                tabIndex={0}
                className="menu dropdown-content mt-3 p-3 shadow bg-white rounded-box w-40 z-[100] gap-2"
              >
                <li>
                  <NavLink to="/login" className="text-[#011C60] hover:bg-[#E6E8EF] rounded-lg px-3 py-2">
                    Login
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/signup" className="text-[#011C60] hover:bg-[#E6E8EF] rounded-lg px-3 py-2">
                    Signup
                  </NavLink>
                </li>
              </ul>
            </div>
          )}

        </div>
      </div>

      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />
    </header>
  );
}
