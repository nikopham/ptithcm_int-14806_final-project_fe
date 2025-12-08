import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { MovieDetailHero } from "@/components/movies/MovieDetailHero";
import { MovieDetailInfo } from "@/components/movies/MovieDetailInfo";
import { type Season } from "@/components/movies/SeasonsAccordion";
import {
  useGetMovieDetailQuery,
  useGetMovieReviewsQuery,
} from "@/features/movie/movieApi";
import type { MovieDetailResponse } from "@/types/movie";

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
  };

  
  

  // Reviews (simple first page fetch; can be paginated later)
  const [revPage] = useState(1);
  const [revSize] = useState(5);
  useGetMovieReviewsQuery(
    { movieId, page: revPage, size: revSize },
    { skip: !movieId }
  );

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
        <div className="mx-auto max-w-7xl px-4 py-16 text-zinc-300">
          Loading movie…
        </div>
      )}
      {isError && (
        <div className="mx-auto max-w-7xl px-4 py-16 text-red-400">
          Failed to load movie detail.
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
          />

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
