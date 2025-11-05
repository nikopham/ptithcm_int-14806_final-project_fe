// src/components/MovieItem.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; // 1. Import hook
import { toast } from "sonner"; // 2. Import toast (hoặc thư viện thông báo của bạn)
import { Button } from "@/components/ui/button";
import { FaHeart } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { toggleLikeMovie } from "@/services/movieService";
import AuthTabsDialog from "../auth/AuthTabsDialog";
// 3. (Giả sử) Import service API của bạn
// import { toggleLikeMovie } from "@/services/movieService";

export const MovieItem = ({ movie, isLiked }) => {
  // 4. Nhận 'isLiked'
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);


  const [isLoading, setIsLoading] = useState(false);

  // 6. Xử lý logic click
  const handleLikeClick = async (e) => {
    e.preventDefault(); // Ngăn thẻ <Link> (cha) điều hướng
    e.stopPropagation(); // Ngăn sự kiện nổi bọt

    if (!user) {
      toast.error("Vui lòng đăng nhập để yêu thích phim.");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      // 7. Gọi API (ví dụ: toggle like)
      // (Bạn cần thay thế bằng hàm service/thunk thật)
      await toggleLikeMovie(dispatch, movie.id, !isLiked);
      
      toast.success(isLiked ? "Đã bỏ thích" : "Đã thêm vào yêu thích");
      // (Lý tưởng nhất là RTK Query sẽ tự động refetch)
    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // SỬA 1: Wrapper là 'div'
    <div className="block group">
      {/* SỬA 2: Thêm 'relative' để định vị nút con */}
      <div className="relative overflow-hidden rounded-lg aspect-[2/3]">
        {/* SỬA 3: Ảnh là 1 Link */}
        <Link to={`/movie-info/${movie.id}`}>
          <img
            src={movie.posterUrl || "https://via.placeholder.com/200x300"}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>{" "}
        {isAuthenticated ? (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute bottom-2 right-2 h-9 w-9 rounded-full",
              "bg-black/50 backdrop-blur-sm text-white",
              "hover:bg-black/70 hover:text-white",
              { "pointer-events-none": isLoading } // Vô hiệu hóa khi đang tải
            )}
            onClick={handleLikeClick}
            disabled={isLoading}
          >
            <FaHeart
              className={cn(
                "h-4 w-4 transition-colors",
                isLiked ? "text-red-500" : "text-white/80" // Đổi màu
              )}
            />
          </Button>
        ) : (
          <AuthTabsDialog>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute bottom-2 right-2 h-9 w-9 rounded-full",
                "bg-black/50 backdrop-blur-sm text-white",
                "hover:bg-black/70 hover:text-white",
                { "pointer-events-none": isLoading } // Vô hiệu hóa khi đang tải
              )}
           
              disabled={isLoading}
            >
              <FaHeart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isLiked ? "text-red-500" : "text-white/80" // Đổi màu
                )}
              />
            </Button>
          </AuthTabsDialog>
        )}
        {/* THÊM MỚI: Nút Heart */}
      </div>

      {/* SỬA 4: Tiêu đề là 1 Link */}
      <Link to={`/movie-info/${movie.id}`}>
        <h3 className="mt-2 text-sm font-medium text-primary truncate group-hover:text-primary">
          {movie.title}
        </h3>
      </Link>
    </div>
  );
};
