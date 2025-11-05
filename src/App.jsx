import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initCsrfToken } from "@/services/axiosInstance";
import AppRouter from "./routes/AppRouter";
import { setLoading } from "./features/auth/authSlice";
import { fetchMe, logoutUser } from "./services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getCountry, getGenres } from "./services/movieService";

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    initCsrfToken();
  }, []);

  useEffect(() => {
    getGenres(dispatch);
    getCountry(dispatch);
  }, [dispatch]);

  useEffect(() => {
    // 1. Định nghĩa hàm handleLogout (giống như bạn cung cấp)
    const handleLogout = async () => {
      try {
        const res = await logoutUser(dispatch); // Gọi service logout
        console.log(res);

        if (res?.success) {
          toast.success(res?.message || "Phiên đăng nhập hết hạn.");
          navigate("/"); // Chuyển về trang chủ
        } else {
          // Nếu logout server thất bại, vẫn ép về trang chủ
          navigate("/");
        }
      } catch (err) {
        console.error(err);
        navigate("/"); // Ép về trang chủ nếu có lỗi
      }
    };

    // 2. Lắng nghe sự kiện 'forceLogout' từ axios
    const handleForceLogout = () => {
      console.warn("Axios Interceptor: Refresh token failed. Logging out.");
      handleLogout();
    };

    window.addEventListener("forceLogout", handleForceLogout);

    // 3. Dọn dẹp listener khi component unmount
    return () => {
      window.removeEventListener("forceLogout", handleForceLogout);
    };
  }, [dispatch, navigate]);

  const { initialized } = useSelector((s) => s.auth);
  useEffect(() => {
    if (!initialized) {
      dispatch(setLoading(true));
      fetchMe(dispatch).catch(() => {});
    }
  }, [initialized, dispatch]);

  return (
    <>
      <AppRouter />
    </>
  );
}

export default App;
