import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { Link } from "react-router-dom";

/* ------------------------------------------------------------------ */
/*  MOCK DATA – replace with API                                       */
/* ------------------------------------------------------------------ */
interface GenreCard {
  id: string;
  name: string;
  posters: string[]; // 4 image URLs 2×2
}

const GENRES: GenreCard[] = [
  /* ---------- Our Genres --------- */
  {
    id: "action",
    name: "Action",
    posters: [
      "https://image.tmdb.org/t/p/w300/8uO0gUM8aNqYLs1OsTBQiXu0fEv.jpg",
      "https://image.tmdb.org/t/p/w300/6WBeq4fCfn7AN0o21W9qNcRF2l9.jpg",
      "https://image.tmdb.org/t/p/w300/pThyQovXQrw2m0s9x82twj48Jq4.jpg",
      "https://image.tmdb.org/t/p/w300/q719jXXEzOoYaps6babgKnONONX.jpg",
    ],
  },
  /* … Adventure, Comedy, Drama, Horror … */
];

/* For “Top 10 In” section you may reuse the same array or filter         */
const TOP10 = GENRES;

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

const GenreCard = ({ g, badge }: { g: GenreCard; badge?: boolean }) => (
  <Link
    to={`/movies?genre=${g.id}`}
    className="w-[220px] flex-shrink-0 rounded-xl bg-zinc-900 p-4 transition hover:-translate-y-1 hover:bg-zinc-800"
  >
    <div className="grid grid-cols-2 gap-2 pb-4">
      {g.posters.slice(0, 4).map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          loading="lazy"
          className="h-24 w-full rounded-md object-cover"
        />
      ))}
    </div>

    <div className="flex items-end justify-between">
      <div className="flex flex-col">
        {badge && (
          <span className="mb-1 inline-block rounded bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">
            Top 10 In
          </span>
        )}
        <span className="font-medium text-white">{g.name}</span>
      </div>
      <ArrowRight className="size-4 text-zinc-400 transition group-hover:translate-x-1 group-hover:text-white" />
    </div>
  </Link>
);

/* ------------------------------------------------------------------ */
/*  Section builder                                                    */
/* ------------------------------------------------------------------ */
const Section = ({
  title,
  data,
  badge = false,
}: {
  title: string;
  data: GenreCard[];
  badge?: boolean;
}) => {
  const PER_PAGE = 5;
  const total = Math.ceil(data.length / PER_PAGE);
  const [page, setPage] = useState(0);

  const slice = data.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <div className="mb-16">
      {/* title + nav */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-white">{title}</h2>
        <NavControl
          page={page}
          total={total}
          prev={() => setPage((p) => Math.max(p - 1, 0))}
          next={() => setPage((p) => Math.min(p + 1, total - 1))}
        />
      </div>

      {/* cards */}
      <div className="flex gap-6">
        {slice.map((g) => (
          <GenreCard key={g.id} g={g} badge={badge} />
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main exported showcase                                            */
/* ------------------------------------------------------------------ */
export const SerieShowcase = () => (
  <section className="mx-auto max-w-7xl px-4 pb-24 mt-12">
    <span className="mb-6 inline-block rounded-md bg-red-600 px-5 py-1.5 text-sm font-medium text-white">
      TV Series
    </span>
    <Section title="Our Genres" data={GENRES} />
    <Section title="Popular Top 10 In Genres" data={TOP10} badge />
  </section>
);
