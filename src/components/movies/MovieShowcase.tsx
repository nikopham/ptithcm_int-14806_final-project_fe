import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { useGetFeaturedGenresQuery } from "@/features/genre/genreApi";
import { useGetTop10MovieQuery } from "@/features/movie/movieApi";
import type { GenreWithMovies, MovieShort } from "@/types/home";

/* For “Top 10 In” section keep mock (placeholder demo) */
// You can later swap this with a real API

/* ------------------------------------------------------------------ */
/*  REUSABLE COMPONENTS                                                */
/* ------------------------------------------------------------------ */
const NavControl = ({
  page,
  total,
  prev,
  next,
}: {
  page: number;
  total: number;
  prev: () => void;
  next: () => void;
}) => (
  <div className="flex items-center gap-2 sm:gap-3">
    <button
      onClick={prev}
      disabled={page === 0}
      className={clsx(
        "grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-md text-white transition",
        page === 0 ? "opacity-40 cursor-not-allowed bg-gray-300" : "hover:opacity-90"
      )}
      style={page !== 0 ? { backgroundColor: "#C40E61" } : undefined}
      aria-label="Previous page"
    >
      <ArrowLeft className="size-3.5 sm:size-4" />
    </button>
    <div className="hidden sm:flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={clsx(
            "h-1 w-4 sm:w-5 rounded-full transition",
            i === page ? "" : "bg-gray-300"
          )}
          style={i === page ? { backgroundColor: "#C40E61" } : undefined}
        />
      ))}
    </div>
    <button
      onClick={next}
      disabled={page === total - 1}
      className={clsx(
        "grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-md text-white transition",
        page === total - 1 ? "opacity-40 cursor-not-allowed bg-gray-300" : "hover:opacity-90"
      )}
      style={page !== total - 1 ? { backgroundColor: "#C40E61" } : undefined}
      aria-label="Next page"
    >
      <ArrowRight className="size-3.5 sm:size-4" />
    </button>
  </div>
);

const MovieThumb = ({ m }: { m: MovieShort }) => (
  <Link
    to={`/movie/detail/${m.id}`}
    className="group block transform transition-all duration-200 hover:scale-105 hover:z-10"
  >
    {/* poster */}
    <div className="relative overflow-hidden rounded-lg bg-white border border-gray-300">
      <img
        src={
          typeof m.posterUrl === "string" && m.posterUrl
            ? m.posterUrl
            : "/placeholder.svg"
        }
        alt={m.title}
        className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-110"
        loading="lazy"
      />
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
);

/* ---------- SectionTrending (reuse NavControl) ------------------ */
const SectionTrending = () => {
  const {
    data: top10,
    isLoading,
    error,
  } = useGetTop10MovieQuery({ isSeries: false });
  const PER_PAGE = 6;
  const [page, setPage] = useState(0);
  const list = top10 ?? [];
  const total = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const slice = list.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <div className="mb-12 sm:mb-16">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Đang Thịnh Hành</h2>
        <NavControl
          page={page}
          total={total}
          prev={() => setPage((p) => Math.max(p - 1, 0))}
          next={() => setPage((p) => Math.min(p + 1, total - 1))}
        />
      </div>
      {isLoading && (
        <div className="text-sm text-gray-500">Đang tải phim thịnh hành...</div>
      )}
      {!!error && !isLoading && (
        <div className="text-sm" style={{ color: "#C40E61" }}>Không thể tải phim thịnh hành.</div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        {slice.map((m) => (
          <MovieThumb key={m.id} m={m} />
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Section builder                                                    */
/* ------------------------------------------------------------------ */
const GenreRow = ({
  title,
  movies,
}: {
  title: string;
  movies: MovieShort[];
}) => {
  const PER_PAGE = 6;
  const total = Math.max(1, Math.ceil(movies.length / PER_PAGE));
  const [page, setPage] = useState(0);
  const slice = movies.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <div className="mb-12 sm:mb-16">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">{title}</h2>
        <NavControl
          page={page}
          total={total}
          prev={() => setPage((p) => Math.max(p - 1, 0))}
          next={() => setPage((p) => Math.min(p + 1, total - 1))}
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        {slice.map((m) => (
          <MovieThumb key={m.id} m={m} />
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main exported showcase                                            */
/* ------------------------------------------------------------------ */
export const MovieShowcase = () => {
  const {
    data: featured,
    isLoading,
    error,
  } = useGetFeaturedGenresQuery({ isSeries: false });

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 pb-16 sm:pb-24 mt-8 sm:mt-12">
      <span className="mb-4 sm:mb-6 inline-block rounded-md px-4 sm:px-5 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-white" style={{ backgroundColor: "#C40E61" }}>
        Phim
      </span>

      {isLoading && (
        <div className="mb-8 text-sm text-gray-500">Đang tải thể loại...</div>
      )}
      {!!error && !isLoading && (
        <div className="mb-8 text-sm" style={{ color: "#C40E61" }}>Không thể tải thể loại.</div>
      )}

      {(featured || []).map((g: GenreWithMovies) => (
        <GenreRow key={g.genreId} title={g.genreName} movies={g.movies || []} />
      ))}

      <SectionTrending />
    </section>
  );
};
