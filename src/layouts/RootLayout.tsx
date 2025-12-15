import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { GlobalErrorModal } from "@/components/common/GlobalErrorModal";
import { GlobalLoadingOverlay } from "@/components/common/GlobalLoadingOverlay";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { RootState } from "@/app/store";
import { useEffect, useState } from "react";
import { verifyAsync } from "@/features/auth/authThunks";
import { ChevronUp } from "lucide-react";

export function RootLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authStatus = useAppSelector((state: RootState) => state.auth.status);
  const location = useLocation();
  const [showBackToTop, setShowBackToTop] = useState(false);

  const skipVerify = useAppSelector(
    (state: RootState) => state.auth.skipVerify
  );

  const skipRoutes = [
    "/login",
    "/verify-success",
    "/verify-fail",
    "/reset-password",
  ];
  const shouldSkipByRoute = skipRoutes.some((p) =>
    location.pathname.startsWith(p)
  );
  useEffect(() => {
    if (authStatus === "idle" && !skipVerify && !shouldSkipByRoute) {
      dispatch(verifyAsync());
    }
  }, [dispatch, authStatus, skipVerify, shouldSkipByRoute]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleLogout = (event: CustomEvent<{ path: string }>) => {
      const path = event.detail?.path || "/";
      navigate(path, { replace: true });
    };

    window.addEventListener("auth:logout", handleLogout as EventListener);
    return () => {
      window.removeEventListener("auth:logout", handleLogout as EventListener);
    };
  }, [navigate]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Outlet />
      <GlobalErrorModal />
      <GlobalLoadingOverlay />

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-50 grid h-12 w-12 place-items-center rounded-full bg-zinc-900/80 text-white shadow-lg ring-1 ring-zinc-700 backdrop-blur transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <ChevronUp className="size-5" />
        </button>
      )}
    </>
  );
}
