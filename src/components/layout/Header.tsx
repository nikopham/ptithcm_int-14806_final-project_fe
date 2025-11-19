import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Search, Play, Menu, User, LogOut, Settings } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { Role } from "@/router/role";
import { useDispatch } from "react-redux";
import { logout } from "@/features/auth/authSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import getRoleBadgeClass, { getRoleName } from "@/utils/getRoleBadgeClass";
import { Badge } from "../ui/badge";
import { GlobalConstant } from "@/constants/GlobalConstant";
import { logoutAsync } from "@/features/auth/authThunks";

// 2. SỬA LẠI PROPS: Xóa các props liên quan đến auth
interface HeaderProps {
  onToggleSidebar?: () => void;
}

const navItems = [
  { to: "/", label: "Home" },
  { to: "/movies", label: "Movies & Shows" },
  { to: "/filter", label: "Search" },
  { to: "/subscriptions", label: "Subscriptions" },
];
const getInitials = (name: string | null) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

export const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const { isAuth, roles, username, avatarUrl } = useSelector(
    (state: RootState) => state.auth
  );

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  const openLoginDialog = () => {
    setAuthTab("login");
    setIsAuthOpen(true);
  };
  const handleLogout = () => {
    dispatch(logoutAsync());
  };

  const foundIndex = navItems.findIndex(
    (n) =>
      pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to + "/"))
  );
  const activeIndex = foundIndex === -1 ? 0 : foundIndex;
  
  
  return (
    <>
      {" "}
      {/* 👈 Bọc bằng Fragment để chứa Dialog */}
      <header className="sticky top-0 z-40 w-full bg-zinc-900/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-1 text-zinc-300 hover:text-white lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="size-6" />
              </button>
            )}
            <Link to="/" className="flex items-center gap-1">
              <Play className="size-6 -rotate-90 text-red-600" />
              <span className="font-heading text-lg font-semibold text-white">
                Stream<span className="text-red-500">ify</span>
              </span>
            </Link>
          </div>
          {/* brand */}

          {/* ------------- nav ------------- */}
          <nav className="relative hidden lg:block">
            <ul className="relative flex items-stretch rounded-xl border border-zinc-700/60 bg-zinc-800/40">
              {/* 🌟 animated slider */}

              {navItems.map(({ to, label }, index) => (
                <li key={to} className="relative z-10">
                  {activeIndex === index && (
                    <motion.span
                      layoutId="active-nav-highlight"
                      className="absolute inset-0 z-0 rounded-xl bg-zinc-700"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      clsx(
                        "relative block w-full px-3 py-2 text-center text-sm font-medium transition-colors",
                        "first:rounded-l-xl last:rounded-r-xl",
                        "whitespace-nowrap",
                        isActive
                          ? "text-white"
                          : "text-zinc-300 hover:text-white"
                      )
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* tools */}
          <div className="flex items-center gap-5">
            <Link
              to="/search"
              className="text-zinc-300 transition hover:text-white"
              aria-label="Search"
            >
              <Search className="size-5" />
            </Link>

            {/* 2. ─── Nút Account (Đăng nhập / Profile) ─── */}
            {isAuth ? (
              // Nếu đã đăng nhập, hiển thị Avatar và Dropdown
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-lg p-1 text-zinc-300 transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-900">
                    {/* Thêm username, ẩn trên màn hình nhỏ (sm) */}
                    <span className="hidden px-1 text-sm font-medium sm:block">
                      {username}
                    </span>

                    <Avatar className="size-8">
                      <AvatarImage
                        src={avatarUrl || undefined}
                        alt={username || "User"}
                      />
                      <AvatarFallback>{getInitials(username)}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="font-medium">Tài khoản của tôi</p>
                    <p className="text-xs font-normal text-zinc-400">
                      {username}{" "}
                      <Badge
                        key={roles[0]}
                        className={getRoleBadgeClass(roles[0])}
                      >
                        {getRoleName(roles[0])}
                      </Badge>
                    </p>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/viewer">
                      <User className="mr-2 size-4" />
                      <span>Trang cá nhân</span>
                    </Link>
                  </DropdownMenuItem>

                  {/* Hiển thị link Admin nếu có quyền */}
                  {(roles.includes(GlobalConstant.SUPER_ADMIN) || // <-- Sửa ở đây
                    roles.includes(GlobalConstant.MOVIE_ADMIN) ||
                    roles.includes(GlobalConstant.COMMENT_ADMIN)
                  ) && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <Settings className="mr-2 size-4" />
                        <span>Trang quản trị</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500 focus:text-red-500"
                  >
                    <LogOut className="mr-2 size-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Nếu chưa đăng nhập, hiển thị nút Login
              <Button
                onClick={openLoginDialog}
                variant="outline"
                className="h-8 border-zinc-700 bg-transparent px-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Account
              </Button>
            )}
            {/* ─────────────────────────────────────────────── */}
          </div>
        </div>
      </header>
      {/* 3. ─── Render Dialog ─── */}
      <AuthDialog
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultTab={authTab}
      />
    </>
  );
};
