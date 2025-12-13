import { useParams } from "react-router-dom";
import { useGetMovieInfoQuery } from "@/features/movie/movieApi";
import TvManageSource from "./TvManageSource";
import MovieManageSource from "./MovieManageSource";

export default function SourceManager() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetMovieInfoQuery(id || "");

  if (!id) return <div className="p-6 text-red-600">ID phim không hợp lệ</div>;
  if (isLoading) return <div className="p-6 text-gray-500">Đang tải…</div>;
  if (isError || !data)
    return (
      <div className="p-6 text-red-600">Không tải được thông tin phim.</div>
    );

  return data.series ? (
    <TvManageSource movieId={id} info={data} />
  ) : (
    <MovieManageSource movieId={id} info={data} />
  );
}
