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
    <section className="mx-auto max-w-7xl space-y-8 px-4 pb-24 text-white mt-8">
      {/* heading */}
      <h1 className="text-2xl font-extrabold md:text-3xl">Continue Watching</h1>

      {isLoading && <div className="mt-6 text-sm text-zinc-400">Đang tải…</div>}
      {isError && (
        <div className="mt-6 text-sm text-red-400">Tải danh sách thất bại.</div>
      )}
      {!isLoading && !isError && movies.length === 0 && (
        <div className="mt-6 text-sm text-zinc-400">
          Không có phim đã xem.
        </div>
      )}

      {!isLoading && !isError && movies.length > 0 && (
        <>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 mt-4">
            {movies.map((m) => (
              <Link
                key={m.id}
                to={`/movie/detail/${m.id}`}
                className="block transform transition-transform duration-200 hover:scale-105"
              >
                <div className="relative">
                  <img
                    src={m.posterUrl}
                    alt={m.title}
                    loading="lazy"
                    className="h-[290px] w-full rounded-lg object-cover"
                  />
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    {m.ageRating && (
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase bg-red-700">
                        {m.ageRating}
                      </span>
                    )}
                    {m.isSeries && (
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase bg-emerald-600">
                        Series
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-2 truncate text-sm font-medium">{m.title}</p>
                <p className="truncate text-xs text-zinc-400">
                  {m.originalTitle}
                </p>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={clsx(
                  "rounded border px-3 py-1 text-sm",
                  page <= 1
                    ? "border-zinc-700 text-zinc-500"
                    : "border-zinc-600 text-zinc-200 hover:bg-zinc-800"
                )}
              >
                Trước
              </button>
              <span className="text-xs text-zinc-400">
                Trang {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={clsx(
                  "rounded border px-3 py-1 text-sm",
                  page >= totalPages
                    ? "border-zinc-700 text-zinc-500"
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
