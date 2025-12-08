import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import clsx from "clsx";
import { Heart, Share2 } from "lucide-react";
import type { Movie } from "@/types/movie";
import type { PersonDetail } from "@/types/person";
import { useGetPersonDetailQuery } from "@/features/person/personApi";

export default function MoviePeoplePage() {
  const { id } = useParams<{ id: string }>();

  const [page, setPage] = useState(1);
  const [size] = useState(24);

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
    <section className="mx-auto max-w-7xl px-4 pb-24 text-white mt-8">
      {/* Header & left profile column */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left: Profile card */}
        <aside className="col-span-12 md:col-span-4">
          <div className="rounded-xl bg-zinc-900 p-4 md:p-6 border border-zinc-800">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-zinc-800">
                {person?.profilePath ? (
                  <img
                    src={person.profilePath}
                    alt={person?.fullName ?? "Profile"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-zinc-500 text-sm">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate">
                  {person?.fullName ?? "Đang cập nhật"}
                </h1>
              </div>
            </div>

            {/* Meta info: only job */}
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex">
                <dt className="w-32 text-zinc-400">Nghề nghiệp:</dt>
                <dd className="flex-1 capitalize">
                  {(person as any)?.job ?? "Đang cập nhật"}
                </dd>
              </div>
            </dl>

            {loadingPerson && (
              <div className="mt-4 text-xs text-zinc-400">
                Đang tải thông tin…
              </div>
            )}
            {errorPerson && (
              <div className="mt-4 text-xs text-red-400">
                Không thể tải thông tin.
              </div>
            )}
          </div>
        </aside>

        {/* Right: Movies grid */}
        <main className="col-span-12 md:col-span-8">
          <h2 className="mb-4 text-lg font-semibold">Các phim đã tham gia</h2>

          {loadingMovies && (
            <div className="mt-2 text-sm text-zinc-400">
              Đang tải danh sách…
            </div>
          )}
          {errorMovies && (
            <div className="mt-2 text-sm text-red-400">
              Tải danh sách thất bại.
            </div>
          )}
          {!loadingMovies && !errorMovies && movies.length === 0 && (
            <div className="mt-2 text-sm text-zinc-400">Không có kết quả.</div>
          )}

          {!loadingMovies && !errorMovies && movies.length > 0 && (
            <>
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 mt-2">
                {movies.map((m) => (
                  <Link
                    key={m.id}
                    to={`/movie/detail/${m.id}`}
                    className="block transform transition-transform duration-200 hover:scale-105"
                  >
                    {/* poster */}
                    <div className="relative">
                      <img
                        src={m.posterUrl}
                        alt={m.title}
                        loading="lazy"
                        className="h-[260px] w-full rounded-lg object-cover"
                      />

                      {/* badges */}
                      <div className="absolute bottom-2 left-2 flex gap-1">
                        {m.ageRating && (
                          <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase bg-emerald-700">
                            {m.ageRating}
                          </span>
                        )}
                        {m.series && (
                          <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase bg-blue-600">
                            Series
                          </span>
                        )}
                      </div>
                    </div>

                    {/* titles */}
                    <p className="mt-2 truncate text-sm font-medium">
                      {m.title}
                    </p>
                    <p className="truncate text-xs text-zinc-400">
                      {m.originalTitle}
                    </p>
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
                      "rounded border px-3 py-1 text-sm",
                      page <= 1
                        ? "border-zinc-700 text-zinc-500"
                        : "border-zinc-600 text-zinc-200 hover:bg-zinc-800"
                    )}
                  >
                    Trước
                  </button>
                  <span className="text-xs text-zinc-400">
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={clsx(
                      "rounded border px-3 py-1 text-sm",
                      page >= totalPages
                        ? "border-zinc-700 text-zinc-500"
                        : "border-zinc-600 text-zinc-200 hover:bg-zinc-800"
                    )}
                  >
                    Sau
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
