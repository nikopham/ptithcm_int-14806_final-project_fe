import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";

const ProtectedRoute = ({ allowedRoles }) => {
  const location = useLocation();
  const roleFallback = {
    customer: "/",
    viewer: "/admin-dashboard/customer-list",
    admin: "/admin-dashboard/dashboard",
    default: "/",
  };
  const { isAuthenticated, user, loading, initialized } = useSelector(
    (s) => s.auth
  );

  
  if (!initialized || loading) {
    return <div className="p-8 text-center">Loading…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const to = roleFallback[user.role] ?? roleFallback.default;
    toast.info("Bạn không có quyền truy cập")
    return <Navigate to={to} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
