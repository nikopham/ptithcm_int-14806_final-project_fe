// import { Navigate, Outlet } from "react-router-dom";
// import { useAppSelector } from "@/app/hooks";
// import { Loader2 } from "lucide-react";
// import { LoadingPage } from "@/pages/public/LoadingPage";

// interface Props {
//   allow: string[];
// }

// export const ProtectedRoute = ({ allow }: Props) => {
//   const { isAuth, roles, status } = useAppSelector((s) => s.auth);
//   const token = localStorage.getItem("accessToken");

//   if (status === "loading" || (status === "idle" && token)) {
//     return <LoadingPage />;
//   }

//   if (!isAuth) {
//     return <Navigate to="/" replace />;
//   }

//   const ok = allow.some((r) => roles.includes(r));
//   return ok ? <Outlet /> : <Navigate to="/403" replace />;
// };
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { LoadingPage } from "@/pages/public/LoadingPage";
import { Role } from "./role";
import { GlobalConstant } from "@/constants/GlobalConstant";

interface Props {
  allow: string[];
}

/**
 * Helper function để normalize role value từ format GlobalConstant sang Role enum
 * Ví dụ: "viewer" -> Role.VIEWER ("ROLE_VIEWER"), "super_admin" -> Role.SUPER_ADMIN ("ROLE_SUPER_ADMIN")
 */
const normalizeRole = (role: string): Role => {
  // Map từ GlobalConstant format sang Role enum
  // GlobalConstant.VIEWER = "viewer" -> Role.VIEWER = "ROLE_VIEWER"
  // GlobalConstant.ROLE_VIEWER = "ROLE_VIEWER" -> Role.VIEWER = "ROLE_VIEWER"
  
  if (role === GlobalConstant.VIEWER || role === GlobalConstant.ROLE_VIEWER) {
    return Role.VIEWER;
  }
  if (role === GlobalConstant.SUPER_ADMIN || role === GlobalConstant.ROLE_SUPER_ADMIN) {
    return Role.SUPER_ADMIN;
  }
  if (role === GlobalConstant.MOVIE_ADMIN || role === GlobalConstant.ROLE_MOVIE_ADMIN) {
    return Role.MOVIE_ADMIN;
  }
  if (role === GlobalConstant.COMMENT_ADMIN || role === GlobalConstant.ROLE_COMMENT_ADMIN) {
    return Role.COMMENT_ADMIN;
  }
  // Nếu role đã là Role enum value (ví dụ: "ROLE_VIEWER"), thử tìm trong enum
  const roleValues = Object.values(Role) as string[];
  if (roleValues.includes(role)) {
    return role as unknown as Role;
  }
  // Nếu không khớp, throw error hoặc return default
  console.warn(`Unknown role: ${role}, defaulting to VIEWER`);
  return Role.VIEWER; // Fallback to VIEWER
};

export const ProtectedRoute = ({ allow }: Props) => {
  const { isAuth, roles, status } = useAppSelector((s) => s.auth);
  const location = useLocation();
  console.log(roles);
  
  if (status === "idle" || status === "loading") {
    return <LoadingPage />;
  }
  if (!isAuth) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allow.length === 0) {
    return <Outlet />;
  }

  const normalizedAllow = allow.map(normalizeRole);
  
  const hasPermission = normalizedAllow.some((allowedRole) =>
    roles.includes(allowedRole)
  );

  return hasPermission ? <Outlet /> : <Navigate to="/403" replace />;
};