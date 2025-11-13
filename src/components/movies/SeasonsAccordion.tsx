import { useState } from "react";
import { ChevronDown, ChevronUp, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Episode {
  id: string;
  title: string;
  overview: string;
  runtime: string; // "49 min"
  still: string; // episode image
}

export interface Season {
  id: string;
  name: string; // "Season 01"
  episodes: Episode[];
}

export const SeasonsAccordion = ({ seasons }: { seasons: Season[] }) => {
  const [openId, setOpenId] = useState<string | null>(
    seasons.length ? seasons[0].id : null
  );

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="rounded-lg bg-zinc-900 p-6">
      <h3 className="mb-6 text-sm font-semibold text-zinc-400">
        Seasons and Episodes
      </h3>

      <div className="space-y-4">
        {seasons.map((season) => {
          const open = openId === season.id;
          return (
            <div key={season.id} className="rounded-lg bg-zinc-800">
              {/* season header */}
              <button
                onClick={() => toggle(season.id)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-medium text-white">
                  {season.name}{" "}
                  <span className="text-xs font-normal text-zinc-400">
                    {season.episodes.length} Episodes
                  </span>
                </span>
                {open ? (
                  <ChevronUp className="size-5 text-white transition-transform duration-300 rotate-180" />
                ) : (
                  <ChevronDown className="size-5 text-white transition-transform duration-300" />
                )}
              </button>
              <AnimatePresence initial={false}>
                {" "}
                {open && (
                  <motion.div
                    key="panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    {" "}
                    <ul className="divide-y divide-zinc-700 px-5 pb-4">
                      {season.episodes.map((e, idx) => (
                        <li
                          key={e.id}
                          className="flex gap-4 py-4 first:pt-0 last:pb-0"
                        >
                          <span className="mt-2 w-6 shrink-0 text-sm font-semibold text-zinc-300">
                            {String(idx + 1).padStart(2, "0")}
                          </span>

                          <img
                            src={e.still}
                            alt={e.title}
                            className="h-16 w-28 rounded object-cover"
                          />

                          <div className="flex-1">
                            <h4 className="flex items-center gap-2 text-sm font-medium text-white">
                              {e.title}
                              <Play className="size-3 fill-white" />
                            </h4>
                            <p className="line-clamp-2 text-xs text-zinc-400">
                              {e.overview}
                            </p>
                          </div>

                          <span className="mt-2 inline-flex items-center gap-1 rounded bg-zinc-700 px-2 py-0.5 text-[10px] text-zinc-200">
                            {e.runtime}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* episode list */}
            </div>
          );
        })}
      </div>
    </div>
  );
};
