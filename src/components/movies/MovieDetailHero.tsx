import { useEffect, useState } from "react";
import {
  Play,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Copy,
  Loader2,
} from "lucide-react";
// import { Link } from "react-router-dom";
import { useToggleLikeMovieMutation } from "@/features/movie/movieApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { AuthDialog } from "../auth/AuthDialog";
import clsx from "clsx";
import { toast } from "sonner";
// Replaced Cloudflare Stream with custom HLS + Artplayer component
import { VideoPlayer } from "@/components/player/VideoPlayer";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EpisodeInfo {
  episodeTitle: string;
  episodeNumber: number;
  seasonNumber: number;
}

interface Props {
  title: string;
  overview: string;
  backdrops: string[]; // ≥1 image URLs (16:9)
  id: string; // movie / show slug or TMDB id
  isLiked?: boolean; // indicates current like state
  streamUrl?: string; // Cloudflare Stream HLS/DASH URL
  episodeId?: string; // episode ID for TV series
  episodeInfo?: EpisodeInfo | null; // episode information for display
  onPlayMain?: () => void; // callback when main movie is played
  currentSecond?: number | null; // Vị trí đang xem để resume
}

export const MovieDetailHero = ({
  title,
  overview,
  backdrops,
  id,
  isLiked = false,
  streamUrl,
  episodeId,
  episodeInfo,
  onPlayMain,
  currentSecond,
}: Props) => {
  const [idx, setIdx] = useState(0);
  const [liked, setLiked] = useState<boolean>(isLiked);
  const [authOpen, setAuthOpen] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shortUrl, setShortUrl] = useState<string>("");
  const [isShortening, setIsShortening] = useState(false);

  // Auto-show player when episode is selected
  useEffect(() => {
    if (episodeId && streamUrl) {
      setShowPlayer(true);
    }
  }, [episodeId, streamUrl]);

  const isAuth = useSelector((s: RootState) => s.auth.isAuth);
  const [toggleLike, { isLoading: toggling }] = useToggleLikeMovieMutation();
  
  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  const isHLSUrl = Boolean(streamUrl && streamUrl.includes(".m3u8"));

  // Sử dụng Cloudflare Stream React, không cần HLS/video element tùy chỉnh

  const total = backdrops.length;
  const next = () => setIdx((i) => (i + 1) % total);
  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const img = backdrops[idx];

  // Get current page URL for sharing
  const currentPageUrl = typeof window !== "undefined" ? window.location.href : "";

  // Shorten URL using is.gd (free service, no API key needed)
  const shortenUrl = async (longUrl: string): Promise<string> => {
    try {
      const response = await fetch(
        `https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`
      );
      const data = await response.json();
      if (data.shorturl) {
        return data.shorturl;
      }
      throw new Error("Failed to shorten URL");
    } catch (error) {
      console.error("Error shortening URL:", error);
      // Fallback to original URL if shortening fails
      return longUrl;
    }
  };

  // Shorten URL when share dialog opens
  useEffect(() => {
    if (shareOpen && currentPageUrl && !shortUrl && !isShortening) {
      setIsShortening(true);
      shortenUrl(currentPageUrl)
        .then((url) => {
          setShortUrl(url);
          setIsShortening(false);
        })
        .catch(() => {
          setShortUrl(currentPageUrl);
          setIsShortening(false);
        });
    }
  }, [shareOpen, currentPageUrl, shortUrl, isShortening]);

  // Reset short URL when dialog closes
  useEffect(() => {
    if (!shareOpen) {
      setShortUrl("");
      setIsShortening(false);
    }
  }, [shareOpen]);

  // Share handlers
  const handleShare = (platform: string) => {
    const urlToShare = shortUrl || currentPageUrl;
    const encodedUrl = encodeURIComponent(urlToShare);
    const encodedTitle = encodeURIComponent(title);
    
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    };

    const url = shareUrls[platform];
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleCopyLink = async () => {
    const urlToCopy = shortUrl || currentPageUrl;
    try {
      await navigator.clipboard.writeText(urlToCopy);
      toast.success("Đã sao chép liên kết!");
    } catch {
      toast.error("Không thể sao chép liên kết");
    }
  };

  return (
    <>
      {/* Theater mode overlay - covers entire viewport */}
      {theaterMode && showPlayer && (
        <div className="fixed inset-0 bg-black z-40 pointer-events-none" />
      )}
      
      <div className={clsx(
        "relative mx-auto max-w-7xl overflow-hidden rounded-xl",
        theaterMode && showPlayer && "relative z-50"
      )}>
        {/* Player title - shown above player when playing */}
        {showPlayer && (
          <div className="mb-3 px-2">
            <h2 className="text-lg font-semibold text-gray-900 md:text-xl">
              {episodeInfo
                ? `${title}: Tập ${episodeInfo.episodeNumber} Mùa ${episodeInfo.seasonNumber}`
                : title}
            </h2>
            {episodeInfo && (
              <p className="mt-1 text-sm text-gray-500">{episodeInfo.episodeTitle}</p>
            )}
          </div>
        )}
        
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
            <div
              className={
                theaterMode ? "absolute inset-0 bg-black" : "absolute inset-0"
              }
            >
              {isHLSUrl ? (
                streamUrl ? (
                  <VideoPlayer
                    src={streamUrl}
                    poster={img}
                    movieId={id}
                    episodeId={episodeId}
                    currentSecond={currentSecond}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-300">
                    URL phát video không hợp lệ
                  </div>
                )
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-300">
                  Nguồn phát không được hỗ trợ
                </div>
              )}
            </div>
          )}

          {/* content center */}
          {!showPlayer && (
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
                  className="inline-flex h-11 items-center gap-2 rounded-md px-6 text-sm font-medium text-white transition hover:opacity-90"
                  style={{ backgroundColor: "#C40E61" }}
                  onClick={() => {
                    if (!isAuth) {
                      setAuthOpen(true);
                      return;
                    }
                    if (!streamUrl) {
                      toast.error("Không có đường dẫn phát video");
                      return;
                    }
                    // Reset episode state when playing main movie
                    if (onPlayMain) {
                      onPlayMain();
                    }
                    setShowPlayer(true);
                    // Auto scroll to top when playing main movie
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <Play className="size-4 -translate-x-0.5" />
                  Phát Ngay
                </button>

                <button
                  className={clsx(
                    "grid h-11 w-11 place-items-center rounded-md border-2 transition-all duration-200",
                    liked
                      ? "bg-[#C40E61] border-[#C40E61] hover:opacity-90 shadow-lg"
                      : "bg-white/90 backdrop-blur-sm border-[#C40E61] hover:bg-white hover:shadow-lg hover:scale-105"
                  )}
                  title={liked ? "Bỏ thích" : "Thích"}
                  aria-label={liked ? "Bỏ thích phim" : "Thích phim"}
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
                          next ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích"
                        );
                        return next;
                      });
                    } catch {
                      toast.error("Không thể cập nhật trạng thái yêu thích");
                    }
                  }}
                >
                  <ThumbsUp
                    className={clsx(
                      "size-4 transition-colors",
                      liked ? "text-white" : "text-[#C40E61]"
                    )}
                  />
                </button>
              </div>
            </div>
          )}

          {/* nav arrows (only show if >1 image) */}
          {!showPlayer && total > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-6 top-1/2 -translate-y-1/2 rounded-md bg-white/80 p-2 text-gray-900 transition hover:bg-white"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-6 top-1/2 -translate-y-1/2 rounded-md bg-white/80 p-2 text-gray-900 transition hover:bg-white"
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
                      i === idx ? "" : "bg-white/50"
                    )}
                    style={i === idx ? { backgroundColor: "#C40E61" } : undefined}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Player controls row (visible when player is active) */}
        {showPlayer && (
          <div className={clsx(
            "mt-4 flex flex-wrap items-center justify-center gap-3",
            theaterMode && "relative z-50"
          )}>
            <button
              className={clsx(
                "inline-flex h-9 items-center gap-2 rounded-md border-2 px-4 text-xs font-medium transition-all duration-200",
                liked
                  ? "bg-[#C40E61] border-[#C40E61] text-white hover:opacity-90 shadow-lg"
                  : "bg-white border-[#C40E61] text-[#C40E61] hover:bg-gray-50 hover:shadow-lg hover:scale-105"
              )}
              title={liked ? "Bỏ thích" : "Thích"}
              aria-label={liked ? "Bỏ thích phim" : "Thích phim"}
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
                      toast.success(next ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích");
                    return next;
                  });
                } catch {
                  toast.error("Không thể cập nhật trạng thái yêu thích");
                }
              }}
            >
              <ThumbsUp className="size-4" />
              {liked ? "Đã Thích" : "Thích"}
            </button>

            <button
              className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-300 bg-white px-4 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
              onClick={() => setTheaterMode((v) => !v)}
              aria-pressed={theaterMode}
              title="Chuyển Chế Độ Rạp"
            >
              {theaterMode ? "Thoát Rạp" : "Chế Độ Rạp"}
            </button>

            <button
              className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-300 bg-white px-4 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
              onClick={() => setShareOpen(true)}
              title="Chia Sẻ"
            >
              Chia Sẻ
            </button>
          </div>
        )}

        {/* Auth Dialog for like gating */}
        <AuthDialog
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          defaultTab="login"
        />
      </div>
      {/* Share dialog */}
      <AlertDialog open={shareOpen} onOpenChange={setShareOpen}>
        <AlertDialogContent className="bg-white border-gray-300">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Chia Sẻ Phim Này</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Chia sẻ với bạn bè trên mạng xã hội
            </AlertDialogDescription>
          </AlertDialogHeader>
          {isShortening ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <Loader2 className="size-8 animate-spin" style={{ color: "#C40E61" }} />
              <p className="text-sm text-gray-500">Đang chuẩn bị liên kết chia sẻ...</p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-4 py-4">
              <button
                onClick={() => handleShare("facebook")}
                className="flex flex-col items-center gap-2 rounded-lg bg-[#1877F2] p-4 text-white transition hover:bg-[#166FE5] disabled:opacity-50 disabled:cursor-not-allowed"
                title="Share on Facebook"
                aria-label="Share on Facebook"
                disabled={!shortUrl && !currentPageUrl}
              >
                <Facebook className="size-6" />
                <span className="text-xs font-medium">Facebook</span>
              </button>

              <button
                onClick={() => handleShare("twitter")}
                className="flex flex-col items-center gap-2 rounded-lg bg-[#1DA1F2] p-4 text-white transition hover:bg-[#1A91DA] disabled:opacity-50 disabled:cursor-not-allowed"
                title="Share on Twitter/X"
                aria-label="Share on Twitter/X"
                disabled={!shortUrl && !currentPageUrl}
              >
                <Twitter className="size-6" />
                <span className="text-xs font-medium">Twitter</span>
              </button>

              <button
                onClick={() => handleShare("linkedin")}
                className="flex flex-col items-center gap-2 rounded-lg bg-[#0077B5] p-4 text-white transition hover:bg-[#006399] disabled:opacity-50 disabled:cursor-not-allowed"
                title="Share on LinkedIn"
                aria-label="Share on LinkedIn"
                disabled={!shortUrl && !currentPageUrl}
              >
                <Linkedin className="size-6" />
                <span className="text-xs font-medium">LinkedIn</span>
              </button>

              <button
                onClick={() => handleShare("email")}
                className="flex flex-col items-center gap-2 rounded-lg bg-gray-100 p-4 text-gray-700 transition hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Share via Email"
                aria-label="Share via Email"
                disabled={!shortUrl && !currentPageUrl}
              >
                <Mail className="size-6" />
                <span className="text-xs font-medium">Email</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-2 rounded-lg bg-gray-100 p-4 text-gray-700 transition hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Copy link"
                aria-label="Copy link to clipboard"
                disabled={!shortUrl && !currentPageUrl}
              >
                <Copy className="size-6" />
                <span className="text-xs font-medium">Sao Chép</span>
              </button>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100">
              Đóng
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
