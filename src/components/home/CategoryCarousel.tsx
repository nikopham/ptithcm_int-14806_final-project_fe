import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { Link } from "react-router-dom";

/* ---------- demo data (giữ nguyên / thay API) --------------------- */
interface Category {
  id: string;
  name: string;
  posters: string[];
}

const mockCategories: Category[] = [
  {
    id: "action",
    name: "Action",
    posters: [
      "https://image.tmdb.org/t/p/w300/8uO0gUM8aNqYLs1OsTBQiXu0fEv.jpg",
      "https://image.tmdb.org/t/p/w300/6WBeq4fCfn7AN0o21W9qNcRF2l9.jpg",
      "https://image.tmdb.org/t/p/w300/pThyQovXQrw2m0s9x82twj48Jq4.jpg",
      "https://image.tmdb.org/t/p/w300/q719jXXEzOoYaps6babgKnONONX.jpg",
    ],
  },
  {
    id: "adventure",
    name: "Adventure",
    posters: [
      "https://image.tmdb.org/t/p/w300/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
      "https://image.tmdb.org/t/p/w300/9xeEGUZjgiKlI69jwIOi0hjKUIk.jpg",
      "https://image.tmdb.org/t/p/w300/4V2nTPfeB59TcqJcUfQ9ziTi7VN.jpg",
      "https://image.tmdb.org/t/p/w300/eLT8Cu357VOwBVTitkmlDEg32Fs.jpg",
    ],
  },
  {
    id: "comedy",
    name: "Comedy",
    posters: [
      "https://image.tmdb.org/t/p/w300/5bN6G2Lh6EUV3Ttf02gQgAh0AQB.jpg",
      "https://image.tmdb.org/t/p/w300/5Xpp5BJLW5WJXgYvKP3I5srPzZ1.jpg",
      "https://image.tmdb.org/t/p/w300/auO14i9nE05rz9jIU7X7EVuqV0A.jpg",
      "https://image.tmdb.org/t/p/w300/y2Ca1neKke2mGPMaHzlCrs9Vb7o.jpg",
    ],
  },
  {
    id: "drama",
    name: "Drama",
    posters: [
      "https://image.tmdb.org/t/p/w300/gVG6XKiBeaG0sVRS9yCpE8g3A9t.jpg",
      "https://image.tmdb.org/t/p/w300/2CAL2433ZeIihfX1Hb2139CX0pW.jpg",
      "https://image.tmdb.org/t/p/w300/3fKQ6QhxwEVnhe5ryTTGOHpaF9j.jpg",
      "https://image.tmdb.org/t/p/w300/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg",
    ],
  },
  {
    id: "horror",
    name: "Horror",
    posters: [
      "https://image.tmdb.org/t/p/w300/bQXAqRx2Fgc46uCVWgoPz5L5Dtr.jpg",
      "https://image.tmdb.org/t/p/w300/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
      "https://image.tmdb.org/t/p/w300/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg",
      "https://image.tmdb.org/t/p/w300/uUo7lu5zQzbfji8zjVnZflCmfM8.jpg",
    ],
  },
  {
    id: "action",
    name: "Action",
    posters: [
      "https://image.tmdb.org/t/p/w300/8uO0gUM8aNqYLs1OsTBQiXu0fEv.jpg",
      "https://image.tmdb.org/t/p/w300/6WBeq4fCfn7AN0o21W9qNcRF2l9.jpg",
      "https://image.tmdb.org/t/p/w300/pThyQovXQrw2m0s9x82twj48Jq4.jpg",
      "https://image.tmdb.org/t/p/w300/q719jXXEzOoYaps6babgKnONONX.jpg",
    ],
  },
  {
    id: "adventure",
    name: "Adventure",
    posters: [
      "https://image.tmdb.org/t/p/w300/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
      "https://image.tmdb.org/t/p/w300/9xeEGUZjgiKlI69jwIOi0hjKUIk.jpg",
      "https://image.tmdb.org/t/p/w300/4V2nTPfeB59TcqJcUfQ9ziTi7VN.jpg",
      "https://image.tmdb.org/t/p/w300/eLT8Cu357VOwBVTitkmlDEg32Fs.jpg",
    ],
  },
  {
    id: "comedy",
    name: "Comedy",
    posters: [
      "https://image.tmdb.org/t/p/w300/5bN6G2Lh6EUV3Ttf02gQgAh0AQB.jpg",
      "https://image.tmdb.org/t/p/w300/5Xpp5BJLW5WJXgYvKP3I5srPzZ1.jpg",
      "https://image.tmdb.org/t/p/w300/auO14i9nE05rz9jIU7X7EVuqV0A.jpg",
      "https://image.tmdb.org/t/p/w300/y2Ca1neKke2mGPMaHzlCrs9Vb7o.jpg",
    ],
  },
  {
    id: "drama",
    name: "Drama",
    posters: [
      "https://image.tmdb.org/t/p/w300/gVG6XKiBeaG0sVRS9yCpE8g3A9t.jpg",
      "https://image.tmdb.org/t/p/w300/2CAL2433ZeIihfX1Hb2139CX0pW.jpg",
      "https://image.tmdb.org/t/p/w300/3fKQ6QhxwEVnhe5ryTTGOHpaF9j.jpg",
      "https://image.tmdb.org/t/p/w300/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg",
    ],
  },
  {
    id: "horror",
    name: "Horror",
    posters: [
      "https://image.tmdb.org/t/p/w300/bQXAqRx2Fgc46uCVWgoPz5L5Dtr.jpg",
      "https://image.tmdb.org/t/p/w300/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
      "https://image.tmdb.org/t/p/w300/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg",
      "https://image.tmdb.org/t/p/w300/uUo7lu5zQzbfji8zjVnZflCmfM8.jpg",
    ],
  },
  {
    id: "action",
    name: "Action",
    posters: [
      "https://image.tmdb.org/t/p/w300/8uO0gUM8aNqYLs1OsTBQiXu0fEv.jpg",
      "https://image.tmdb.org/t/p/w300/6WBeq4fCfn7AN0o21W9qNcRF2l9.jpg",
      "https://image.tmdb.org/t/p/w300/pThyQovXQrw2m0s9x82twj48Jq4.jpg",
      "https://image.tmdb.org/t/p/w300/q719jXXEzOoYaps6babgKnONONX.jpg",
    ],
  },
  {
    id: "adventure",
    name: "Adventure",
    posters: [
      "https://image.tmdb.org/t/p/w300/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
      "https://image.tmdb.org/t/p/w300/9xeEGUZjgiKlI69jwIOi0hjKUIk.jpg",
      "https://image.tmdb.org/t/p/w300/4V2nTPfeB59TcqJcUfQ9ziTi7VN.jpg",
      "https://image.tmdb.org/t/p/w300/eLT8Cu357VOwBVTitkmlDEg32Fs.jpg",
    ],
  },
  {
    id: "comedy",
    name: "Comedy",
    posters: [
      "https://image.tmdb.org/t/p/w300/5bN6G2Lh6EUV3Ttf02gQgAh0AQB.jpg",
      "https://image.tmdb.org/t/p/w300/5Xpp5BJLW5WJXgYvKP3I5srPzZ1.jpg",
      "https://image.tmdb.org/t/p/w300/auO14i9nE05rz9jIU7X7EVuqV0A.jpg",
      "https://image.tmdb.org/t/p/w300/y2Ca1neKke2mGPMaHzlCrs9Vb7o.jpg",
    ],
  },
  {
    id: "drama",
    name: "Drama",
    posters: [
      "https://image.tmdb.org/t/p/w300/gVG6XKiBeaG0sVRS9yCpE8g3A9t.jpg",
      "https://image.tmdb.org/t/p/w300/2CAL2433ZeIihfX1Hb2139CX0pW.jpg",
      "https://image.tmdb.org/t/p/w300/3fKQ6QhxwEVnhe5ryTTGOHpaF9j.jpg",
      "https://image.tmdb.org/t/p/w300/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg",
    ],
  },
  {
    id: "horror",
    name: "Horror",
    posters: [
      "https://image.tmdb.org/t/p/w300/bQXAqRx2Fgc46uCVWgoPz5L5Dtr.jpg",
      "https://image.tmdb.org/t/p/w300/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
      "https://image.tmdb.org/t/p/w300/8UlWHLMpgZm9bx6QYh0NFoq67TZ.jpg",
      "https://image.tmdb.org/t/p/w300/uUo7lu5zQzbfji8zjVnZflCmfM8.jpg",
    ],
  },
];

/* ---------- component -------------------------------------------- */
export const CategoryCarousel = ({
  categories = mockCategories,
}: {
  categories?: Category[];
}) => {
  /* paging state */
  const PER_PAGE = 5;
  const totalPages = Math.ceil(categories.length / PER_PAGE);
  const [page, setPage] = useState(0);

  const next = () => setPage((p) => Math.min(p + 1, totalPages - 1));
  const prev = () => setPage((p) => Math.max(p - 1, 0));

  /* slice categories theo trang */
  const slice = categories.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 mt-20">
      {/* header row -------------------------------------------------- */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="mb-2 text-3xl font-extrabold text-white md:text-4xl">
            Explore our wide variety of categories
          </h2>
          <p className="max-w-2xl text-zinc-400">
            Whether you're looking for a comedy to make you laugh, a drama to
            make you think, or a documentary to learn something new
          </p>
        </div>

        {/* nav control */}
        <div className="flex items-center gap-4">
          <button
            onClick={prev}
            disabled={page === 0}
            className={clsx(
              "grid h-10 w-10 place-items-center rounded-md border border-zinc-700 bg-zinc-800",
              page === 0 ? "cursor-not-allowed opacity-40" : "hover:bg-zinc-700"
            )}
          >
            <ArrowLeft className="size-4 text-white" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <span
                key={i}
                className={clsx(
                  "h-1.5 w-6 rounded-full",
                  i === page ? "bg-red-500" : "bg-zinc-600"
                )}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={page === totalPages - 1}
            className={clsx(
              "grid h-10 w-10 place-items-center rounded-md border border-zinc-700 bg-zinc-800",
              page === totalPages - 1
                ? "cursor-not-allowed opacity-40"
                : "hover:bg-zinc-700"
            )}
          >
            <ArrowRight className="size-4 text-white" />
          </button>
        </div>
      </div>

      {/* card grid --------------------------------------------------- */}
      <div className="grid gap-6 md:grid-cols-5 sm:grid-cols-2">
        {slice.map((cat) => (
          <Link
            key={cat.id}
            to={`/movies?genre=${cat.id}`}
            className="rounded-xl bg-zinc-800 p-4 transition hover:-translate-y-1 hover:bg-zinc-700"
          >
            {/* poster 2×2 */}
            <div className="grid grid-cols-2 gap-2 pb-4">
              {cat.posters.slice(0, 4).map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  loading="lazy"
                  className="h-28 w-full rounded-md object-cover"
                />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium text-white">{cat.name}</span>
              <ArrowRight className="size-4 text-zinc-400 transition group-hover:translate-x-1 group-hover:text-white" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
