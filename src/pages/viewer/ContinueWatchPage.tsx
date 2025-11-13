import { useState } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

type Movie = {
  id: string;
  vi: string;
  en: string;
  poster: string;
  age: string;
  type: string;
};

type Actor = { id: string; name: string; avatar: string };

const likedMovies: Movie[] = [
  {
    id: "marry-me",
    vi: "Hãy Lấy Em Đi",
    en: "Would You Marry Me?",
    poster: "https://i.imgur.com/dkypWk3.jpeg",
    age: "P0",
    type: "TM 10",
  },
  // … nhiều phim khác
];

const likedActors: Actor[] = [
  {
    id: "tom-cruise",
    name: "Tom Cruise",
    avatar: "https://i.pravatar.cc/160?img=33",
  },
  // …
];

export default function ContinueWatchPage() {
  const [tab, setTab] = useState<"movies" | "actors">("movies");
  const [movies, setMovies] = useState(likedMovies);
  const [actors, setActors] = useState(likedActors);

  const removeMovie = (id: string) =>
    setMovies((prev) => prev.filter((m) => m.id !== id));

  return (
    <section className="mx-auto max-w-6xl space-y-8 px-4 pb-24">
      {/* heading */}
      <h1 className="text-xl font-bold text-white">Continue Watching</h1>

      {/* toggle pills */}
      <div className="inline-flex rounded-full bg-zinc-800 p-1">
        {[{ key: "movies", label: "Phim" }].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={clsx(
              "min-w-[90px] rounded-full px-4 py-1.5 text-sm font-medium transition",
              tab === t.key
                ? "bg-white text-black"
                : "text-zinc-300 hover:bg-zinc-700/50"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* content grid */}
      {tab === "movies" ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {movies.map((m) => (
            <div
              key={m.id}
              className="group relative w-full overflow-hidden rounded-lg"
            >
              {/* remove btn */}
              <button
                onClick={() => removeMovie(m.id)}
                className="absolute right-1 top-1 z-10 hidden rounded bg-white/80 p-1 text-zinc-800 transition hover:bg-white group-hover:block"
              >
                <X className="size-3" />
              </button>

              {/* poster */}
              <img
                src={m.poster}
                alt={m.vi}
                className="aspect-[2/3] w-full rounded-lg object-cover"
              />

              {/* titles */}
              <div className="mt-1 space-y-0.5 text-center">
                <p className="truncate text-sm font-medium text-white">
                  {m.vi}
                </p>
                <p className="truncate text-[11px] text-zinc-400">{m.en}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {actors.map((a) => (
            <div
              key={a.id}
              className="flex flex-col items-center gap-2 rounded-lg bg-zinc-800/40 p-2 md:p-4"
            >
              <img
                src={a.avatar}
                alt={a.name}
                className="h-20 w-20 rounded-full object-cover md:h-24 md:w-24"
              />
              <p className="w-full truncate text-center text-sm font-medium text-white">
                {a.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
