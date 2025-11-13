import { useState } from "react";
import { ArrowLeft, ArrowRight, Star, Plus } from "lucide-react";
import clsx from "clsx";
import { SeasonsAccordion, type Season } from "./SeasonsAccordion";

/* ──────────────────────────────────────────────────────────
   Types & demo data – swap with real API
────────────────────────────────────────────────────────── */
interface Cast {
  id: string;
  name: string;
  avatar: string;
}
interface Review {
  id: string;
  author: string;
  country: string;
  rating: number;
  body: string;
}
const mockCast: Cast[] = [
  { id: "1", name: "Hero", avatar: "https://i.pravatar.cc/80?img=1" },
  { id: "2", name: "Friend", avatar: "https://i.pravatar.cc/80?img=8" },
  /* add 8-10 more */
];
const mockReviews: Review[] = [
  {
    id: "a",
    author: "Aniket Roy",
    country: "India",
    rating: 4.5,
    body: "This movie was recommended to me by a very dear friend who went for the movie by herself. I went to the cinemas to watch but had a houseful board so couldn't watch it.",
  },
  {
    id: "b",
    author: "Swaraj",
    country: "India",
    rating: 5,
    body: "A restless king promises his lands to the local tribals in exchange of a stone (Panjurli, a deity of Keradi Village) wherein he finds solace and peace of mind.",
  },
  /* … */
];

/* ──────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────── */
const NavPair = ({
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
        "grid h-8 w-8 place-items-center rounded-md bg-zinc-800 text-white",
        page === 0 ? "opacity-40" : "hover:bg-zinc-700"
      )}
    >
      <ArrowLeft className="size-4" />
    </button>
    {Array.from({ length: total }).map((_, i) => (
      <span
        key={i}
        className={clsx(
          "h-1 w-5 rounded-full",
          i === page ? "bg-red-500" : "bg-zinc-600"
        )}
      />
    ))}
    <button
      onClick={next}
      disabled={page === total - 1}
      className={clsx(
        "grid h-8 w-8 place-items-center rounded-md bg-zinc-800 text-white",
        page === total - 1 ? "opacity-40" : "hover:bg-zinc-700"
      )}
    >
      <ArrowRight className="size-4" />
    </button>
  </div>
);
type Props = {
  type: "movie" | "tv";
  seasons?: Season[];
};
/* ──────────────────────────────────────────────────────────
   Main component
────────────────────────────────────────────────────────── */
export const MovieDetailInfo = ({ type, seasons }: Props) => {
  /* pagination state for cast & review */
  const [castPg, setCastPg] = useState(0);
  const [revPg, setRevPg] = useState(0);

  const CAST_PER = 8; // visible avatars
  const REV_PER = 2; // visible reviews

  const castTotal = Math.ceil(mockCast.length / CAST_PER);
  const revTotal = Math.ceil(mockReviews.length / REV_PER);

  const sliceCast = mockCast.slice(
    castPg * CAST_PER,
    castPg * CAST_PER + CAST_PER
  );
  const sliceRev = mockReviews.slice(
    revPg * REV_PER,
    revPg * REV_PER + REV_PER
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-24 lg:grid-cols-[1fr_280px] mt-8">
      {/* ─────────── LEFT COLUMN ─────────── */}
      <div className="space-y-10">
        {type === "tv" && seasons && <SeasonsAccordion seasons={seasons} />}
        {/* Description */}
        <div className="rounded-lg bg-zinc-900 p-6">
          <h4 className="mb-3 text-sm font-semibold text-zinc-400">
            Description
          </h4>
          <p className="text-sm leading-relaxed text-zinc-300">
            A fiery young man clashes with an unflinching forest officer in a
            south Indian village where spirituality, fate and folklore rule the
            lands.
          </p>
        </div>

        {/* Cast */}
        <div className="rounded-lg bg-zinc-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-zinc-400">Cast</h4>
            <NavPair
              page={castPg}
              total={castTotal}
              prev={() => setCastPg((p) => Math.max(p - 1, 0))}
              next={() => setCastPg((p) => Math.min(p + 1, castTotal - 1))}
            />
          </div>

          <div className="flex gap-4">
            {sliceCast.map((c) => (
              <img
                key={c.id}
                src={c.avatar}
                alt={c.name}
                title={c.name}
                className="h-14 w-14 rounded-full object-cover"
              />
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="rounded-lg bg-zinc-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-zinc-400">Reviews</h4>
            <button className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-3 py-1.5 text-xs text-white hover:bg-zinc-700">
              <Plus className="size-3" /> Add Your Review
            </button>
          </div>

          {/* reviews row */}
          <div className="mb-6 flex gap-4">
            {sliceRev.map((r) => (
              <div
                key={r.id}
                className="flex-1 rounded-lg border border-red-600/30 bg-zinc-950 p-4"
              >
                <h5 className="mb-0.5 font-semibold text-white">{r.author}</h5>
                <span className="mb-2 block text-xs text-zinc-400">
                  From {r.country}
                </span>

                {/* stars */}
                <div className="mb-3 flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={clsx(
                        "size-3",
                        i + 1 <= Math.floor(r.rating)
                          ? "fill-red-500 stroke-red-500"
                          : "stroke-zinc-500"
                      )}
                    />
                  ))}
                  <span className="ml-1 text-[10px] font-medium text-zinc-300">
                    {r.rating}
                  </span>
                </div>

                <p className="text-[13px] leading-relaxed text-zinc-300">
                  {r.body}
                </p>
              </div>
            ))}
          </div>

          <NavPair
            page={revPg}
            total={revTotal}
            prev={() => setRevPg((p) => Math.max(p - 1, 0))}
            next={() => setRevPg((p) => Math.min(p + 1, revTotal - 1))}
          />
        </div>
      </div>

      {/* ─────────── RIGHT SIDEBAR ─────────── */}
      <aside className="space-y-8 rounded-lg bg-zinc-900 p-6">
        {/* Year */}
        <div>
          <h4 className="flex items-center gap-1 text-sm font-semibold text-zinc-400">
            <span className="i-lucide-calendar" /> Released Year
          </h4>
          <p className="mt-2 font-medium text-white">2022</p>
        </div>

        {/* Languages */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-zinc-400">
            Available Languages
          </h4>
          <div className="flex flex-wrap gap-2">
            {["English", "Hindi", "Tamil", "Telegu", "Kannada"].map((l) => (
              <span
                key={l}
                className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-white"
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Ratings */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-zinc-400">Ratings</h4>
          <div className="space-y-3">
            {[
              { label: "IMDb", score: 4.5 },
              { label: "Streamvibe", score: 4 },
            ].map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between rounded bg-zinc-800 px-3 py-2 text-sm text-white"
              >
                <span>{r.label}</span>
                <div className="flex items-center gap-1">
                  <Star className="size-4 fill-red-500 stroke-red-500" />
                  {r.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Genres */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-zinc-400">Genres</h4>
          <div className="flex flex-wrap gap-2">
            {["Action", "Adventure"].map((g) => (
              <span
                key={g}
                className="rounded bg-zinc-800 px-3 py-0.5 text-xs text-white"
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Director */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-zinc-400">Director</h4>
          <div className="flex items-center gap-3 rounded bg-zinc-800 p-3">
            <img
              src="https://i.pravatar.cc/64?img=23"
              alt="Director"
              className="h-10 w-10 rounded-md object-cover"
            />
            <div>
              <p className="text-sm font-medium text-white">Rishab Shetty</p>
              <span className="text-[11px] text-zinc-400">From India</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
