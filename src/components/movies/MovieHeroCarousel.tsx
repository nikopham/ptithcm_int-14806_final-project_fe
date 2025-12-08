import { useEffect, useMemo, useState } from "react";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  Plus,
  ThumbsUp,
  Volume2,
  VolumeX,
} from "lucide-react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { useGetTop10MovieQuery } from "@/features/movie/movieApi";

/* ------------------------------------------------------------------ */
/*  Demo data (fallback)                                              */
/* ------------------------------------------------------------------ */
interface Slide {
  id: string;
  title: string;
  overview: string;
  backdrop: string; // 16:9 image url
}

const SLIDES: Slide[] = [
  {
    id: "avengers-endgame",
    title: "Avengers : Endgame",
    overview:
      "With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos’s actions and undo the chaos to the universe, no matter what consequences may be in store, and no matter who they face… Avenge the fallen.",
    backdrop:
      "https://image.tmdb.org/t/p/original/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
  },
  {
    id: "oppenheimer",
    title: "Oppenheimer",
    overview:
      "The story of J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    backdrop:
      "https://image.tmdb.org/t/p/original/fNitvV5rKnrkag9i2cTDkWQmGK1.jpg",
  },
  {
    id: "dune-part-2",
    title: "Dune : Part 2",
    overview:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    backdrop:
      "https://image.tmdb.org/t/p/original/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export const MovieHeroCarousel = () => {
  const [idx, setIdx] = useState(0);
  const [mute, setMute] = useState(true);

  // Fetch top 10 movies and pick at most 5 for the hero
  const { data: top10 } = useGetTop10MovieQuery({ isSeries: null });
  const apiSlides = useMemo(() => {
    const list = (top10 ?? []).slice(0, 5);
    return list.map((m) => ({
      id: m.id,
      title: m.title,
      overview: "",
      backdrop: m.backdropUrl || "/placeholder.svg",
    }));
  }, [top10]);

  const slides = apiSlides.length > 0 ? apiSlides : SLIDES;

  // Clamp current index when slides length changes
  useEffect(() => {
    if (idx >= slides.length) setIdx(0);
  }, [slides.length, idx]);

  const next = () => setIdx((i) => (i + 1) % slides.length);
  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);

  const slide = slides[idx];

  return (
    <div className="relative mx-auto max-w-7xl overflow-hidden rounded-xl">
      <div className="relative aspect-video w-full">
        {/* backdrop full-cover */}
        <img
          src={slide.backdrop}
          alt={slide.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* overlay đen bán trong suốt */}
        <div className="absolute inset-0 bg-black/60" />
        {/* backdrop */}

        {/* content center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <h1 className="mb-4 text-3xl font-extrabold text-white md:text-4xl">
            {slide.title}
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-sm leading-relaxed text-zinc-300">
            {slide.overview}
          </p>

          {/* action row */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to={`/movie/detail/${slide.id}`}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-red-600 px-6 text-sm font-medium text-white transition hover:bg-red-700"
            >
              <Play className="size-4 -translate-x-0.5" />
              Watch Now
            </Link>

       
          </div>
        </div>

        {/* nav arrows */}
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

        {/* dot indicators */}
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <span
              key={i}
              className={clsx(
                "h-1 w-8 rounded-full transition",
                i === idx ? "bg-red-500" : "bg-zinc-600"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
