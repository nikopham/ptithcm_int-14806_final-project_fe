import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/services/authService";
import { toast } from "sonner";

export default function UserDropdown({ user }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
 const { pathname } = useLocation();
 const showBackHome =
   pathname.includes("/admin-dashboard") ||
   pathname.includes("/customer-dashboard");

  const initials = (user?.email || "KH")
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    try {
      const res = await logoutUser(dispatch);
      console.log(res);
      
      if (res?.success) {
        toast.success(res?.message);

        navigate("/");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DropdownMenu>
      {/* -------- TRIGGER -------- */}
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 outline-none select-none">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user?.avatarUrl || "https://github.com/shadcn.png"}
              alt={user?.email || "Avatar"}
            />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:block font-medium">
            {user?.email || "Khách"}
          </span>
        </button>
      </DropdownMenuTrigger>

      {/* -------- CONTENT -------- */}
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>{user ? user.email : "Guest"}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Quay lại trang chủ (chỉ hiện ở dashboard) */}
        {showBackHome && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/">Quay lại trang chủ</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Go to dashboard */}
        <DropdownMenuItem asChild>
          <Link
            to={
              user?.role == "admin" || user?.role == "employee"
                ? "/admin-dashboard/dashboard"
                : "/customer-dashboard/info"
            }
          >
            Quản lý tài khoản
          </Link>
        </DropdownMenuItem>

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:bg-destructive/10"
        >
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
