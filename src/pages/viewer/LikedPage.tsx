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
    <section className="mx-auto max-w-7xl px-4 pb-24 text-white mt-8">
      <h1 className="mb-6 text-2xl font-extrabold md:text-3xl">Liked Movie</h1>

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
                    {(m as Movie & { series?: boolean }).series && (
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase bg-emerald-600">
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
                      "absolute right-2 top-2 inline-flex items-center justify-center rounded-md border px-2.5 py-1.5",
                      "backdrop-blur bg-black/40 border-zinc-700 text-zinc-200",
                      busyId === m.id
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-black/55"
                    )}
                  >
                    <ArchiveX className="h-4 w-4" />
                  </button>
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
