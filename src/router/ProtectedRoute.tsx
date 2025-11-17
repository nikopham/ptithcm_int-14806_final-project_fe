import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { Loader2 } from "lucide-react";
import { LoadingPage } from "@/pages/public/LoadingPage";

interface Props {
  allow: string[];
}

export const ProtectedRoute = ({ allow }: Props) => {
  const { isAuth, roles, status } = useAppSelector((s) => s.auth);
  const token = localStorage.getItem("accessToken");

  if (status === "loading" || (status === "idle" && token)) {
    return <LoadingPage />;
  }

  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  const ok = allow.some((r) => roles.includes(r));
  return ok ? <Outlet /> : <Navigate to="/403" replace />;
};
