
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { LoadingPage } from "@/pages/public/LoadingPage";
import { Role } from "./role";
import { GlobalConstant } from "@/constants/GlobalConstant";

interface Props {
  allow: string[];
}


const normalizeRole = (role: string): Role => {

  
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

  const roleValues = Object.values(Role) as string[];
  if (roleValues.includes(role)) {
    return role as unknown as Role;
  }

  console.warn(`Unknown role: ${role}, defaulting to VIEWER`);
  return Role.VIEWER; 
};

export const ProtectedRoute = ({ allow }: Props) => {
  const { isAuth, roles, status } = useAppSelector((s) => s.auth);
  const location = useLocation();
  

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