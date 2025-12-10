import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useGetFeaturedGenresQuery } from "@/features/genre/genreApi";
import type { GenreWithMovies } from "@/types/home";

/**
 * Hero section với layout 2 cột:
 * - Trái: Text content trên nền trắng
 * - Phải: Auto slide carousel các poster phim trên nền gradient
 */
export const HeroBanner = () => {
  const { data: featured, isLoading } = useGetFeaturedGenresQuery();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Lấy 8 poster đầu tiên từ featured genres
  const posters = useMemo(() => {
    if (!featured || featured.length === 0) return [];
    
    const allMovies = featured.flatMap((g: GenreWithMovies) => g.movies || []);
    const validPosters = allMovies
      .filter((m) => m.posterUrl && m.posterUrl.trim() !== "")
      .map((m) => m.posterUrl);
    
    return validPosters.slice(0, 8);
  }, [featured]);

  // Auto slide effect
  useEffect(() => {
    if (posters.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posters.length);
    }, 3000); // Đổi slide mỗi 3 giây

    return () => clearInterval(interval);
  }, [posters.length]);

  return (
    <section className="relative w-full min-h-[450px] max-h-[500px] flex">
      {/* Left Section - Text Content */}
      <div className="flex-1 bg-white flex items-center px-6 md:px-10 lg:px-12 py-8">
        <div className="max-w-lg">
          {/* Large heading with gradient */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
            <span className="text-blue-600">Chương Trình TV</span>
            <br />
            <span 
              className="bg-gradient-to-r from-blue-600 to-[#C40E61] bg-clip-text text-transparent"
            >
              Và Nhiều Hơn Nữa
            </span>
          </h1>

          {/* Description */}
          <p className="text-gray-500 text-sm md:text-base mb-6 leading-relaxed">
            Streamify là nền tảng xem phim trực tuyến tốt nhất để bạn thưởng thức những bộ phim
            và chương trình yêu thích theo yêu cầu, mọi lúc, mọi nơi.
          </p>

          {/* Button */}
          <Link
            to="/movies"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C40E61] focus:ring-offset-2"
          >
            <Play className="size-4" style={{ color: "#C40E61" }} fill="#C40E61" />
            Xem Ngay
          </Link>
        </div>
      </div>

      {/* Right Section - Movie Posters Carousel */}
      <div className="flex-1 relative bg-gradient-to-b from-purple-200 via-purple-300 to-pink-300 flex items-center justify-center p-6 md:p-8 overflow-hidden">
        {/* Decorative line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-24 bg-purple-400 -translate-x-1/2 z-10" />

        {isLoading ? (
          <div className="text-gray-600">Đang tải...</div>
        ) : posters.length > 0 ? (
          <div className="relative w-full max-w-sm h-full flex items-center">
            {/* Carousel container */}
            <div className="relative w-full h-full flex items-center justify-center">
              {posters.map((poster, index) => {
                const isActive = index === currentIndex;
                const prevIndex = (currentIndex - 1 + posters.length) % posters.length;
                const nextIndex = (currentIndex + 1) % posters.length;
                const isPrev = index === prevIndex;
                const isNext = index === nextIndex;

                return (
                  <div
                    key={index}
                    className={`absolute transition-all duration-500 ease-in-out ${
                      isActive
                        ? "z-20 scale-100 opacity-100"
                        : isPrev || isNext
                        ? "z-10 scale-75 opacity-60"
                        : "z-0 scale-50 opacity-0"
                    }`}
                    style={{
                      transform: isActive
                        ? "translateX(0)"
                        : isPrev
                        ? "translateX(-90%)"
                        : isNext
                        ? "translateX(90%)"
                        : "translateX(0)",
                    }}
                  >
                    <img
                      src={poster}
                      alt={`Movie poster ${index + 1}`}
                      className="w-48 h-72 md:w-56 md:h-80 rounded-lg shadow-2xl object-cover"
                    />
                  </div>
                );
              })}
            </div>

            {/* Dots indicator */}
            {posters.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                {posters.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "w-8 bg-white"
                        : "w-2 bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-600">Không có poster</div>
        )}
      </div>
    </section>
  );
};
