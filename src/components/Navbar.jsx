import { NavLink } from "react-router-dom";

export default function Navbar() {
  const baseText =
    "font-['Roboto'] font-medium text-[16px] lg:text-[20px] whitespace-nowrap";

  const navLink = ({ isActive }) =>
    `${baseText} px-4 py-2 rounded-xl transition ${
      isActive
        ? "text-[#011C60] bg-[#E6E8EF]"
        : "text-[#808DAF] hover:text-[#011C60] hover:bg-[#E6E8EF]"
    }`;

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

              <li><NavLink to="/login" className={navLink}>Login</NavLink></li>
              <li><NavLink to="/signup" className={navLink}>Signup</NavLink></li>
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

          {/* User Dropdown */}
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              aria-label="User menu"
              className="cursor-pointer"
            >
              <img
                src="/user.png"
                alt="User profile"
                className="w-10 h-10 rounded-full object-cover"
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

        </div>
      </div>
    </header>
  );
}