import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        role="status"
        className="flex min-h-[60vh] items-center justify-center bg-[#fbf8f5] text-sm text-[#6f6472]"
      >
        Checking your account...
      </div>
    );
  }

  // A visitor must log in first.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // A logged-in user must have one of the permitted roles.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;