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
  <div className="flex items-center gap-3">
    <button
      onClick={prev}
      disabled={page === 0}
      className={clsx(
        "grid h-9 w-9 place-items-center rounded-md bg-zinc-800 text-white",
        page === 0 ? "opacity-40" : "hover:bg-zinc-700"
      )}
    >
      <ArrowLeft className="size-4" />
    </button>
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={clsx(
            "h-1 w-5 rounded-full",
            i === page ? "bg-red-500" : "bg-zinc-600"
          )}
        />
      ))}
    </div>
    <button
      onClick={next}
      disabled={page === total - 1}
      className={clsx(
        "grid h-9 w-9 place-items-center rounded-md bg-zinc-800 text-white",
        page === total - 1 ? "opacity-40" : "hover:bg-zinc-700"
      )}
    >
      <ArrowRight className="size-4" />
    </button>
  </div>
);

const MovieThumb = ({ m }: { m: MovieShort }) => (
  <Link
    to={`/movie/detail/${m.id}`}
    className="w-[180px] shrink-0 overflow-hidden rounded-xl bg-zinc-900 transition hover:-translate-y-1 hover:bg-zinc-800"
  >
    <img
      src={
        typeof m.posterUrl === "string" && m.posterUrl
          ? m.posterUrl
          : "/placeholder.svg"
      }
      alt={m.title}
      className="h-60 w-full object-cover"
      loading="lazy"
    />
    <div className="px-3 py-2 text-sm text-white line-clamp-2">{m.title}</div>
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
    <div className="mb-16">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-white">Trending Now</h2>
        <NavControl
          page={page}
          total={total}
          prev={() => setPage((p) => Math.max(p - 1, 0))}
          next={() => setPage((p) => Math.min(p + 1, total - 1))}
        />
      </div>
      {isLoading && (
        <div className="text-sm text-zinc-400">Loading trending...</div>
      )}
      {!!error && !isLoading && (
        <div className="text-sm text-red-400">Failed to load trending.</div>
      )}
      <div className="flex gap-8">
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
    <div className="mb-16">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-white">{title}</h2>
        <NavControl
          page={page}
          total={total}
          prev={() => setPage((p) => Math.max(p - 1, 0))}
          next={() => setPage((p) => Math.min(p + 1, total - 1))}
        />
      </div>
      <div className="flex gap-8">
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
    <section className="mx-auto max-w-7xl px-4 pb-24 mt-12">
      <span className="mb-6 inline-block rounded-md bg-red-600 px-5 py-1.5 text-sm font-medium text-white">
        Movies
      </span>

      {isLoading && (
        <div className="mb-8 text-sm text-zinc-400">Loading genres...</div>
      )}
      {!!error && !isLoading && (
        <div className="mb-8 text-sm text-red-400">Failed to load genres.</div>
      )}

      {(featured || []).map((g: GenreWithMovies) => (
        <GenreRow key={g.genreId} title={g.genreName} movies={g.movies || []} />
      ))}

      <SectionTrending />
    </section>
  );
};
