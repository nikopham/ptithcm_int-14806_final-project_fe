import { useEffect, useState } from "react";
import {
  Play,
  Plus,
  ThumbsUp,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
// import { Link } from "react-router-dom";
import { useToggleLikeMovieMutation } from "@/features/movie/movieApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { AuthDialog } from "../auth/AuthDialog";
import clsx from "clsx";
import { toast } from "sonner";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { useRef } from "react";

interface Props {
  title: string;
  overview: string;
  backdrops: string[]; // ≥1 image URLs (16:9)
  id: string; // movie / show slug or TMDB id
  isLiked?: boolean; // indicates current like state
  streamUrl?: string; // Cloudflare Stream HLS/DASH URL
}

export const MovieDetailHero = ({
  title,
  overview,
  backdrops,
  id,
  isLiked = false,
  streamUrl,
}: Props) => {
  const [idx, setIdx] = useState(0);
  // const [mute, setMute] = useState(true);
  const [liked, setLiked] = useState<boolean>(isLiked);
  const [authOpen, setAuthOpen] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const isAuth = useSelector((s: RootState) => s.auth.isAuth);
  const [toggleLike, { isLoading: toggling }] = useToggleLikeMovieMutation();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<videojs.Player | null>(null);
  console.log(streamUrl);
  
  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  useEffect(() => {
    if (!showPlayer) return;
    if (!videoRef.current) return;

    // Initialize video.js player when showing player
    if (!playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        preload: "auto",
        autoplay: true,
        fluid: true,
        responsive: true,
        controlBar: {
          volumePanel: { inline: false },
        },
      });
    }

    // Set source when available
    if (playerRef.current && streamUrl) {
      playerRef.current.src({
        src: streamUrl,
        type: "application/x-mpegURL", // HLS
      });
    }

    return () => {
      // do not dispose on toggle; only when component unmounts
    };
  }, [showPlayer, streamUrl]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  const total = backdrops.length;
  const next = () => setIdx((i) => (i + 1) % total);
  const prev = () => setIdx((i) => (i - 1 + total) % total);

  const img = backdrops[idx];

  return (
    <div className="relative mx-auto max-w-7xl overflow-hidden rounded-xl">
      {/* === area giữ tỉ lệ 16:9 === */}
      <div className="relative aspect-video w-full">
        {!showPlayer ? (
          <>
            <img
              src={img}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </>
        ) : (
          <div className="absolute inset-0">
            <video
              ref={videoRef}
              className="video-js vjs-big-play-centered w-full h-full"
              playsInline
            />
          </div>
        )}

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
            <button
              className="inline-flex h-11 items-center gap-2 rounded-md bg-red-600 px-6 text-sm font-medium text-white transition hover:bg-red-700"
              onClick={() => {
                if (!isAuth) {
                  setAuthOpen(true);
                  return;
                }
                if (!streamUrl) {
                  toast.error("No stream URL available");
                  return;
                }
                setShowPlayer(true);
              }}
            >
              <Play className="size-4 -translate-x-0.5" />
              Play Now
            </button>

            <button
              className={clsx(
                "grid h-11 w-11 place-items-center rounded-md border text-white transition",
                liked
                  ? "bg-red-600 border-red-600 hover:bg-red-700"
                  : "border-zinc-600 bg-zinc-800 hover:bg-zinc-700"
              )}
              title={liked ? "Unlike" : "Like"}
              aria-label={liked ? "Unlike movie" : "Like movie"}
              disabled={toggling}
              onClick={async () => {
                if (!isAuth) {
                  setAuthOpen(true);
                  return;
                }
                try {
                  await toggleLike(id).unwrap();
                  setLiked((v) => {
                    const next = !v;
                    toast.success(
                      next ? "Added to Likes" : "Removed from Likes"
                    );
                    return next;
                  });
                } catch {
                  // silently fail or add toast if available
                }
              }}
            >
              <ThumbsUp
                className={clsx("size-4", liked ? "text-white" : "text-white")}
              />
            </button>
          </div>
        </div>

        {/* nav arrows (only show if >1 image) */}
        {!showPlayer && total > 1 && (
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
      {/* Auth Dialog for like gating */}
      <AuthDialog
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab="login"
      />
    </div>
  );
};
