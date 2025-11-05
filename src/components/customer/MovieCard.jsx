// src/components/MovieCard.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FaHeart } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { toggleLikeMovie } from "@/services/movieService";
import AuthTabsDialog from "../auth/AuthTabsDialog";
import { is } from "date-fns/locale";
// (Giả sử) Import service API của bạn
// import { toggleLikeMovie } from "@/services/movieService";

export const MovieCard = ({ movie, isLiked }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [isLoading, setIsLoading] = useState(false);

  const handleLikeClick = async (e) => {
    e.preventDefault(); // Ngăn <Link> (cha) điều hướng
    e.stopPropagation(); // Ngăn sự kiện nổi bọt

    if (!user) {
      toast.error("Vui lòng đăng nhập để yêu thích phim.");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      await toggleLikeMovie(dispatch, movie.id, !isLiked);

      toast.success(isLiked ? "Đã bỏ thích" : "Đã thêm vào yêu thích");
    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Giữ nguyên kích thước gốc
    <div className="w-40 md:w-48 flex-shrink-0 group">
      {/* 1. Thêm 'relative' để định vị nút con */}
      <div className="relative overflow-hidden rounded-lg aspect-[2/3]">
        {/* 2. Ảnh là 1 Link */}
        <Link to={`/movie-info/${movie.id}`}>
          <img
            src={movie.posterUrl || "https://via.placeholder.com/200x300"}
            alt={movie.title}
            className="w-full h-full object-cover 
                       transition-transform duration-300 ease-in-out 
                       group-hover:scale-105"
          />
        </Link>

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
      </div>

      {/* 4. Tiêu đề là 1 Link (Giữ nguyên style 'text-black') */}
      <Link to={`/movie-info/${movie.id}`}>
        <h3 className="mt-2 text-sm md:text-base font-medium text-black truncate">
          {movie.title}
        </h3>
      </Link>
    </div>
  );
};
