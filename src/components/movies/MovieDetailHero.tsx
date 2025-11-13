import { useState } from "react";
import {
  Play,
  Plus,
  ThumbsUp,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { Link } from "react-router-dom";

interface Props {
  title: string;
  overview: string;
  backdrops: string[]; // ≥1 image URLs (16:9)
  id: string; // movie / show slug or TMDB id
}

export const MovieDetailHero = ({ title, overview, backdrops, id }: Props) => {
  const [idx, setIdx] = useState(0);
  const [mute, setMute] = useState(true);

  const total = backdrops.length;
  const next = () => setIdx((i) => (i + 1) % total);
  const prev = () => setIdx((i) => (i - 1 + total) % total);

  const img = backdrops[idx];

  return (
    <div className="relative mx-auto max-w-7xl overflow-hidden rounded-xl">
      {/* === image giữ tỉ lệ 16:9 === */}
      <div className="relative aspect-video w-full">
        <img
          src={img}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />

        {/* content center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <h1 className="mb-4 text-3xl font-extrabold text-white md:text-4xl">
            {title}
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-sm leading-relaxed text-zinc-300">
            {overview}
          </p>

          {/* action row */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to={`/watch/${id}`}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-red-600 px-6 text-sm font-medium text-white transition hover:bg-red-700"
            >
              <Play className="size-4 -translate-x-0.5" />
              Play Now
            </Link>

            <button className="grid h-11 w-11 place-items-center rounded-md border border-zinc-600 bg-zinc-800 text-white transition hover:bg-zinc-700">
              <Plus className="size-4" />
            </button>
            <button className="grid h-11 w-11 place-items-center rounded-md border border-zinc-600 bg-zinc-800 text-white transition hover:bg-zinc-700">
              <ThumbsUp className="size-4" />
            </button>
            <button
              onClick={() => setMute((m) => !m)}
              className="grid h-11 w-11 place-items-center rounded-md border border-zinc-600 bg-zinc-800 text-white transition hover:bg-zinc-700"
            >
              {mute ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </button>
          </div>
        </div>

        {/* nav arrows (only show if >1 image) */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-6 top-1/2 -translate-y-1/2 rounded-md bg-zinc-900/70 p-2 text-white transition hover:bg-zinc-900"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-6 top-1/2 -translate-y-1/2 rounded-md bg-zinc-900/70 p-2 text-white transition hover:bg-zinc-900"
            >
              <ChevronRight className="size-5" />
            </button>

            {/* dot bar */}
            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
              {backdrops.map((_, i) => (
                <span
                  key={i}
                  className={clsx(
                    "h-1 w-8 rounded-full transition",
                    i === idx ? "bg-red-500" : "bg-zinc-600"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
