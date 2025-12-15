import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Heart,
  RotateCw,
  User,
  LogOut,
  X,
} from "lucide-react";
import clsx from "clsx";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { useState } from "react";
import { useGetMeQuery } from "@/features/user/userApi";
import defaultAvatar from "@/assets/default-avatar.jpg";
import { useAppSelector } from "@/app/hooks";


const items = [
  { to: "/viewer/favorites", icon: Heart, label: "Phim Yêu Thích" },
  // { to: "/viewer/lists", icon: Plus, label: "Danh sách" },
  { to: "/viewer/continue", icon: RotateCw, label: "Tiếp Tục Xem" },
  // { to: "/viewer/notifications", icon: Bell, label: "Thông báo" },
  // { to: "/viewer/balance-account", icon: LucideWallet, label: "Tài Khoản Số Dư" },
  { to: "/viewer", icon: User, label: "Tài Khoản" },
];

export default function ViewerLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isAuth = useAppSelector((s) => s.auth.isAuth);
  const skipVerify = useAppSelector((s) => s.auth.skipVerify);
  const { data: user, isLoading: userLoading } = useGetMeQuery(undefined, {
    skip: !isAuth || skipVerify,
  });
  return (
    <div className="flex flex-col min-h-screen">
      <Header
        isAuth={true}
        roles={["viewer"]}
        onToggleSidebar={() => setIsSidebarOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden bg-white">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        {/* ─────────── sidebar ─────────── */}
        <aside
          className={clsx(
            "fixed inset-y-0 left-0 z-50 flex w-[260px] transform flex-col justify-between min-h-[80vh] gap-2 bg-white border-r border-gray-200 px-6 py-8 overflow-y-auto transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 shadow-sm",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full" // Logic trượt
          )}
        >
          {/* title */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="ml-2 text-lg font-bold text-gray-900">
              Quản Lý Tài Khoản{" "}
            </h2>
          
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-500 hover:text-gray-900"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* nav */}
          <nav className="flex-1 space-y-2">
            {items.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end
                className={({ isActive }) =>
                  clsx(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200", // Thêm 'relative'
                    isActive
                      ? "text-white" // Text trắng khi active
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* SỬA 4: Thêm thanh highlight động */}
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active-highlight" 
                        className="absolute inset-0 z-0 rounded-lg"
                        style={{ backgroundColor: "#C40E61" }}
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                    {/* SỬA 5: Thêm 'relative' để icon/text nổi lên trên */}
                    <Icon className="size-4 flex-shrink-0 relative z-10" />
                    <span className="relative z-10">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* user footer */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatarUrl || defaultAvatar}
                alt={user?.username || "User"}
                className="h-11 w-11 rounded-full object-cover border-2 border-gray-200"
              />
              <div className="truncate">
                <p className="max-w-[150px] truncate text-sm font-bold text-gray-900">
                  {userLoading ? "Đang tải..." : user?.username || "Người dùng"}
                </p>
                <p className="max-w-[150px] truncate text-xs text-gray-500">
                  {userLoading ? "..." : user?.email || ""}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                /* dispatch(logout()) */
                navigate("/");
              }}
              className="flex items-center gap-2 text-sm font-medium transition-colors"
              style={{ color: "#C40E61" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#C40E61";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#C40E61";
              }}
            >
              <LogOut className="size-4" />
              Đăng Xuất
            </button>
          </div>
        </aside>

        {/* ─────────── main content ─────────── */}
        <main className="flex-1 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
