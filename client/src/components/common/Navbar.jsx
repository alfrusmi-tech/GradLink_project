import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const dashboardPath =
    user?.role === "admin"
      ? "/admin/dashboard"
      : user?.role === "recruiter"
      ? "/recruiter/dashboard"
      : "/jobseeker/dashboard";

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-800">
      <Link to="/" className="text-xl font-bold text-brand-600">
        GradLink
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/jobs" className="hover:text-brand-600">
          Jobs
        </Link>
        <Link to="/about" className="hover:text-brand-600">
          About
        </Link>
        {user ? (
          <>
            <Link to={dashboardPath} className="hover:text-brand-600">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="rounded bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-brand-600">
              Login
            </Link>
            <Link
              to="/register"
              className="rounded bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
