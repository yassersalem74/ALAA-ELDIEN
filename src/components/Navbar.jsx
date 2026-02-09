import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // ===== Typography =====
  const baseText =
    "font-['Roboto'] font-medium text-[16px] lg:text-[24px] leading-[24px] lg:leading-[40px] whitespace-nowrap";

  // ===== NavLink Styles =====
  const linkClass = ({ isActive }) =>
    `${baseText} px-3 py-2 rounded-xl transition ${
      isActive
        ? "text-[#011C60] bg-[#E6E8EF]"
        : "text-[#808DAF] hover:text-[#011C60] hover:bg-[#E6E8EF]"
    }`;

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0px_4px_16px_0px_#BEC6DE80]">
      <nav
        className="max-w-[1400px] mx-auto flex items-center justify-between px-4 md:px-8 h-[70px]"
        aria-label="Main Navigation"
      >
        {/* ===== LEFT (Burger mobile / Logo desktop) ===== */}
        <div className="flex items-center gap-3">
          {/* Burger (mobile) */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-3xl text-[#011C60] cursor-pointer"
            aria-label="Open menu"
          >
            ☰
          </button>

          {/* Desktop Logo */}
          <NavLink to="/" className="hidden md:block">
            <img
              src="/logo.png"
              alt="Alaa Eldin Logo"
              className="h-12 lg:h-14 object-contain"
            />
          </NavLink>
        </div>

        {/* ===== Desktop Menu ===== */}
        <ul className="hidden md:flex items-center gap-3 lg:gap-6">
          <li><NavLink to="/" className={linkClass}>Home</NavLink></li>
          <li><NavLink to="/services" className={linkClass}>Services</NavLink></li>
          <li><NavLink to="/marketplace" className={linkClass}>Marketplace</NavLink></li>
          <li><NavLink to="/store" className={linkClass}>Store</NavLink></li>
          <li><NavLink to="/contact" className={linkClass}>Contact us</NavLink></li>
        </ul>

        {/* ===== RIGHT ===== */}
        <div className="flex items-center gap-3">
          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <NavLink
              to="/about"
              className={`${baseText} border border-[#011C60] text-[#011C60] px-4 py-2 rounded-xl hover:bg-[#E6E8EF]`}
            >
              About Alaa Eldin
            </NavLink>

            <NavLink
              to="/overview"
              className={`${baseText} text-[#011C60] px-3 py-2 rounded-xl hover:bg-[#E6E8EF]`}
            >
              Overview
            </NavLink>
          </div>

          {/* Mobile Logo (right) */}
          <NavLink to="/" className="md:hidden">
            <img
              src="/logo.png"
              alt="Alaa Eldin Logo"
              className="h-10 object-contain"
            />
          </NavLink>
        </div>
      </nav>

      {/* ===== Mobile Drawer (LEFT SIDE) ===== */}
      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={closeMenu}
          />

          {/* Drawer */}
          <aside
            className="
              fixed top-0 left-0 h-full w-[280px]
              bg-white z-50 shadow-xl
              p-6 flex flex-col gap-4
            "
          >
            {/* Close Button */}
            <button
              onClick={closeMenu}
              className="
                text-red-500 hover:text-red-700
                cursor-pointer text-2xl
                self-end transition
              "
              aria-label="Close menu"
            >
              ✕
            </button>

            <NavLink to="/" onClick={closeMenu} className={linkClass}>Home</NavLink>
            <NavLink to="/services" onClick={closeMenu} className={linkClass}>Services</NavLink>
            <NavLink to="/marketplace" onClick={closeMenu} className={linkClass}>Marketplace</NavLink>
            <NavLink to="/store" onClick={closeMenu} className={linkClass}>Store</NavLink>
            <NavLink to="/contact" onClick={closeMenu} className={linkClass}>Contact us</NavLink>

            <hr />

            <NavLink
              to="/about"
              onClick={closeMenu}
              className={`${baseText} border border-[#011C60] text-[#011C60] px-4 py-2 rounded-xl`}
            >
              About Alaa Eldin
            </NavLink>

            <NavLink
              to="/overview"
              onClick={closeMenu}
              className={`${baseText} text-[#011C60] px-3 py-2`}
            >
              Overview
            </NavLink>
          </aside>
        </>
      )}
    </header>
  );
}
