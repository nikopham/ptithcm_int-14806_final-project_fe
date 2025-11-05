// src/components/MovieHeroSlide.jsx

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FaPlay, FaHeart, FaThumbsUp } from "react-icons/fa";
import { FiInfo, FiHeart, FiClock } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { cn } from "@/lib/utils";
import AuthTabsDialog from "../auth/AuthTabsDialog";
import { toast } from "sonner";
import { toggleLikeMovie } from "@/services/movieService";
import { useNavigate } from "react-router-dom";
import { is } from "zod/v4/locales";

// 1. Nhận thêm `slideIndex` từ props
export const MovieHeroSlide = ({
  movie,
  allMovies,
  carouselApi,
  currentIndex,
  slideIndex,
}) => {
  const handleThumbnailClick = (index) => {
    if (carouselApi) {
      carouselApi.scrollTo(index);
    }
  };
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { newFeedList } = useSelector((state) => state.movie);
  console.log(newFeedList);
  
  const [isLoading, setIsLoading] = useState(false);
  // 2. Kiểm tra xem slide này có đang active không
  const isActive = currentIndex === slideIndex;
  let isLiked = movie?.isLiked || false;
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
    // Thêm overflow-hidden để "kẹp" (clip) các animation trượt
    <div className="relative w-full h-[70vh] md:h-[85vh] text-white overflow-hidden">
      {/* 3. Wrapper MỚI cho Ảnh + Gradient */}
      {/* Wrapper này sẽ trượt từ PHẢI sang */}
      <div
        className={`
          absolute inset-0
          transition-transform duration-1000 ease-out
          ${isActive ? "translate-x-0" : "translate-x-1/4"}
        `}
      >
        {/* Ảnh nền */}
        <img
          src={movie.bgImageUrl}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover -z-20"
        />
        {/* Lớp phủ Gradient (đi cùng ảnh) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent -z-10" />
      </div>

      {/* 4. Wrapper cho Nội dung văn bản (Bên trái) */}
      {/* Wrapper này sẽ trượt từ TRÁI sang và mờ dần */}
      <div
        className={`
          relative z-20 flex flex-col justify-center h-full p-8 md:p-16 lg:p-24 
          space-y-4 md:space-y-5 max-w-xl lg:max-w-2xl
          transition-all duration-1000 ease-out delay-200
          ${
            isActive
              ? "translate-x-0 opacity-100"
              : "-translate-x-1/4 opacity-0"
          }
        `}
      >
        {/* Tiêu đề */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight uppercase">
          {movie.title}
        </h1>
        {/* ... (Toàn bộ nội dung khác: subtitle, badges, genres, description) ... */}
        <h2 className="text-xl md:text-2xl font-medium text-gray-300">
          {movie.subtitle}
        </h2>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Badge variant="secondary" className="bg-gray-800/70 text-gray-300">
            IMDb {movie.imdb}
          </Badge>

          <Badge
            variant="secondary"
            className="bg-gray-800/70 text-gray-300 flex items-center gap-1"
          >
            <FaThumbsUp className="h-3 w-3" /> {movie.likes}
          </Badge>
          <Badge
            variant="secondary"
            className="bg-gray-800/70 text-gray-300 flex items-center gap-1"
          >
            <FiClock className="h-3 w-3" /> {movie.duration}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-300">
          {movie.genres.map((genre, index) => (
            <React.Fragment key={genre}>
              <span>{genre}</span>
              {index < movie.genres.length - 1 && (
                <span className="text-gray-500">•</span>
              )}
            </React.Fragment>
          ))}
        </div>
        <p className="text-base md:text-lg text-gray-200 line-clamp-3 pt-2">
          {movie.description}
        </p>

        {/* Các nút bấm (Giữ nguyên như lần trước) */}
        <div className="flex items-center space-x-3 pt-4">
          <Button
            className="bg-yellow-400 text-black rounded-full h-16 w-16 p-0 hover:bg-yellow-300 transition-all duration-300"
            aria-label="Play"
          >
            <FaPlay className="h-6 w-6" />
          </Button>
          <div className="flex rounded-full border border-white h-12 overflow-hidden">
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "relative rounded-none h-full w-12 bg-transparent text-white group hover:bg-white/10",
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
                   "relative rounded-none h-full w-12 bg-transparent text-white group hover:bg-white/10",
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
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-none h-full w-12 bg-transparent text-white group hover:bg-white/10"
              aria-label="More Info"
            >
              <FiInfo className="h-6 w-6 transition-colors group-hover:text-yellow-400" />
            </Button>
          </div>
        </div>
      </div>

      {/* 5. Thumbnails điều hướng */}
      {/* Chúng ta cũng cho thumbnails mờ dần theo slide */}
      <div
        className={`
          absolute bottom-8 right-8 z-30 hidden md:flex items-center space-x-2
          transition-opacity duration-700 delay-300
          ${isActive ? "opacity-100" : "opacity-0"}
        `}
      >
        {allMovies.map((thumbMovie, index) => (
          <img
            key={thumbMovie.id || index}
            src={thumbMovie.bgImageUrl}
            alt={thumbMovie.title}
            className={`
              w-20 h-12 object-cover rounded-md border-2 cursor-pointer transition-all
              ${
                index === currentIndex
                  ? "border-white"
                  : "border-transparent opacity-60"
              }
              hover:opacity-100 hover:border-white
            `}
            onClick={() => handleThumbnailClick(index)}
          />
        ))}
      </div>
    </div>
  );
};
