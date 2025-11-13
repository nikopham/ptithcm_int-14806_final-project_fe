import {
  BarChart2,
  Film,
  Plus,
  Layers3,
  Users2,
  Video,
  ShieldCheck,
  MessageCircle,
  Wallet,
  UserCog,
  ChevronRight,
  X,
  Menu,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import clsx from "clsx";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/* demo admin profile */
const me = {
  name: "Admin deep try",
  email: "admin@streamify.dev",
  avatar: "https://i.pravatar.cc/80?img=51",
};

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
  { label: "Danh sách Actor", icon: Users2, to: "/admin/actors" },
  { label: "Danh sách Director", icon: Video, to: "/admin/directors" },
  { label: "Danh sách Rating", icon: ShieldCheck, to: "/admin/ratings" },
  { label: "Danh sách Comment", icon: MessageCircle, to: "/admin/comments" },
  { label: "Danh sách các gói subscription", icon: Wallet, to: "/admin/plans" },
  {
    label: "Danh sách User",
    icon: UserCog,
    to: "/admin/users",
    children: [
      { label: "Danh sách Viewer", icon: Users2, to: "/admin/users/viewer" },
      { label: "Thêm User", icon: Plus, to: "/admin/users/new" },
      {
        label: "Set role user role",
        icon: ShieldCheck,
        to: "/admin/users/roles",
      },
    ],
  },
  { label: "Danh sách thanh toán", icon: Wallet, to: "/admin/payments" },
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
  const padding = depth === 0 ? "pl-3" : `pl-${depth * 4 + 3}`; // Tự động tính padding

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
      <item.icon className="relative z-10 size-4 flex-shrink-0" />
      <span className="relative z-10 flex-1 text-left">{item.label}</span>
    </>
  );

  // Class chung cho row
  const baseClasses =
    "group relative flex w-full items-center gap-3 rounded py-2 pr-9 text-sm font-medium transition-colors";
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
            className="absolute right-1 top-1/2 z-20 -translate-y-1/2 p-1.5 text-zinc-400 transition-transform hover:text-white"
          >
            <ChevronRight
              className={clsx(
                "size-4 transition-transform duration-200",
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
          <div className="flex flex-col gap-1 py-1 ml-6">
            {" "}
            {/* Thêm chút gap cho đẹp */}
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

  return (
    <div className="grid grid-rows-[auto_1fr_auto] lg:h-[120vh]">
      <Header
        isAuth
        roles={["super_admin"]}
        onToggleSidebar={() => setOpen(true)}
      />

      {/* body */}
      <div className="grid grid-cols-1 bg-[#0d0d12] overflow-hidden lg:grid-cols-[260px_1fr]">
        {/* backdrop mobile */}
        {open && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* sidebar */}
        <aside
          className={clsx(
            "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col justify-between gap-4 overflow-y-auto bg-zinc-900 px-6 py-8 transition-transform duration-300 lg:static lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* mobile top */}
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <span className="text-sm font-semibold text-white">Admin Menu</span>
            <button
              onClick={() => setOpen(false)}
              className="p-1 text-zinc-400 hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* nav list */}
          <nav className="flex-1 space-y-2">
            {nav.map((it) => (
              <SidebarItem
                key={it.label}
                item={it}
                closeSidebar={() => setOpen(false)}
              />
            ))}
          </nav>

          {/* footer */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={me.avatar}
                alt={me.name}
                className="h-11 w-11 rounded-full object-cover"
              />
              <div className="truncate">
                <p className="max-w-[150px] truncate text-sm font-medium text-white">
                  {me.name}
                </p>
                <p className="max-w-[150px] truncate text-xs text-zinc-400">
                  {me.email}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm font-medium text-red-400 transition hover:text-red-500"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* main */}
        <main className="col-span-1 overflow-y-auto px-4 py-8 lg:px-10">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}
