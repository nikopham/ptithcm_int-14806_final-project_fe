import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { useSearchWatchedMoviesQuery } from "@/features/movie/movieApi";
import type { Movie, MovieSearchParams } from "@/types/movie";

export default function ContinueWatchPage() {
  const [page, setPage] = useState(1); // UI 1-based
  const [size] = useState(24);

  // You can extend filters later (countryIds, genreIds, sort, etc.)
  const params = useMemo<MovieSearchParams>(
    () => ({ page, size }),
    [page, size]
  );

  const { data, isLoading, isError } = useSearchWatchedMoviesQuery(params);
  const movies: Movie[] = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <section className="mx-auto max-w-7xl px-10 py-10 min-h-full">
      {/* heading */}
      <h1 className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900">Tiếp Tục Xem</h1>

      {isLoading && <div className="mt-6 text-sm text-gray-500">Đang tải…</div>}
      {isError && (
        <div className="mt-6 text-sm" style={{ color: "#C40E61" }}>Tải danh sách thất bại.</div>
      )}
      {!isLoading && !isError && movies.length === 0 && (
        <div className="mt-6 text-sm text-gray-500">
          Không có phim đã xem.
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
                <div className="relative overflow-hidden rounded-lg bg-white border border-gray-300">
                  <img
                    src={m.posterUrl}
                    alt={m.title}
                    loading="lazy"
                    className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                  
                  {/* Badges */}
                  <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                    {m.ageRating && (
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-white shadow-lg" style={{ backgroundColor: "#C40E61" }}>
                        {m.ageRating}
                      </span>
                    )}
                    {m.isSeries && (
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase bg-emerald-600 text-white shadow-lg">
                        Series
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Titles */}
                <div className="mt-2 space-y-1">
                  <p className="truncate text-xs sm:text-sm font-medium transition-colors" style={{ color: "#C40E61" }}>
                    {m.title}
                  </p>
                  <p className="truncate text-[10px] sm:text-xs text-gray-500">
                    {m.originalTitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 sm:mt-8 pb-6 flex items-center justify-center gap-2 sm:gap-3">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={clsx(
                  "rounded border px-2.5 sm:px-3 py-1 text-xs sm:text-sm transition text-white",
                  page <= 1
                    ? "border-gray-300 bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "hover:opacity-90"
                )}
                style={page > 1 ? { backgroundColor: "#C40E61", borderColor: "#C40E61" } : undefined}
              >
                Trước
              </button>
              <span className="text-xs sm:text-sm text-gray-500">
                Trang {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={clsx(
                  "rounded border px-2.5 sm:px-3 py-1 text-xs sm:text-sm transition text-white",
                  page >= totalPages
                    ? "border-gray-300 bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "hover:opacity-90"
                )}
                style={page < totalPages ? { backgroundColor: "#C40E61", borderColor: "#C40E61" } : undefined}
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
