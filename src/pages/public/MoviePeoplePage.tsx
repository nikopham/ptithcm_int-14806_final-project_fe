import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import clsx from "clsx";
import { User, Briefcase, Film, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import type { Movie } from "@/types/movie";
import type { PersonDetail } from "@/types/person";
import { useGetPersonDetailQuery } from "@/features/person/personApi";

export default function MoviePeoplePage() {
  const { id } = useParams<{ id: string }>();

  const [page, setPage] = useState(1);

  const {
    data: personDetail,
    isLoading: loadingPerson,
    isError: errorPerson,
  } = useGetPersonDetailQuery({ id: String(id ?? ""), page }, { skip: !id });

  const person = personDetail as PersonDetail | undefined;
  const moviesPage = personDetail && (personDetail as any).movies;
  const movies: Movie[] = moviesPage?.content ?? [];
  const totalPages: number = moviesPage?.totalPages ?? 0;
  const loadingMovies = loadingPerson; // same query
  const errorMovies = errorPerson;

  // Reset page when person changes
  useEffect(() => {
    setPage(1);
  }, [id]);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 text-gray-900 mt-8 bg-white">
      {/* Header & left profile column */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left: Profile card */}
        <aside className="col-span-12 md:col-span-4">
          <div className="rounded-xl bg-white p-4 md:p-6 border border-gray-300 shadow-sm">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
                {person?.profilePath ? (
                  <img
                    src={person.profilePath}
                    alt={person?.fullName ?? "Profile"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
                    <User className="size-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate text-gray-900 flex items-center gap-2">
                  <User className="size-5 text-[#C40E61]" />
                  {person?.fullName ?? "Đang cập nhật"}
                </h1>
              </div>
            </div>

            {/* Meta info: only job */}
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Briefcase className="size-4 text-[#C40E61]" />
                <dt className="w-28 text-gray-500">Nghề nghiệp:</dt>
                <dd className="flex-1 capitalize text-gray-900 font-medium">
                  {(person as any)?.job === "ACTOR" ? "Diễn Viên" : (person as any)?.job === "DIRECTOR" ? "Đạo Diễn" : "Đang cập nhật"}
                </dd>
              </div>
            </dl>

            {loadingPerson && (
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <Loader2 className="size-4 text-[#C40E61] animate-spin" />
                Đang tải thông tin…
              </div>
            )}
            {errorPerson && (
              <div className="mt-4 flex items-center gap-2 text-xs text-red-600">
                <AlertCircle className="size-4" />
                Không thể tải thông tin.
              </div>
            )}
          </div>
        </aside>

        {/* Right: Movies grid */}
        <main className="col-span-12 md:col-span-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Film className="size-5 text-[#C40E61]" />
            Các phim đã tham gia
          </h2>

          {loadingMovies && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="size-4 text-[#C40E61] animate-spin" />
              Đang tải danh sách…
            </div>
          )}
          {errorMovies && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="size-4" />
              Tải danh sách thất bại.
            </div>
          )}
          {!loadingMovies && !errorMovies && movies.length === 0 && (
            <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
              <Film className="size-4 text-gray-400" />
              Không có kết quả.
            </div>
          )}

          {!loadingMovies && !errorMovies && movies.length > 0 && (
            <>
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 mt-2">
                {movies.map((m) => (
                  <Link
                    key={m.id}
                    to={`/movie/detail/${m.id}`}
                    className="block transform transition-all duration-200 hover:scale-105 hover:z-10"
                  >
                    {/* poster */}
                    <div className="relative rounded-lg bg-white border border-gray-300 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <img
                        src={m.posterUrl}
                        alt={m.title}
                        loading="lazy"
                        className="h-[260px] w-full object-cover"
                      />

                      {/* badges */}
                      <div className="absolute bottom-2 left-2 flex gap-1">
                        {m.ageRating && (
                          <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase bg-[#C40E61] text-white">
                            {m.ageRating}
                          </span>
                        )}
                        {m.isSeries && (
                          <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase bg-emerald-600 text-white">
                            Phim Bộ
                          </span>
                        )}
                      </div>
                    </div>

                    {/* titles */}
                    <div className="mt-2 space-y-1">
                      <p className="truncate text-sm font-medium text-[#C40E61]">
                        {m.title}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {m.originalTitle}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={clsx(
                      "rounded border px-3 py-1.5 text-sm flex items-center gap-1 transition-colors",
                      page <= 1
                        ? "border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
                    )}
                  >
                    <ChevronLeft className="size-4" />
                    Trước
                  </button>
                  <span className="text-xs text-gray-500 px-2">
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={clsx(
                      "rounded border px-3 py-1.5 text-sm flex items-center gap-1 transition-colors",
                      page >= totalPages
                        ? "border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
                    )}
                  >
                    Sau
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </section>
  );
}
