import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `gradlink-nav-link rounded-lg px-2 py-2 text-sm font-semibold transition-colors duration-200 hover:bg-[#f8e5df] hover:text-[#593a67] ${
      isActive ? "text-[#593a67]" : "text-[#6f6472]"
    }`;

  return (
    <header className="relative z-20 border-b border-[#eadfe8] bg-white gradlink-header">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center px-6 md:px-10">
        <Link
          to="/"
          onClick={closeMenu}
          className="gradlink-logo text-2xl font-extrabold tracking-tight text-[#35253d]"
        >
          GradLink<span className="text-[#593a67]">.</span>
        </Link>

        {/* Desktop navigation */}
        <nav
          className="gradlink-desktop-navigation ml-auto hidden items-center gap-7 md:flex"
          aria-label="Main navigation"
        >
          <NavLink to="/jobs" className={linkClass}>
            Browse Jobs
          </NavLink>

          <NavLink to="/about" className={linkClass}>
            About Us
          </NavLink>

          {user?.role === "jobseeker" && (
            <>
              <NavLink to="/jobseeker/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/applications/history" className={linkClass}>
                Applications
              </NavLink>
              <NavLink to="/upload-cv" className={linkClass}>
                My CV
              </NavLink>
            </>
          )}

          {user?.role === "recruiter" && (
            <>
              <NavLink to="/recruiter/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/recruiter/company" className={linkClass}>
                Company
              </NavLink>
            </>
          )}

          {user?.role === "admin" && (
            <NavLink to="/admin/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
          )}

          {user ? (
            <>
              <NavLink to="/profile" className={linkClass}>
                Profile
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-[#eadfe8] px-4 py-2 text-sm font-semibold text-[#35253d] transition-colors duration-200 hover:border-[#f28c72] hover:bg-[#f8e5df]"
              >
                Log out
              </button>
            </>
          ) : (
            <NavLink to="/login" className={linkClass}>
              Log in
            </NavLink>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className="gradlink-menu-button ml-auto rounded-lg border border-[#eadfe8] px-3 py-2 text-xl transition-colors duration-200 hover:border-[#f28c72] hover:bg-[#f8e5df] md:hidden"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="flex flex-col gap-5 border-t border-[#eadfe8] bg-white px-6 py-6 md:hidden"
          aria-label="Mobile navigation"
        >
          <NavLink to="/jobs" onClick={closeMenu} className={linkClass}>
            Browse Jobs
          </NavLink>

          <NavLink to="/about" onClick={closeMenu} className={linkClass}>
            About Us
          </NavLink>

          {user?.role === "jobseeker" && (
            <>
              <NavLink
                to="/jobseeker/dashboard"
                onClick={closeMenu}
                className={linkClass}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/applications/history"
                onClick={closeMenu}
                className={linkClass}
              >
                Applications
              </NavLink>
              <NavLink
                to="/upload-cv"
                onClick={closeMenu}
                className={linkClass}
              >
                My CV
              </NavLink>
            </>
          )}

          {user?.role === "recruiter" && (
            <>
              <NavLink
                to="/recruiter/dashboard"
                onClick={closeMenu}
                className={linkClass}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/recruiter/company"
                onClick={closeMenu}
                className={linkClass}
              >
                Company
              </NavLink>
            </>
          )}

          {user?.role === "admin" && (
            <NavLink
              to="/admin/dashboard"
              onClick={closeMenu}
              className={linkClass}
            >
              Dashboard
            </NavLink>
          )}

          {user ? (
            <>
              <NavLink
                to="/profile"
                onClick={closeMenu}
                className={linkClass}
              >
                Profile
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="self-start rounded-lg bg-[#35253d] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#593a67]"
              >
                Log out
              </button>
            </>
          ) : (
            <NavLink to="/login" onClick={closeMenu} className={linkClass}>
              Log in
            </NavLink>
          )}
        </nav>
      )}
    </header>
  );
};

export default Navbar;