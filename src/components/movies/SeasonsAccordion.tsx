import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import clsx from "clsx";

export interface Episode {
  id: string;
  title: string;
  overview: string;
  runtime: string; // "49 min"
  still: string; // episode image
  videoUrl?: string; // episode video URL
}

export interface Season {
  id: string;
  name: string; // "Season 01"
  episodes: Episode[];
}

interface SeasonsAccordionProps {
  seasons: Season[];
  onEpisodePlay?: (episodeId: string, videoUrl: string) => void;
  currentEpisodeId?: string;
}

export const SeasonsAccordion = ({ seasons, onEpisodePlay, currentEpisodeId }: SeasonsAccordionProps) => {
  // Find the season containing the current episode and auto-expand it
  const getInitialOpenId = () => {
    if (currentEpisodeId && seasons.length > 0) {
      for (const season of seasons) {
        if (season.episodes.some((e) => e.id === currentEpisodeId)) {
          return season.id;
        }
      }
    }
    return seasons.length ? seasons[0].id : null;
  };

  const [openId, setOpenId] = useState<string | null>(getInitialOpenId());
  const episodeRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  // Auto-expand season when currentEpisodeId changes
  useEffect(() => {
    if (currentEpisodeId && seasons.length > 0) {
      for (const season of seasons) {
        if (season.episodes.some((e) => e.id === currentEpisodeId)) {
          setOpenId(season.id);
          // Scroll to the active episode after a short delay to ensure it's rendered
          setTimeout(() => {
            const episodeElement = episodeRefs.current.get(currentEpisodeId);
            if (episodeElement) {
              episodeElement.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 100);
          break;
        }
      }
    }
  }, [currentEpisodeId, seasons]);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  const handleEpisodePlay = (episode: Episode) => {
    if (!episode.videoUrl) {
      toast.error("No video available for this episode");
      return;
    }
    if (onEpisodePlay) {
      onEpisodePlay(episode.id, episode.videoUrl);
    }
  };

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
                      {season.episodes.map((e, idx) => {
                        const isActive = currentEpisodeId === e.id;
                        return (
                        <li
                          key={e.id}
                          ref={(el) => {
                            if (el) episodeRefs.current.set(e.id, el);
                          }}
                          className={clsx(
                            "flex gap-4 py-4 first:pt-0 last:pb-0 transition-colors",
                            isActive && "bg-red-600/20 rounded-lg -mx-2 px-2 border-l-2 border-red-600"
                          )}
                        >
                          <span className="mt-2 w-6 shrink-0 text-sm font-semibold text-zinc-300">
                            {String(idx + 1).padStart(2, "0")}
                          </span>

                          {/* <img
                            src={e.still}
                            alt={e.title}
                            className="h-16 w-28 rounded object-cover"
                          /> */}

                          <div className="flex-1">
                            <h4 className={clsx(
                              "text-sm font-medium",
                              isActive ? "text-white font-semibold" : "text-white"
                            )}>
                              {e.title}
                              {isActive && (
                                <span className="ml-2 text-xs text-red-400 font-normal">
                                  (Now Playing)
                                </span>
                              )}
                            </h4>
                            <p className="line-clamp-2 text-xs text-zinc-400">
                              {e.overview}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={clsx(
                              "mt-2 inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px]",
                              isActive ? "bg-red-600/30 text-red-200" : "bg-zinc-700 text-zinc-200"
                            )}>
                              {e.runtime}
                            </span>
                            <button
                              onClick={() => handleEpisodePlay(e)}
                              className={clsx(
                                "mt-2 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed",
                                isActive 
                                  ? "bg-red-700 hover:bg-red-800" 
                                  : "bg-red-600 hover:bg-red-700"
                              )}
                              title={e.videoUrl ? "Play episode" : "No video available"}
                              disabled={!e.videoUrl}
                            >
                              <Play className="size-3.5 fill-white" />
                              {isActive ? "Playing" : "Play"}
                            </button>
                          </div>
                        </li>
                      )})}
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
