import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Heart,
  Plus,
  RotateCw,
  Bell,
  User,
  LogOut,
  X,
  Menu,
  LucideWallet,
} from "lucide-react";
import clsx from "clsx";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Demo user – replace with real auth selector                       */
/* ------------------------------------------------------------------ */
const user = {
  name: "harry maguire",
  email: "toyotagyarisrally1@gmail.com",
  avatar: "https://i.pravatar.cc/80?img=12",
};

/* ------------------------------------------------------------------ */
/*  Sidebar items                                                     */
/* ------------------------------------------------------------------ */
const items = [
  { to: "/viewer/favorites", icon: Heart, label: "Liked Movies" },
  // { to: "/viewer/lists", icon: Plus, label: "Danh sách" },
  { to: "/viewer/continue", icon: RotateCw, label: "Continue Watching" },
  // { to: "/viewer/notifications", icon: Bell, label: "Thông báo" },
  { to: "/viewer/balance-account", icon: LucideWallet, label: "Balance Account" },
  { to: "/viewer", icon: User, label: "Account" },
];

/* ------------------------------------------------------------------ */
/*  Layout                                                            */
/* ------------------------------------------------------------------ */
export default function ViewerLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="grid grid-rows-[auto_1fr_auto] lg:h-[120vh]">
      <Header
        isAuth={true}
        roles={["viewer"]}
        onToggleSidebar={() => setIsSidebarOpen(true)}
      />
      <div className="grid grid-cols-1 bg-[#0d0d12] overflow-hidden lg:grid-cols-[260px_1fr]">
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
            "fixed inset-y-0 left-0 z-50 flex w-[260px] transform flex-col justify-between gap-2 bg-zinc-900 px-6 py-8 overflow-y-auto transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full" // Logic trượt
          )}
        >
          {/* title */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="ml-2 text-lg font-semibold text-white">
              Manage Account{" "}
            </h2>
            {/* 👈 SỬA 7: Thêm nút đóng (X) cho mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 text-zinc-400 hover:text-white"
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
                    "relative flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors", // Thêm 'relative'
                    isActive
                      ? "text-white" // Xóa 'bg-zinc-800'
                      : "text-zinc-300 hover:bg-zinc-800/50 hover:text-white"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* SỬA 4: Thêm thanh highlight động */}
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active-highlight" // ID cho animation
                        className="absolute inset-0 z-0 rounded bg-zinc-800"
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
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-11 w-11 rounded-full object-cover"
              />
              <div className="truncate">
                <p className="max-w-[150px] truncate text-sm font-medium text-white">
                  {user.name}
                </p>
                <p className="max-w-[150px] truncate text-xs text-zinc-400">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                /* dispatch(logout()) */
                navigate("/");
              }}
              className="flex items-center gap-2 text-sm font-medium text-red-400 transition hover:text-red-500"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* ─────────── main content ─────────── */}
        <main className="col-span-1 overflow-y-auto px-10 py-10 lg:col-start-2">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
