import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Filter } from "lucide-react";
import clsx from "clsx";
import MovieFilter from "@/components/moviesSearch/MovieFilter";
import { useSearchMoviesQuery } from "@/features/movie/movieApi";
import type { AgeRating } from "@/types/movie";
import type { Movie } from "@/types/movie";

/* —— temporary mock — replace with API result —— */
// Keeping placeholder type but no longer using the mock data

export default function MovieSearchPage() {
  const location = useLocation();
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<{
    countryIds?: number[];
    genreIds?: number[];
    isSeries?: boolean;
    ageRating?: AgeRating;
    releaseYear?: number;
    sort?: string;
  }>({});
  const [page, setPage] = useState(1); // UI 1-based
  const [size] = useState(24);

  // Read `genre` from query string and apply to filters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const genreParam = params.get("genre");
    const releaseYearParam = params.get("releaseYear");
    if (genreParam) {
      const asNumber = Number(genreParam);
      const genreId = Number.isNaN(asNumber) ? undefined : asNumber;

      setFilters((prev) => ({
        ...prev,
        genreIds: genreId !== undefined ? [genreId] : prev.genreIds,
      }));
      setPage(1);
    }
    if (releaseYearParam) {
      const asNumber = Number(releaseYearParam);
      const releaseYear = Number.isNaN(asNumber) ? undefined : asNumber;
      setFilters((prev) => ({
        ...prev,
        releaseYear: releaseYear,
      }));
      setPage(1);
    } 
  }, [location.search]);

  const params = useMemo(
    () => ({
      ...filters,
      page,
      size,
    }),
    [filters, page, size]
  );

  const { data, isLoading, isError } = useSearchMoviesQuery(params);
  const resultMovies: Movie[] = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  // Auto open filter panel when a genre is preselected from URL
  useEffect(() => {
    if (filters.genreIds && filters.genreIds.length > 0) {
      setShowFilter(true);
    }
    if (filters.releaseYear !== undefined) {
      setShowFilter(true);
    }
  }, [filters.genreIds, filters.releaseYear]);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 text-gray-900 mt-8">
      {/* heading */}
      <h1 className="mb-6 text-2xl font-extrabold md:text-3xl text-gray-900">
        Tìm kiếm phim
      </h1>

      {/* filter btn (placeholder) */}
      <button
        onClick={() => setShowFilter((p) => !p)}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium hover:underline"
        style={{ color: "#C40E61" }}
      >
        <Filter className="size-4" /> Bộ lọc
      </button>

      <MovieFilter
        open={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={(f) => {
          setFilters(f);
          setPage(1);
          setShowFilter(false);
        }}
        initialReleaseYear={filters.releaseYear}
        initialGenreIds={filters.genreIds}
      />

      {/* results */}
      {isLoading && <div className="mt-6 text-sm text-gray-500">Đang tải…</div>}
      {isError && (
        <div className="mt-6 text-sm" style={{ color: "#C40E61" }}>Tải danh sách thất bại.</div>
      )}
      {!isLoading && !isError && resultMovies.length === 0 && (
        <div className="mt-6 text-sm text-gray-500">Không có kết quả.</div>
      )}

      {!isLoading && !isError && resultMovies.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mt-4">
            {resultMovies.map((m) => (
              <Link
                key={m.id}
                to={`/movie/detail/${m.id}`}
                className="group block transform transition-all duration-200 hover:scale-105 hover:z-10"
              >
                {/* poster */}
                <div className="relative overflow-hidden rounded-lg bg-white border border-gray-300">
                  <img
                    src={m.posterUrl}
                    alt={m.title}
                    loading="lazy"
                    className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-110"
                  />

                  {/* badges */}
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
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                </div>

                {/* titles */}
                <div className="mt-2 space-y-1">
                  <p className="truncate text-sm font-medium transition-colors" style={{ color: "#C40E61" }}>
                    {m.title}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {m.originalTitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={clsx(
                  "rounded border px-3 py-1 text-sm transition",
                  page <= 1
                    ? "border-gray-300 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 hover:bg-gray-50"
                )}
                style={page > 1 ? { color: "#C40E61", borderColor: "#C40E61" } : undefined}
              >
                Trước
              </button>
              <span className="text-xs text-gray-500">
                Trang {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={clsx(
                  "rounded border px-3 py-1 text-sm transition",
                  page >= totalPages
                    ? "border-gray-300 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 hover:bg-gray-50"
                )}
                style={page < totalPages ? { color: "#C40E61", borderColor: "#C40E61" } : undefined}
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
