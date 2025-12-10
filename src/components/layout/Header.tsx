import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Play, Menu, LogOut, Settings, CircleUserRound, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useDispatch } from "react-redux";
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
import { Role } from "@/router/role";
import { logoutAsync } from "@/features/auth/authThunks";

// [MỚI] Import GlobalSearchBar
import { GlobalSearchBar } from "@/components/common/GlobalSearchBar";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const navItems = [
  { to: "/", label: "Trang Chủ" },
  { to: "/movies", label: "Phim & Chương Trình" },
  { to: "/filter", label: "Tìm Kiếm" },
  // { to: "/subscriptions", label: "Subscriptions" },
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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuth, roles, username, avatarUrl } = useSelector(
    (state: RootState) => state.auth
  );

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const openLoginDialog = () => {
    setAuthTab("login");
    setIsAuthOpen(true);
    setIsMobileMenuOpen(false);
  };

  // Sửa handleLogout thành async để đợi dispatch xong (nếu cần)
  const handleLogout = () => {
    dispatch(logoutAsync() as any); // Type assertion nếu TS lỗi async thunk
    setIsMobileMenuOpen(false);
  };

  const foundIndex = navItems.findIndex(
    (n) =>
      pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to + "/"))
  );
  const activeIndex = foundIndex === -1 ? 0 : foundIndex;

  const handleNavClick = (to: string) => {
    navigate(to);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 gap-4">
          {/* 1. LEFT: Logo & Menu Toggle */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {/* Sidebar Toggle (for admin layout - desktop) */}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="hidden lg:block p-1 text-gray-700 hover:text-gray-900"
                aria-label="Open sidebar"
              >
                <Menu className="size-6" />
              </button>
            )}
            
            {/* Mobile Menu Toggle */}
            {onToggleSidebar ? (
              // If has sidebar (AdminLayout), hamburger opens sidebar on mobile
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-1 text-gray-700 hover:text-gray-900"
                aria-label="Open sidebar"
              >
                <Menu className="size-6" />
              </button>
            ) : (
              // If no sidebar (PublicLayout), hamburger opens navigation menu
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1 text-gray-700 hover:text-gray-900"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="size-6" />
                ) : (
                  <Menu className="size-6" />
                )}
              </button>
            )}
            
            <Link 
              to="/" 
              className="flex items-center gap-1"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Play className="size-6" style={{ color: "#C40E61" }} />
              <span 
                className="text-2xl hidden sm:inline-block" 
                style={{ 
                  color: "#434343", 
                  fontFamily: "'Just Another Hand', cursive"
                }}
              >
                Streamify
              </span>
            </Link>
          </div>

          {/* 2. CENTER: Navigation (Desktop) - Only show if no sidebar */}
          {!onToggleSidebar && (
            <nav className="hidden lg:block">
            <ul className="relative flex items-center rounded-full bg-gray-100 p-1 border border-gray-200">
              {navItems.map(({ to, label }, index) => (
                <li key={to} className="relative z-10">
                  {activeIndex === index && (
                    <motion.div
                      layoutId="active-nav-highlight"
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: "#C40E61" }}
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
                        "relative block px-4 py-1.5 text-sm font-medium transition-colors rounded-full",
                        isActive
                          ? "text-white"
                          : "text-gray-600 hover:text-gray-900"
                      )
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          )}

          {/* 3. RIGHT: Search & Profile */}
          <div className="flex items-center gap-3 md:gap-4 justify-end flex-1 md:flex-none">
            {/* [MỚI] Tích hợp Global Search Bar */}
            <div className="w-full max-w-[200px] md:max-w-[260px]">
              <GlobalSearchBar />
            </div>

            {/* Profile Dropdown */}
            {isAuth ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="flex items-center gap-2 rounded-full ring-offset-white transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2" 
                    style={{ "--tw-ring-color": "#C40E61" } as React.CSSProperties}
                  >
                    <Avatar className="size-8 md:size-9 border border-gray-300">
                      <AvatarImage
                        src={avatarUrl || undefined}
                        alt={username || "User"}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                        {getInitials(username)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-60 bg-white border-gray-200 text-gray-900 shadow-lg"
                >
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <p className="font-medium truncate">{username}</p>
                      <div className="flex flex-wrap gap-1">
                        {roles.map((role) => (
                          <Badge
                            key={role}
                            className={`text-[10px] h-5 px-1.5 ${getRoleBadgeClass(role)}`}
                          >
                            {getRoleName(role)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-gray-200" />

                  <DropdownMenuItem
                    asChild
                    className="focus:bg-gray-100 focus:text-gray-900 cursor-pointer"
                  >
                    <Link to="/viewer">
                      <CircleUserRound className="mr-2 size-4" />
                      <span>Trang Cá Nhân</span>
                    </Link>
                  </DropdownMenuItem>

                  {/* Admin Link Logic */}
                  {(roles.includes(Role.SUPER_ADMIN) ||
                    roles.includes(Role.MOVIE_ADMIN) ||
                    roles.includes(Role.COMMENT_ADMIN)) && (
                    <DropdownMenuItem
                      asChild
                      className="focus:bg-gray-100 focus:text-gray-900 cursor-pointer"
                    >
                      <Link to="/admin">
                        <Settings className="mr-2 size-4" />
                        <span>Trang Quản Trị</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-gray-200" />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer focus:bg-red-50"
                    style={{ color: "#C40E61" }}
                  >
                    <LogOut className="mr-2 size-4" />
                    <span>Đăng Xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={openLoginDialog}
                size="sm"
                className="font-semibold"
                style={{ backgroundColor: "#C40E61", color: "white" }}
              >
                Đăng Nhập
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu - Only show if no sidebar */}
      {!onToggleSidebar && (
        <AnimatePresence mode="wait">
          {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 z-[50] lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 z-[60] lg:hidden overflow-y-auto shadow-lg"
            >
              <div className="flex flex-col p-4 gap-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Điều Hướng
                </div>
                {navItems.map(({ to, label }) => {
                  const isActive = pathname === to || (to !== "/" && pathname.startsWith(to + "/"));
                  return (
                    <button
                      key={to}
                      onClick={() => handleNavClick(to)}
                      className={clsx(
                        "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                        isActive
                          ? "text-white"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      )}
                      style={isActive ? { backgroundColor: "#C40E61" } : undefined}
                    >
                      {label}
                    </button>
                  );
                })}
                
                <div className="border-t border-gray-200 my-4" />
                
               

                {/* Mobile Auth Section */}
                {!isAuth && (
                  <>
                    <div className="border-t border-gray-200 my-4" />
                    <div className="px-3">
                      <Button
                        onClick={openLoginDialog}
                        className="w-full font-semibold"
                        style={{ backgroundColor: "#C40E61", color: "white" }}
                      >
                        Đăng Nhập
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
          )}
        </AnimatePresence>
      )}

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultTab={authTab}
      />
    </>
  );
};
