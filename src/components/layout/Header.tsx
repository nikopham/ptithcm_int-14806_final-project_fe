import { Link, NavLink, useLocation } from "react-router-dom";
import { Search, Bell, Play, Menu } from "lucide-react";
import { motion } from "framer-motion"; // 👈 thêm
import clsx from "clsx";

type Role = "viewer" | "movie_admin" | "comment_admin" | "super_admin";

interface HeaderProps {
  isAuth: boolean;
  roles: Role[];
  onToggleSidebar?: () => void;
}

const navItems = [
  { to: "/", label: "Home" },
  { to: "/movies", label: "Movies & Shows" },
  { to: "/filter", label: "Search" },
  { to: "/subscriptions", label: "Subscriptions" },
];

export const Header = ({ isAuth, roles, onToggleSidebar }: HeaderProps) => {
  const isViewer = roles.includes("viewer");

  const { pathname } = useLocation();
  const foundIndex = navItems.findIndex(
    (n) =>
      pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to + "/"))
  );
  // Nếu không tìm thấy (foundIndex = -1), mặc định về 0 (Home)
  const activeIndex = foundIndex === -1 ? 0 : foundIndex;

  return (
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
                    layoutId="active-nav-highlight" // Tên định danh "magic"
                    className="absolute inset-0 z-0 rounded-xl bg-zinc-700"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    clsx(
                      "relative block w-full px-3 py-2 text-center text-sm font-medium transition-colors",
                      "first:rounded-l-xl last:rounded-r-xl",
                      "whitespace-nowrap",
                      isActive ? "text-white" : "text-zinc-300 hover:text-white"
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

          {isAuth && isViewer && (
            <Link
              to="/notifications"
              className="text-zinc-300 transition hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
