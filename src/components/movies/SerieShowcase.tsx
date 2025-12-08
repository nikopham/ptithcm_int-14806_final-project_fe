import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { useGetFeaturedGenresQuery } from "@/features/genre/genreApi";
import type { GenreWithMovies, MovieShort } from "@/types/home";
import { useGetTop10MovieQuery } from "@/features/movie/movieApi";

// TV showcase will render featured genres with isSeries=true

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
        "grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-md bg-zinc-800 text-white transition",
        page === 0 ? "opacity-40 cursor-not-allowed" : "hover:bg-zinc-700"
      )}
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
            i === page ? "bg-red-500" : "bg-zinc-600"
          )}
        />
      ))}
    </div>
    <button
      onClick={next}
      disabled={page === total - 1}
      className={clsx(
        "grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-md bg-zinc-800 text-white transition",
        page === total - 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-zinc-700"
      )}
      aria-label="Next page"
    >
      <ArrowRight className="size-3.5 sm:size-4" />
    </button>
  </div>
);

const TvThumb = ({ m }: { m: MovieShort }) => (
  <Link
    to={`/movie/detail/${m.id}`}
    className="group block overflow-hidden rounded-lg bg-zinc-900 transition-all duration-200 hover:-translate-y-1 hover:bg-zinc-800 hover:shadow-lg"
  >
    <div className="relative overflow-hidden">
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
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
    </div>
    <div className="px-2 sm:px-3 py-2">
      <p className="text-xs sm:text-sm text-white line-clamp-2 group-hover:text-red-500 transition-colors">
        {m.title}
      </p>
    </div>
  </Link>
);

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
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">{title}</h2>
        <NavControl
          page={page}
          total={total}
          prev={() => setPage((p) => Math.max(p - 1, 0))}
          next={() => setPage((p) => Math.min(p + 1, total - 1))}
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        {slice.map((m) => (
          <TvThumb key={m.id} m={m} />
        ))}
      </div>
    </div>
  );
};

const SectionTrending = () => {
  const {
    data: top10,
    isLoading,
    error,
  } = useGetTop10MovieQuery({ isSeries: true });
  const PER_PAGE = 6;
  const [page, setPage] = useState(0);
  const list = top10 ?? [];
  const total = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const slice = list.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <div className="mb-12 sm:mb-16">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">Đang Thịnh Hành</h2>
        <NavControl
          page={page}
          total={total}
          prev={() => setPage((p) => Math.max(p - 1, 0))}
          next={() => setPage((p) => Math.min(p + 1, total - 1))}
        />
      </div>
      {isLoading && (
        <div className="text-sm text-zinc-400">Đang tải phim thịnh hành...</div>
      )}
      {!!error && !isLoading && (
        <div className="text-sm text-red-400">Không thể tải phim thịnh hành.</div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        {slice.map((m) => (
          <TvThumb key={m.id} m={m} />
        ))}
      </div>
    </div>
  );
};


/* ------------------------------------------------------------------ */
/*  Main exported showcase                                            */
/* ------------------------------------------------------------------ */
export const SerieShowcase = () => {
  const {
    data: featured,
    isLoading,
    error,
  } = useGetFeaturedGenresQuery({ isSeries: true });

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 pb-16 sm:pb-24 mt-8 sm:mt-12">
      <span className="mb-4 sm:mb-6 inline-block rounded-md bg-red-600 px-4 sm:px-5 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-white">
        Phim Bộ
      </span>

      {isLoading && (
        <div className="mb-8 text-sm text-zinc-400">Đang tải thể loại...</div>
      )}
      {!!error && !isLoading && (
        <div className="mb-8 text-sm text-red-400">Không thể tải thể loại.</div>
      )}

      {(featured || []).map((g: GenreWithMovies) => (
        <GenreRow key={g.genreId} title={g.genreName} movies={g.movies || []} />
      ))}

      <SectionTrending />
    </section>
  );
};
