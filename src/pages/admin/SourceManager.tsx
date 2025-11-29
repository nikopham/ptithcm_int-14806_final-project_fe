import { useParams } from "react-router-dom";
import { useGetMovieInfoQuery } from "@/features/movie/movieApi";
import TvManageSource from "./TvManageSource";
import MovieManageSource from "./MovieManageSource";

export default function SourceManager() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetMovieInfoQuery(id || "");

  if (!id) return <div className="p-6 text-red-400">Invalid movie id</div>;
  if (isLoading) return <div className="p-6 text-zinc-400">Đang tải…</div>;
  if (isError || !data)
    return (
      <div className="p-6 text-red-400">Không tải được thông tin phim.</div>
    );

  return data.series ? (
    <TvManageSource movieId={id} info={data} />
  ) : (
    <MovieManageSource movieId={id} info={data} />
  );
}
