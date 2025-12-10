import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Play, Tv, Clock, Film } from "lucide-react";
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
    <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
      <h3 className="mb-6 flex items-center gap-2 text-base font-bold text-gray-900">
        <Tv className="size-5 text-[#C40E61]" />
        Mùa và Tập Phim
      </h3>

      <div className="space-y-4">
        {seasons.map((season) => {
          const open = openId === season.id;
          return (
            <div key={season.id} className="rounded-lg border border-gray-300 bg-white shadow-sm">
              {/* season header */}
              <button
                onClick={() => toggle(season.id)}
                className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors rounded-t-lg"
              >
                <span className="font-medium text-gray-900 flex items-center gap-2">
                  <Film className="size-4 text-[#C40E61]" />
                  {season.name}{" "}
                  <span className="text-xs font-normal text-gray-500">
                    {season.episodes.length} Tập
                  </span>
                </span>
                {open ? (
                  <ChevronUp className="size-5 text-gray-600 transition-transform duration-300" />
                ) : (
                  <ChevronDown className="size-5 text-gray-600 transition-transform duration-300" />
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
                    <ul className="divide-y divide-gray-200 px-5 pb-4">
                      {season.episodes.map((e, idx) => {
                        const isActive = currentEpisodeId === e.id;
                        return (
                        <li
                          key={e.id}
                          ref={(el) => {
                            if (el) episodeRefs.current.set(e.id, el);
                          }}
                          className={clsx(
                            "flex gap-4 py-4 first:pt-0 last:pb-0 transition-colors rounded-lg",
                            isActive && "bg-[#C40E61]/10 rounded-lg -mx-2 px-2 border-l-4 border-[#C40E61]"
                          )}
                        >
                          <span className={clsx(
                            "mt-2 w-6 shrink-0 text-sm font-semibold",
                            isActive ? "text-[#C40E61]" : "text-gray-500"
                          )}>
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
                              isActive ? "text-[#C40E61] font-semibold" : "text-gray-900"
                            )}>
                              {e.title}
                              {isActive && (
                                <span className="ml-2 text-xs text-[#C40E61] font-normal">
                                  (Đang phát)
                                </span>
                              )}
                            </h4>
                            <p className="line-clamp-2 text-xs text-gray-500 mt-1">
                              {e.overview}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={clsx(
                              "mt-2 inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium",
                              isActive 
                                ? "bg-[#C40E61]/20 text-[#C40E61] border border-[#C40E61]/30" 
                                : "bg-gray-100 text-gray-600 border border-gray-300"
                            )}>
                              <Clock className="size-3" />
                              {e.runtime}
                            </span>
                            <button
                              onClick={() => handleEpisodePlay(e)}
                              className={clsx(
                                "mt-2 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                                isActive 
                                  ? "bg-[#C40E61] hover:bg-[#C40E61]/90 shadow-md" 
                                  : "bg-[#C40E61] hover:bg-[#C40E61]/90 hover:shadow-sm"
                              )}
                              title={e.videoUrl ? "Phát tập phim" : "Không có video"}
                              disabled={!e.videoUrl}
                            >
                              <Play className="size-3.5 fill-white" />
                              {isActive ? "Đang phát" : "Phát"}
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
