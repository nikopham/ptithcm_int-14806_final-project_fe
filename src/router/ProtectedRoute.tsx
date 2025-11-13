import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { Role } from "./role";

interface Props {
  allow: Role[];
}

export const ProtectedRoute = ({ allow }: Props) => {
  const { isAuth, roles } = useAppSelector((s) => s.auth);
  
  
  if (!isAuth) return <Navigate to="/login" replace />;
  const ok = allow.some((r) => roles.includes(r));
  return ok ? <Outlet /> : <Navigate to="/403" replace />;
};
