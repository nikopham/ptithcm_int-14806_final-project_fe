// src/components/layouts/RootLayout.tsx

import { Outlet, useLocation } from "react-router-dom";
import { GlobalErrorModal } from "@/components/common/GlobalErrorModal"; // Đảm bảo đường dẫn này đúng
import { GlobalLoadingOverlay } from "@/components/common/GlobalLoadingOverlay";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { RootState } from "@/app/store";
import { useEffect, useState } from "react";
import { verifyAsync } from "@/features/auth/authThunks";
import { ChevronUp } from "lucide-react";

/**
 * Đây là layout gốc của toàn bộ ứng dụng.
 * Nó không chứa UI gì cả (như Navbar hay Footer).
 * Nhiệm vụ của nó là render "layout con" (ví dụ: PublicLayout)
 * và chứa các component toàn cục (như Modal lỗi).
 */
export function RootLayout() {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state: RootState) => state.auth.status);
  const location = useLocation();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && authStatus === "idle") {
      dispatch(verifyAsync());
    }
  }, [dispatch, authStatus]);

  // Scroll to top on route change
  useEffect(() => {
    // Ensure scroll resets when navigating between pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname, location.search]);

  // Toggle back-to-top button based on scroll position
  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <>
      {/* <Outlet /> ở đây sẽ render bất kỳ layout con nào 
        được định nghĩa trong router (ví dụ: <PublicLayout />)
      */}
      <Outlet />

      {/* Modal lỗi toàn cục được đặt ở đây.
        Nó nằm ngoài <Outlet /> nên sẽ không bị ảnh hưởng 
        bởi việc chuyển trang.
      */}
      <GlobalErrorModal />
      <GlobalLoadingOverlay />

      {/* Back to Top floating button */}
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
