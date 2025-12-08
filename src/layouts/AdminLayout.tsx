import {
  BarChart2,
  Film,
  Plus,
  Layers3,
  Users2,
  ShieldCheck,
  MessageCircle,
  UserCog,
  ChevronRight,
  X,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import clsx from "clsx";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useGetMeQuery } from "@/features/user/userApi";
import defaultAvatar from "@/assets/default-avatar.jpg";
import { useAppSelector } from "@/app/hooks";

/* ───────────────────────────── sidebar config */
type Item = {
  label: string;
  icon: React.ElementType;
  to?: string;
  children?: Item[];
};

const nav: Item[] = [
  { label: "Dashboard", icon: BarChart2, to: "/admin" },

  {
    label: "Danh sách phim",
    icon: Film,
    to: "/admin/movies",
    children: [{ label: "Thêm phim", icon: Plus, to: "/admin/movies/new" }],
  },
  { label: "Danh sách Genre", icon: Layers3, to: "/admin/genres" },
  { label: "Danh sách Movie People", icon: Users2, to: "/admin/movie-people" },

  { label: "Danh sách Rating", icon: ShieldCheck, to: "/admin/ratings" },
  { label: "Danh sách Comment", icon: MessageCircle, to: "/admin/comments" },
  // { label: "Danh sách các gói subscription", icon: Wallet, to: "/admin/plans" },
  {
    label: "Danh sách User",
    icon: Users2,
    // to: "/admin/users",
    children: [
      { label: "Danh sách Viewer", icon: Users2, to: "/admin/users/viewer" },
      { label: "Danh sách Admin", icon: UserCog, to: "/admin/users/admin" },
    ],
  },
  // { label: "Danh sách thanh toán", icon: Wallet, to: "/admin/transactions" },
];

/* ───────────────────────────── helper components */
function SidebarItem({
  item,
  depth = 0,
  closeSidebar,
}: {
  item: Item;
  depth?: number;
  closeSidebar?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChild = Boolean(item.children?.length);
  // Padding responsive: depth 0 = pl-2 sm:pl-3, depth 1 = pl-6 sm:pl-7
  const padding = depth === 0 ? "pl-2 sm:pl-3" : "pl-6 sm:pl-7";

  // --- Phần nội dung bên trái (Icon + Label) ---
  const LinkContent = ({ isActive }: { isActive: boolean }) => (
    <>
      {isActive && (
        <motion.span
          layoutId="admin-highlighter"
          className="absolute inset-0 z-0 rounded bg-zinc-800"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <item.icon className="relative z-10 size-3.5 sm:size-4 flex-shrink-0" />
      <span className="relative z-10 flex-1 text-left truncate">{item.label}</span>
    </>
  );

  // Class chung cho row
  const baseClasses =
    "group relative flex w-full items-center gap-2 sm:gap-3 rounded py-1.5 sm:py-2 pr-8 sm:pr-9 text-xs sm:text-sm font-medium transition-colors";
  const inactiveClasses = "text-zinc-300 hover:bg-zinc-800/50 hover:text-white";
  const activeClasses = "text-white";

  return (
    <>
      <div className="relative">
        {/* LOGIC 1: NẾU CÓ PATH -> Render NavLink 
           (Click vào chữ sẽ chuyển trang)
        */}
        {item.to ? (
          <NavLink
            to={item.to}
            end // Giữ end để parent chỉ sáng khi đúng route đó
            onClick={closeSidebar}
            className={({ isActive }) =>
              clsx(
                baseClasses,
                padding,
                isActive ? activeClasses : inactiveClasses
              )
            }
          >
            {({ isActive }) => <LinkContent isActive={isActive} />}
          </NavLink>
        ) : (
          /* LOGIC 2: KHÔNG CÓ PATH -> Render Button 
             (Click vào chữ sẽ toggle mở menu)
          */
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={clsx(baseClasses, padding, inactiveClasses)}
          >
            <LinkContent isActive={false} />
          </button>
        )}

        {/* LOGIC 3: NÚT MŨI TÊN RIÊNG BIỆT (Nếu có children)
           Nằm đè lên bên phải (absolute), click vào đây CHỈ để toggle menu
        */}
        {hasChild && (
          <button
            onClick={(e) => {
              e.preventDefault(); // Ngăn chặn NavLink click (nếu bị lồng)
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="absolute right-1 top-1/2 z-20 -translate-y-1/2 p-1 sm:p-1.5 text-zinc-400 transition-transform hover:text-white"
          >
            <ChevronRight
              className={clsx(
                "size-3.5 sm:size-4 transition-transform duration-200",
                isOpen && "rotate-90"
              )}
            />
          </button>
        )}
      </div>

      {/* --- Render Children --- */}
      {hasChild && (
        <motion.div
          initial={false}
          animate={{ height: isOpen ? "auto" : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="flex flex-col gap-1 py-1 ml-4 sm:ml-6">
            {item.children!.map((child) => (
              <SidebarItem
                key={child.label}
                item={child}
                depth={depth + 1}
                closeSidebar={closeSidebar}
              />
            ))}
          </div>
        </motion.div>
      )}
    </>
  );
}

/* ───────────────────────────── layout */
export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const isAuth = useAppSelector((s) => s.auth.isAuth);
  const skipVerify = useAppSelector((s) => s.auth.skipVerify);
  const { data: me, isLoading: meLoading } = useGetMeQuery(undefined, {
    skip: !isAuth || skipVerify,
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d12]">
      <Header onToggleSidebar={() => setOpen(true)} />

      {/* body */}
      <div className="relative flex flex-1 overflow-hidden lg:overflow-visible">
        {/* backdrop mobile */}
        {open && (
          <div
            className="fixed top-16 inset-x-0 bottom-0 z-[45] bg-black/60 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* sidebar */}
        <aside
          className={clsx(
            "fixed top-16 bottom-0 left-0 z-[50] flex w-[260px] sm:w-[280px] flex-col justify-between gap-4 overflow-y-auto bg-zinc-900 border-r border-zinc-800 px-4 sm:px-6 py-6 sm:py-8 transition-transform duration-300 ease-in-out lg:static lg:top-0 lg:z-auto",
            open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* mobile top */}
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <span className="text-sm font-semibold text-white">Admin Menu</span>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-white transition"
              aria-label="Close sidebar"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* nav list */}
          <nav className="flex-1 space-y-1 sm:space-y-2">
            {nav.map((it) => (
              <SidebarItem
                key={it.label}
                item={it}
                closeSidebar={() => setOpen(false)}
              />
            ))}
          </nav>

          {/* footer */}
          <div className="space-y-3 sm:space-y-4 border-t border-zinc-800 pt-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src={me?.avatarUrl || defaultAvatar}
                alt={me?.username || "Admin"}
                className="h-9 w-9 sm:h-11 sm:w-11 rounded-full object-cover border border-zinc-700"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs sm:text-sm font-medium text-white">
                  {meLoading ? "Loading..." : me?.username || "Admin"}
                </p>
                <p className="truncate text-[10px] sm:text-xs text-zinc-400">
                  {meLoading ? "..." : me?.email || ""}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/")}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-red-400 transition hover:bg-zinc-800 hover:text-red-500"
            >
              <LogOut className="size-3.5 sm:size-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* main */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 lg:py-8 min-w-0">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}
