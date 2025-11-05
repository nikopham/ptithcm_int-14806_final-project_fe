import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/logo/logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import AuthTabsDialog from "../auth/AuthTabsDialog";
import UserDropdown from "./UserDropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, User, Search, ChevronDown } from "lucide-react";
import { GenreMenu } from "./GenreMenu";
import { CountryMenu } from "./CountryMenu";
import { useEffect } from "react";
import { getCountry, getGenres } from "@/services/movieService";
import { setParamsInStorage } from "@/utils/filterUtils";

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleNavClick = (params) => {
    setParamsInStorage(params);
    window.dispatchEvent(new CustomEvent("storageFilterChanged"));
    navigate("/filter");
  };
  return (
    <div className="bg-white text-black ">
      <header className="flex items-center justify-between px-6 py-4">
        {/* LEFT */}
        {!location.pathname.includes("admin-dashboard") ? (
          <div className="flex items-center gap-6 min-w-0">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src={logo} alt="Logo" className="h-10 w-auto" />
            </Link>

            {/* Search - cố định chiều rộng và không co các item khác */}
            <div className="hidden lg:flex w-96 shrink-0">
              <Input
                type="text"
                placeholder="Tìm kiếm phim, diễn viên"
                className=""
              />
            </div>

            {/* Menu */}
            <nav className="hidden xl:flex items-center gap-6 text-sm font-medium shrink-0">
              {/* Sửa <Link> thành <button> */}
              <div className="hover:bg-gray-100 rounded-sm">
                <button
                  onClick={() => handleNavClick({ type: "movie" })}
                  className="menu-link hover:text-primary transition-colors p-2"
                >
                  Phim Lẻ
                </button>
              </div>

              <div className="hover:bg-gray-100 rounded-sm">
                <button
                  onClick={() => handleNavClick({ type: "tv" })}
                  className="menu-link hover:text-primary transition-colors p-2"
                >
                  Phim Bộ
                </button>
              </div>

              {/* Truyền hàm handler vào 2 menu */}
              <GenreMenu onSelect={handleNavClick} />
              <CountryMenu onSelect={handleNavClick} />
            </nav>
          </div>
        ) : (
          <div></div>
        )}

        {/* RIGHT */}
        <div className="flex items-center gap-4 shrink-0">
          {isAuthenticated ? (
            <UserDropdown user={user} />
          ) : (
            <AuthTabsDialog>
              <Button className="rounded-full  px-6 whitespace-nowrap">
                Thành viên
              </Button>
            </AuthTabsDialog>
          )}
        </div>
      </header>
    </div>
  );
};
export default Header;
