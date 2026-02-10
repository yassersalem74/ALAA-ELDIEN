import { NavLink } from "react-router-dom";

export default function Navbar() {
  // ===== Typography =====
  const baseText =
    "font-['Roboto'] font-medium text-[16px] lg:text-[20px] whitespace-nowrap";

  // ===== Desktop + Mobile Link Style =====
  const navLink = ({ isActive }) =>
    `${baseText} px-4 py-2 rounded-xl transition ${
      isActive
        ? "text-[#011C60] bg-[#E6E8EF]"
        : "text-[#808DAF] hover:text-[#011C60] hover:bg-[#E6E8EF]"
    }`;

  return (
    <header className="sticky top-0 z-50">
      <div className="navbar bg-white shadow-[0px_4px_16px_#BEC6DE80] px-4 lg:px-8">
        {/* ===== LEFT ===== */}
        <div className="navbar-start">
          {/* Mobile Burger */}
          <div className="dropdown">
            <label
              tabIndex={0}
              className="btn btn-ghost lg:hidden text-2xl text-[#011C60] hover:text-white"
            >
              ☰
            </label>

            {/* ===== MOBILE MENU ===== */}
            <ul
              tabIndex={0}
              className="
                menu menu-sm dropdown-content
                mt-3 z-[100]
                p-3 shadow bg-white
                rounded-box w-64 gap-2
              "
            >
              <li>
                <NavLink to="/" className={navLink}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/services" className={navLink}>
                  Services
                </NavLink>
              </li>
              <li>
                <NavLink to="/marketplace" className={navLink}>
                  Marketplace
                </NavLink>
              </li>
              <li>
                <NavLink to="/store" className={navLink}>
                  Store
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" className={navLink}>
                  Contact us
                </NavLink>
              </li>

              <div className="divider my-1" />

              {/* About */}
              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `
                    ${baseText}
                    border border-[#011C60]
                    px-4 py-2 rounded-xl
                    transition
                    ${
                      isActive
                        ? "text-[#011C60] bg-[#E6E8EF]"
                        : "text-[#011C60] hover:bg-[#E6E8EF]"
                    }
                    `
                  }
                >
                  About Alaa Eldin
                </NavLink>
              </li>

              {/* Overview */}
              <li>
                <NavLink
                  to="/overview"
                  className={({ isActive }) =>
                    `
                    ${baseText}
                    px-4 py-2 rounded-xl
                    transition
                    ${
                      isActive
                        ? "text-[#011C60] bg-[#E6E8EF]"
                        : "text-[#011C60] hover:bg-[#E6E8EF]"
                    }
                    `
                  }
                >
                  Overview
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Logo (hidden on small) */}
          <NavLink to="/" className="hidden md:block">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-12 lg:h-14 object-contain"
            />
          </NavLink>
        </div>

        {/* ===== CENTER (Desktop) ===== */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-2">
            <li>
              <NavLink to="/" className={navLink}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/services" className={navLink}>
                Services
              </NavLink>
            </li>
            <li>
              <NavLink to="/marketplace" className={navLink}>
                Marketplace
              </NavLink>
            </li>
            <li>
              <NavLink to="/store" className={navLink}>
                Store
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className={navLink}>
                Contact us
              </NavLink>
            </li>
          </ul>
        </div>

        {/* ===== RIGHT ===== */}
        <div className="navbar-end gap-3">
          {/* About Button */}
          <NavLink
            to="/about"
            className={`
              ${baseText}
              border border-[#011C60]
              text-[#011C60]
              px-5 py-2 rounded-xl
              hover:bg-[#E6E8EF]
            `}
          >
            About Alaa Eldin
          </NavLink>

          {/* Overview */}
          <NavLink
            to="/overview"
            className={`
              ${baseText}
              text-[#011C60]
              px-4 py-2 rounded-xl
              hover:bg-[#E6E8EF]
            `}
          >
            Overview
          </NavLink>
        </div>
      </div>
    </header>
  );
}
