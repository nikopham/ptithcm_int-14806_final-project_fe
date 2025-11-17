// src/components/layouts/RootLayout.tsx

import { Outlet } from "react-router-dom";
import { GlobalErrorModal } from "@/components/common/GlobalErrorModal"; // Đảm bảo đường dẫn này đúng
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { RootState } from "@/app/store";
import { useEffect } from "react";
import { verifyAsync } from "@/features/auth/authThunks";

/**
 * Đây là layout gốc của toàn bộ ứng dụng.
 * Nó không chứa UI gì cả (như Navbar hay Footer).
 * Nhiệm vụ của nó là render "layout con" (ví dụ: PublicLayout)
 * và chứa các component toàn cục (như Modal lỗi).
 */
export function RootLayout() {

  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state: RootState) => state.auth.status);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && authStatus === "idle") {
      dispatch(verifyAsync());
    }
  }, [dispatch, authStatus]);
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
    </>
  );
}
