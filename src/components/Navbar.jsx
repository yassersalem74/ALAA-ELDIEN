import { NavLink } from "react-router-dom";

export default function Navbar() {
  // ===== Typography =====
  const baseText =
    "font-['Roboto'] font-medium text-[16px] lg:text-[24px] leading-[24px] lg:leading-[40px] text-center whitespace-nowrap";

  // ===== Link Style =====
  const linkClass = ({ isActive }) =>
    `${baseText} px-3 py-2 rounded-xl transition-all duration-200 ${
      isActive
        ? "text-[#011C60] bg-[#E6E8EF]"
        : "text-[#808DAF] hover:text-[#011C60] hover:bg-[#E6E8EF]"
    }`;

  return (
    <header className="sticky top-0 z-50">
      <nav
        className="
          navbar bg-white
          shadow-[0px_4px_16px_0px_#BEC6DE80]
          px-4 md:px-8
        "
        aria-label="Main Navigation"
      >
        {/* ===== Left ===== */}
        <div className="navbar-start">
          {/* Burger (< md) */}
          <div className="dropdown">
            <label
              tabIndex={0}
              className="btn btn-ghost md:hidden text-[#011C60] text-2xl"
            >
              ☰
            </label>

            {/* Mobile Menu */}
            <ul
              tabIndex={0}
              className="
                menu menu-sm dropdown-content
                mt-3 p-4 shadow bg-white
                rounded-box w-64 gap-2 z-[100]
              "
            >
              <li><NavLink to="/" className={linkClass}>Home</NavLink></li>
              <li><NavLink to="/services" className={linkClass}>Services</NavLink></li>
              <li><NavLink to="/marketplace" className={linkClass}>Marketplace</NavLink></li>
              <li><NavLink to="/store" className={linkClass}>Store</NavLink></li>
              <li><NavLink to="/contact" className={linkClass}>Contact us</NavLink></li>

              <div className="divider" />

              <li>
                <NavLink
                  to="/about"
                  className={`${baseText} border border-[#011C60] text-[#011C60] rounded-xl px-3 py-2 hover:bg-[#E6E8EF]`}
                >
                  About Alaa Eldin
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/overview"
                  className={`${baseText} text-[#011C60] px-3 py-2 hover:bg-[#E6E8EF] rounded-xl`}
                >
                  Overview
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Logo */}
          <NavLink to="/" className="ml-2">
            <img
              src="/logo.png"
              alt="Alaa Eldin Logo"
              className="h-10 lg:h-14 object-contain"
            />
          </NavLink>
        </div>

        {/* ===== Center (>= md) ===== */}
        <div className="navbar-center hidden md:flex">
          <ul className="menu menu-horizontal gap-4 lg:gap-6">
            <li><NavLink to="/" className={linkClass}>Home</NavLink></li>
            <li><NavLink to="/services" className={linkClass}>Services</NavLink></li>
            <li><NavLink to="/marketplace" className={linkClass}>Marketplace</NavLink></li>
            <li><NavLink to="/store" className={linkClass}>Store</NavLink></li>
            <li><NavLink to="/contact" className={linkClass}>Contact us</NavLink></li>
          </ul>
        </div>

        {/* ===== Right (>= md) ===== */}
        <div className="navbar-end hidden md:flex gap-3">
          <NavLink
            to="/about"
            className={`
              ${baseText}
              border border-[#011C60] text-[#011C60]
              px-4 py-2 rounded-xl
              hover:bg-[#E6E8EF]
            `}
          >
            About Alaa Eldin
          </NavLink>

          <NavLink
            to="/overview"
            className={`
              ${baseText}
              text-[#011C60]
              hover:bg-[#E6E8EF] rounded-xl px-3 py-2
            `}
          >
            Overview
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
