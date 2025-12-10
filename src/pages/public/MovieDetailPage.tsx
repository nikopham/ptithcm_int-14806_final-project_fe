import { useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { MovieDetailHero } from "@/components/movies/MovieDetailHero";
import { MovieDetailInfo } from "@/components/movies/MovieDetailInfo";
import { type Season } from "@/components/movies/SeasonsAccordion";
import {
  useGetMovieDetailQuery,
  useGetMovieReviewsQuery,
  useGetRecommendationsQuery,
} from "@/features/movie/movieApi";
import type { MovieDetailResponse } from "@/types/movie";
import { Sparkles } from "lucide-react";

export default function MovieDetailPage() {
  const location = useLocation();
  const movieId = useMemo(() => {
    const seg = location.pathname.split("/").filter(Boolean);
    return seg[seg.length - 1] || "";
  }, [location.pathname]);

  const {
    data: detail,
    isLoading,
    isError,
  } = useGetMovieDetailQuery(movieId, {
    skip: !movieId,
  });

  // Episode playback state
  const [episodeStreamUrl, setEpisodeStreamUrl] = useState<string | undefined>(undefined);
  const [episodeId, setEpisodeId] = useState<string | undefined>(undefined);
  const [episodeInfo, setEpisodeInfo] = useState<{
    episodeTitle: string;
    episodeNumber: number;
    seasonNumber: number;
  } | null>(null);
  const [currentSecond, setCurrentSecond] = useState<number | null>(null);

  const handleEpisodePlay = (episodeId: string, videoUrl: string) => {
    setEpisodeStreamUrl(videoUrl);
    setEpisodeId(episodeId);
    // Find episode info from detail.seasons (raw API data)
    if (detail) {
      const maybeSeasons = (detail as unknown as { seasons?: unknown }).seasons;
      const rawSeasons: MovieDetailResponse["seasons"] = Array.isArray(maybeSeasons)
        ? (maybeSeasons as MovieDetailResponse["seasons"])
        : [];
      
      for (const season of rawSeasons) {
        const episode = season.episodes?.find((e) => e.id === episodeId);
        if (episode) {
          setEpisodeInfo({
            episodeTitle: episode.title,
            episodeNumber: episode.episodeNumber,
            seasonNumber: season.seasonNumber,
          });
          // Lấy currentSecond từ episode nếu có
          setCurrentSecond(episode.currentSecond ?? null);
          break;
        }
      }
    }
    // Auto scroll to top when episode is played
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlayMain = () => {
    setEpisodeStreamUrl(undefined);
    setEpisodeId(undefined);
    setEpisodeInfo(null);
    // Lấy currentSecond từ movie detail nếu có (cho phim lẻ)
    const movieCurrentSecond = (detail as unknown as { currentSecond?: number | null })?.currentSecond;
    setCurrentSecond(movieCurrentSecond ?? null);
  };

  
  

  // Reviews (simple first page fetch; can be paginated later)
  const [revPage] = useState(1);
  const [revSize] = useState(5);
  useGetMovieReviewsQuery(
    { movieId, page: revPage, size: revSize },
    { skip: !movieId }
  );

  // Recommendations
  const {
    data: recommendations = [],
    isLoading: recLoading,
    isError: recError,
  } = useGetRecommendationsQuery();

  const seasons: Season[] = useMemo(() => {
    if (!detail) return [];
    const maybeSeasons = (detail as unknown as { seasons?: unknown }).seasons;
    const rawSeasons: MovieDetailResponse["seasons"] = Array.isArray(
      maybeSeasons
    )
      ? (maybeSeasons as MovieDetailResponse["seasons"])
      : [];
    return rawSeasons.map((s) => ({
      id: s.id,
      name: s.title || `Season ${String(s.seasonNumber).padStart(2, "0")}`,
      episodes: Array.isArray(s.episodes)
        ? s.episodes.map((e) => ({
            id: e.id,
            title: e.title,
            overview: e.synopsis,
            runtime: `${(e as unknown as { durationMin?: number }).durationMin ?? (e as unknown as { duration?: number }).duration ?? 0} min`,
            still: e.stillPath,
            videoUrl: (e as unknown as { videoUrl?: string }).videoUrl,
          }))
        : [],
    }));
  }, [detail]);

  return (
    <>
      {isLoading && (
        <div className="mx-auto max-w-7xl px-4 py-16 text-gray-500">
          Đang tải phim…
        </div>
      )}
      {isError && (
        <div className="mx-auto max-w-7xl px-4 py-16" style={{ color: "#C40E61" }}>
          Không thể tải thông tin phim.
        </div>
      )}
      {!isLoading && !isError && detail && (
        <>
          <MovieDetailHero
            id={detail.id}
            title={detail.title}
            overview={detail.description}
            isLiked={(detail as MovieDetailResponse).isLiked}
            streamUrl={episodeStreamUrl || (detail as unknown as { videoUrl?: string }).videoUrl}
            episodeId={episodeId}
            episodeInfo={episodeInfo}
            onPlayMain={handlePlayMain}
            backdrops={[detail.backdropUrl, detail.posterUrl].filter(Boolean)}
            currentSecond={currentSecond}
          />

          {/* Recommendations Section */}
          {recommendations.length > 0 && (
            <div className="mx-auto max-w-7xl px-4 py-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "#C40E61" }}>
                  <Sparkles className="size-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Đề Xuất Cho Bạn</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                {recommendations.map((m) => (
                  <Link
                    key={m.id}
                    to={`/movie/detail/${m.id}`}
                    className="group flex-shrink-0 w-32 sm:w-40 md:w-44 transform transition-all duration-200 hover:scale-105"
                  >
                    {/* poster */}
                    <div className="relative overflow-hidden rounded-lg bg-white border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
                      <img
                        src={m.posterUrl}
                        alt={m.title}
                        loading="lazy"
                        className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-110"
                      />

                      {/* badges */}
                      <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                        {m.imdbScore > 0 && (
                          <span className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white shadow-lg bg-yellow-500">
                            {m.imdbScore.toFixed(1)}
                          </span>
                        )}
                      </div>
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                    </div>

                    {/* titles */}
                    <div className="mt-2 space-y-1">
                      <p className="truncate text-xs sm:text-sm font-medium transition-colors group-hover:text-[#C40E61]" style={{ color: "#C40E61" }}>
                        {m.title}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {m.originalTitle}
                      </p>
                      {m.releaseYear && (
                        <p className="text-xs text-gray-400">
                          {m.releaseYear}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {recLoading && (
            <div className="mx-auto max-w-7xl px-4 py-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "#C40E61" }}>
                  <Sparkles className="size-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Đề Xuất Cho Bạn</h2>
              </div>
              <div className="text-sm text-gray-500">Đang tải đề xuất...</div>
            </div>
          )}

          {recError && !recLoading && (
            <div className="mx-auto max-w-7xl px-4 py-8">
              <div className="text-sm text-gray-500">Không thể tải đề xuất.</div>
            </div>
          )}

          <MovieDetailInfo
            type={
              ((detail as MovieDetailResponse).isSeries ??
              (detail as unknown as { series?: boolean }).series)
                ? "tv"
                : "movie"
            }
            seasons={seasons}
            detail={detail as MovieDetailResponse}
            movieId={movieId}
            onEpisodePlay={handleEpisodePlay}
            currentEpisodeId={episodeId}
          />
        </>
      )}
    </>
  );
}
