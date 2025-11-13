import { useState } from "react";
import { Filter } from "lucide-react";
import clsx from "clsx";
import MovieFilter from "@/components/moviesSearch/MovieFilter";

type Movie = {
  id: string;
  vi: string;
  en: string;
  poster: string;
  badges: string[]; // e.g ["P.ĐB", "Th.Minh"]
};

/* —— temporary mock — replace with API result —— */
const mockMovies: Movie[] = [
  {
    id: "xm1",
    vi: "Giáng Sinh Cùng Ex",
    en: "A Merry Little Ex-Mas",
    poster: "https://picsum.photos/seed/exmas/260/390",
    badges: ["P.ĐB"],
  },
  {
    id: "xm2",
    vi: "Khách Sạn Vườn Xoài",
    en: "Mango",
    poster: "https://picsum.photos/seed/mango/260/390",
    badges: ["P.ĐB"],
  },
  {
    id: "xm3",
    vi: "Frankenstein",
    en: "Frankenstein",
    poster: "https://picsum.photos/seed/frank/260/390",
    badges: ["P.ĐB", "Th.Minh"],
  },
  /* … thêm 18 phim để lấp grid … */
];

export default function MovieSearchPage() {
  const [movies] = useState<Movie[]>(mockMovies);
  const [showFilter, setShowFilter] = useState(false);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 text-white mt-8">
      {/* heading */}
      <h1 className="mb-6 text-2xl font-extrabold md:text-3xl">
        Tìm kiếm phim
      </h1>

      {/* filter btn (placeholder) */}
      <button
        onClick={() => setShowFilter((p) => !p)}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-red-500 hover:underline"
      >
        <Filter className="size-4" /> Bộ lọc
      </button>

      <MovieFilter open={showFilter} onClose={() => setShowFilter(false)} />

      {/* movie grid */}
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 mt-4">
        {movies.map((m) => (
          <div key={m.id}>
            {/* poster */}
            <div className="relative">
              <img
                src={m.poster}
                alt={m.vi}
                loading="lazy"
                className="h-[290px] w-full rounded-lg object-cover"
              />

              {/* badges */}
              <div className="absolute bottom-2 left-2 flex gap-1">
                {m.badges.map((b) => (
                  <span
                    key={b}
                    className={clsx(
                      "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                      b.includes("Th.Minh") ? "bg-emerald-600" : "bg-red-700"
                    )}
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* titles */}
            <p className="mt-2 truncate text-sm font-medium">{m.vi}</p>
            <p className="truncate text-xs text-zinc-400">{m.en}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
