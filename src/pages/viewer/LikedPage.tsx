import { useMemo, useState } from "react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import {
  useSearchMoviesLikedQuery,
  useToggleLikeMovieMutation,
} from "@/features/movie/movieApi";
import type { Movie, MovieSearchParams } from "@/types/movie";
import { ArchiveX, ThumbsUp } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { toast } from "sonner";

export default function LikedPage() {
  const [page, setPage] = useState(1); // UI 1-based
  const [size] = useState(24);
  const isAuth = useAppSelector((s) => s.auth.isAuth);
  const [busyId, setBusyId] = useState<number | null>(null);

  // You can extend filters later (countryIds, genreIds, sort, etc.)
  const params = useMemo<MovieSearchParams>(
    () => ({ page, size }),
    [page, size]
  );

  const { data, isLoading, isError, refetch } =
    useSearchMoviesLikedQuery(params);
  const [toggleLike] = useToggleLikeMovieMutation();
  const movies: Movie[] = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const handleToggleLike = async (movieId: number, title: string) => {
    if (!isAuth) {
      toast.error("Bạn cần đăng nhập để thao tác.");
      return;
    }
    try {
      setBusyId(movieId);
      await toggleLike(movieId).unwrap();
      toast.success(`Đã bỏ thích: ${title}`);
      await refetch();
    } catch {
      toast.error("Không thể cập nhật trạng thái thích.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 pb-16 sm:pb-24 text-white mt-6 sm:mt-8">
      <h1 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl font-extrabold">Liked Movie</h1>

      {isLoading && <div className="mt-6 text-sm text-zinc-400">Đang tải…</div>}
      {isError && (
        <div className="mt-6 text-sm text-red-400">Tải danh sách thất bại.</div>
      )}
      {!isLoading && !isError && movies.length === 0 && (
        <div className="mt-6 text-sm text-zinc-400">
          Không có phim yêu thích.
        </div>
      )}

      {!isLoading && !isError && movies.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mt-4">
            {movies.map((m) => (
              <Link
                key={m.id}
                to={`/movie/detail/${m.id}`}
                className="group block transform transition-all duration-200 hover:scale-105 hover:z-10"
              >
                <div className="relative overflow-hidden rounded-lg bg-zinc-900">
                  <img
                    src={m.posterUrl}
                    alt={m.title}
                    loading="lazy"
                    className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                  
                  {/* Badges */}
                  <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                    {m.ageRating && (
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase bg-red-700 text-white shadow-lg">
                        {m.ageRating}
                      </span>
                    )}
                    {m.isSeries && (
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase bg-emerald-600 text-white shadow-lg">
                        Series
                      </span>
                    )}
                  </div>
                  
                  {/* Quick toggle like status */}
                  <button
                    type="button"
                    aria-label="Toggle like"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleLike(m.id, m.title);
                    }}
                    disabled={busyId === m.id}
                    className={clsx(
                      "absolute right-2 top-2 inline-flex items-center justify-center rounded-md border backdrop-blur transition",
                      "px-2 py-1.5 sm:px-2.5 sm:py-1.5",
                      "bg-black/40 border-zinc-700 text-zinc-200",
                      busyId === m.id
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-black/60 hover:border-zinc-600"
                    )}
                  >
                    <ArchiveX className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </div>
                
                {/* Titles */}
                <div className="mt-2 space-y-1">
                  <p className="truncate text-xs sm:text-sm font-medium text-white group-hover:text-red-500 transition-colors">
                    {m.title}
                  </p>
                  <p className="truncate text-[10px] sm:text-xs text-zinc-400">
                    {m.originalTitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 sm:gap-3">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={clsx(
                  "rounded border px-2.5 sm:px-3 py-1 text-xs sm:text-sm transition",
                  page <= 1
                    ? "border-zinc-700 text-zinc-500 cursor-not-allowed"
                    : "border-zinc-600 text-zinc-200 hover:bg-zinc-800"
                )}
              >
                Trước
              </button>
              <span className="text-xs sm:text-sm text-zinc-400">
                Trang {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={clsx(
                  "rounded border px-2.5 sm:px-3 py-1 text-xs sm:text-sm transition",
                  page >= totalPages
                    ? "border-zinc-700 text-zinc-500 cursor-not-allowed"
                    : "border-zinc-600 text-zinc-200 hover:bg-zinc-800"
                )}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
