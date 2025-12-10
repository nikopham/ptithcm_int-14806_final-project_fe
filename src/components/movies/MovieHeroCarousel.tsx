import { useEffect, useMemo, useState } from "react";
import {
  Play,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { useGetTop10MovieQuery, useToggleLikeMovieMutation } from "@/features/movie/movieApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { AuthDialog } from "../auth/AuthDialog";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Demo data (fallback)                                              */
/* ------------------------------------------------------------------ */
interface Slide {
  id: string;
  title: string;
  overview: string;
  backdrop: string; // 16:9 image url
}

const SLIDES: Slide[] = [
  {
    id: "avengers-endgame",
    title: "Avengers : Endgame",
    overview:
      "With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos’s actions and undo the chaos to the universe, no matter what consequences may be in store, and no matter who they face… Avenge the fallen.",
    backdrop:
      "https://image.tmdb.org/t/p/original/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
  },
  {
    id: "oppenheimer",
    title: "Oppenheimer",
    overview:
      "The story of J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    backdrop:
      "https://image.tmdb.org/t/p/original/fNitvV5rKnrkag9i2cTDkWQmGK1.jpg",
  },
  {
    id: "dune-part-2",
    title: "Dune : Part 2",
    overview:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    backdrop:
      "https://image.tmdb.org/t/p/original/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export const MovieHeroCarousel = () => {
  const [idx, setIdx] = useState(0);
  const [likedMovies, setLikedMovies] = useState<Record<string, boolean>>({});
  const [authOpen, setAuthOpen] = useState(false);

  const isAuth = useSelector((s: RootState) => s.auth.isAuth);
  const [toggleLike, { isLoading: toggling }] = useToggleLikeMovieMutation();

  // Fetch top 10 movies and pick at most 5 for the hero
  const { data: top10 } = useGetTop10MovieQuery({ isSeries: false });
  const apiSlides = useMemo(() => {
    const list = (top10 ?? []).slice(0, 5);
    return list.map((m) => ({
      id: m.id,
      title: m.title,
      overview: "",
      backdrop: m.backdropUrl || "/placeholder.svg",
      isLiked: (m as any).isLiked ?? false,
    }));
  }, [top10]);

  const slides = apiSlides.length > 0 ? apiSlides : SLIDES;

  // Initialize liked state from API data
  useEffect(() => {
    const liked: Record<string, boolean> = {};
    apiSlides.forEach((m) => {
      if ((m as any).isLiked !== undefined) {
        liked[m.id] = (m as any).isLiked;
      }
    });
    setLikedMovies((prev) => ({ ...prev, ...liked }));
  }, [apiSlides]);

  // Clamp current index when slides length changes
  useEffect(() => {
    if (idx >= slides.length) setIdx(0);
  }, [slides.length, idx]);

  const next = () => setIdx((i) => (i + 1) % slides.length);
  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);

  const slide = slides[idx];
  const isLiked = likedMovies[slide.id] ?? false;

  const handleToggleLike = async () => {
    if (!isAuth) {
      setAuthOpen(true);
      return;
    }
    try {
      await toggleLike(slide.id).unwrap();
      setLikedMovies((prev) => {
        const next = { ...prev, [slide.id]: !prev[slide.id] };
        toast.success(
          next[slide.id] ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích"
        );
        return next;
      });
    } catch {
      toast.error("Không thể cập nhật trạng thái yêu thích");
    }
  };

  return (
    <div className="relative mx-auto max-w-7xl overflow-hidden rounded-xl px-3 sm:px-4">
      <div className="relative aspect-video w-full">
        {/* backdrop full-cover */}
        <img
          src={slide.backdrop}
          alt={slide.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* overlay đen bán trong suốt */}
        <div className="absolute inset-0 bg-black/60" />

        {/* content center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 text-center">
          <h1 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            {slide.title}
          </h1>
          {slide.overview && (
            <p className="mx-auto mb-6 sm:mb-8 max-w-3xl text-xs sm:text-sm leading-relaxed text-zinc-300 line-clamp-2 sm:line-clamp-3">
              {slide.overview}
            </p>
          )}

          {/* action row */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              to={`/movie/detail/${slide.id}`}
              className="inline-flex h-10 sm:h-11 items-center gap-2 rounded-md px-4 sm:px-6 text-xs sm:text-sm font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: "#C40E61" }}
            >
              <Play className="size-3.5 sm:size-4 -translate-x-0.5" />
              Xem Ngay
            </Link>
            <button
              onClick={handleToggleLike}
              disabled={toggling}
              className={clsx(
                "grid h-10 sm:h-11 w-10 sm:w-11 place-items-center rounded-md border-2 transition-all duration-200",
                isLiked
                  ? "bg-[#C40E61] border-[#C40E61] hover:opacity-90 shadow-lg"
                  : "bg-white/90 backdrop-blur-sm border-[#C40E61] hover:bg-white hover:shadow-lg hover:scale-105"
              )}
              title={isLiked ? "Bỏ thích" : "Thích"}
              aria-label={isLiked ? "Bỏ thích phim" : "Thích phim"}
            >
              <ThumbsUp
                className={clsx(
                  "size-4 sm:size-5 transition-colors",
                  isLiked ? "text-white" : "text-[#C40E61]"
                )}
              />
            </button>
          </div>
        </div>

        {/* Auth Dialog */}
        <AuthDialog
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          defaultTab="login"
        />

        {/* nav arrows */}
        <button
          onClick={prev}
          className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 rounded-md p-1.5 sm:p-2 text-white transition hover:opacity-90"
          style={{ backgroundColor: "#C40E61" }}
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-4 sm:size-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 rounded-md p-1.5 sm:p-2 text-white transition hover:opacity-90"
          style={{ backgroundColor: "#C40E61" }}
          aria-label="Next slide"
        >
          <ChevronRight className="size-4 sm:size-5" />
        </button>

        {/* dot indicators */}
        <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 left-1/2 flex -translate-x-1/2 gap-1.5 sm:gap-2">
          {slides.map((_, i) => (
            <span
              key={i}
              className={clsx(
                "h-1 w-6 sm:w-8 rounded-full transition",
                i === idx ? "" : "bg-gray-300"
              )}
              style={i === idx ? { backgroundColor: "#C40E61" } : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
