import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchMovieFormDataAsync } from "@/features/movie/movieThunks";
import { clearMovieDetails } from "@/features/movie/movieSlice";
import { MovieAddHeader } from "@/components/admin/movie/MovieAddHeader";
import { MovieAddForm } from "@/components/admin/movie/MovieAddForm";
import type { Person } from "@/types/person";
import type { Genre, Country, CrewMember, CastMember } from "@/types/movie";
import { TvAddForm } from "@/components/admin/movie/TvAddForm";

// --- Helpers (Nên đưa ra file utils) ---

const getPosterUrl = (
  path: string | null,
  size: "w92" | "w185" | "w500" | "original" = "w500"
) => {
  if (!path) return `https://via.placeholder.com/500x750.png?text=No+Image`;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

const personFromCrew = (crew?: CrewMember | null): Person | null => {
  if (!crew) return null;
  return {
    id: crew.id,
    name: crew.name,
    img: crew.profile_path
      ? getPosterUrl(crew.profile_path, "w185")
      : `https://ui-avatars.com/api/?name=${crew.name.replace(
          /\s/g,
          "+"
        )}&background=random`,
  };
};

const personFromCast = (cast: CastMember): Person => ({
  id: cast.id,
  name: cast.name,
  img: cast.profile_path
    ? getPosterUrl(cast.profile_path, "w185")
    : `https://ui-avatars.com/api/?name=${cast.name.replace(
        /\s/g,
        "+"
      )}&background=random`,
});

// Helper merge
const mergeGenres = (tmdbGenres: any[], reduxGenres: Genre[]) => {
  const genresToSet: Genre[] = [];
  const newGenres: Genre[] = [];
  for (const tmdbGenre of tmdbGenres || []) {
    let foundInDb = reduxGenres.find((g) => g.tmdb_id === tmdbGenre.id);
    if (foundInDb) {
      genresToSet.push(foundInDb);
    } else {
      const tempGenre: Genre = {
        id: null,
        tmdb_id: tmdbGenre.id,
        name: tmdbGenre.name,
      };
      genresToSet.push(tempGenre);
      newGenres.push(tempGenre);
    }
  }
  return { genresToSet, newGenres };
};

const mergeCountry = (tmdbCountries: any[], reduxCountries: Country[]) => {
  const tmdbCountry = tmdbCountries?.[0];
  let countryToSet: Country | null = null;
  let newCountry: Country | null = null;
  if (tmdbCountry) {
    let foundInDb = reduxCountries.find(
      (c) => c.iso_code === tmdbCountry.iso_code
    );
    if (foundInDb) {
      countryToSet = foundInDb;
    } else {
      countryToSet = {
        id: null,
        iso_code: tmdbCountry.iso_code,
        name: tmdbCountry.name,
      };
      newCountry = countryToSet;
    }
  }
  return { countryToSet, newCountry };
};

// --- Component Chính ---
const initialFormState = {
  tmdbId: "",
  title: "",
  description: "",
  release: "",
  country: null as Country | null,
  genres: [] as Genre[],
  director: null as Person | null,
  actors: [] as Person[],
  duration: "",
  age: "",
  status: "DRAFT",
  poster: undefined as File | string | undefined,
  backdrop: undefined as File | string | undefined,
  video: undefined as File | undefined,
  isSeries: false,
};

export default function MovieAdd() {
  const dispatch = useAppDispatch();

  // 1. Lấy state từ Redux
  const {
    currentMovie,
    currentTv,
    detailsStatus,
    allGenres: reduxGenres,
    allCountries: reduxCountries,
    formDataStatus,
  } = useAppSelector((state) => state.movie);
  const [searchType, setSearchType] = useState<"movie" | "tv">("movie");
  // 2. State Form chính
  const [form, setForm] = useState(initialFormState);

  // 3. State Hiển thị (để merge)
  const [displayGenres, setDisplayGenres] = useState<Genre[]>([]);
  const [displayCountries, setDisplayCountries] = useState<Country[]>([]);

  const update = (k: keyof typeof form, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleTypeChange = (type: "movie" | "tv") => {
    setSearchType(type);
    setForm(initialFormState);
    dispatch(clearMovieDetails());
    setDisplayGenres(reduxGenres);
    setDisplayCountries(reduxCountries);
  };

  // 4. Tải Genres/Countries 1 LẦN
  useEffect(() => {
    if (formDataStatus === "idle") {
      dispatch(fetchMovieFormDataAsync());
    }
  }, [formDataStatus, dispatch]);

  // 5. Đồng bộ Redux (DB) -> State (Hiển thị)
  useEffect(() => {
    if (formDataStatus === "succeeded") {
      setDisplayGenres(reduxGenres);
      setDisplayCountries(reduxCountries);
    }
  }, [formDataStatus, reduxGenres, reduxCountries]);

  // 6. Logic Auto-fill
  useEffect(() => {
    // --- XỬ LÝ AUTO-FILL CHO MOVIE ---
    if (currentMovie && detailsStatus === "succeeded") {
      const { genresToSet, newGenres } = mergeGenres(
        currentMovie.genres,
        reduxGenres
      );
      const { countryToSet, newCountry } = mergeCountry(
        currentMovie.production_countries,
        reduxCountries
      );
      if (newGenres.length > 0) {
        setDisplayGenres((prevDisplayGenres) => {
          // Lấy ID của các genre đã hiển thị
          const existingTmdbIds = new Set(
            prevDisplayGenres.map((g) => g.tmdb_id)
          );

          // Lọc ra các genre "mới" mà THỰC SỰ chưa có
          const trulyNewGenres = newGenres.filter(
            (g) => !existingTmdbIds.has(g.tmdb_id)
          );

          // Chỉ thêm các genre thực sự mới
          return [...prevDisplayGenres, ...trulyNewGenres];
        });
      }

      if (newCountry) {
        setDisplayCountries((prevDisplayCountries) => {
          // Kiểm tra iso_code đã tồn tại chưa
          const exists = prevDisplayCountries.some(
            (c) => c.iso_code === newCountry.iso_code
          );

          if (exists) {
            return prevDisplayCountries; // Không thay đổi
          } else {
            return [...prevDisplayCountries, newCountry]; // Thêm mới
          }
        });
      }

      const director = personFromCrew(currentMovie.director);
      const actors = currentMovie.cast.map(personFromCast);

      setForm((f) => ({
        ...f,
        isSeries: false,
        tmdbId: currentMovie.id.toString(),
        title: currentMovie.title,
        description: currentMovie.overview,
        release: currentMovie.release_date?.split("-")[0] || "",
        country: countryToSet,
        genres: genresToSet,
        director: director,
        actors: actors.slice(0, 10),
        duration: currentMovie.runtime.toString(),
        poster: getPosterUrl(currentMovie.poster_path, "w500"),
        backdrop: getPosterUrl(currentMovie.backdrop_path, "original"),
      }));
      dispatch(clearMovieDetails());
    }

    // --- XỬ LÝ AUTO-FILL CHO TV ---
    if (currentTv && detailsStatus === "succeeded") {
      const { genresToSet, newGenres } = mergeGenres(
        currentTv.genres,
        reduxGenres
      );
      const { countryToSet, newCountry } = mergeCountry(
        currentTv.production_countries,
        reduxCountries
      );
      if (newGenres.length > 0) {
        setDisplayGenres((prevDisplayGenres) => {
          const existingTmdbIds = new Set(
            prevDisplayGenres.map((g) => g.tmdb_id)
          );
          const trulyNewGenres = newGenres.filter(
            (g) => !existingTmdbIds.has(g.tmdb_id)
          );
          return [...prevDisplayGenres, ...trulyNewGenres];
        });
      }
      if (newCountry) {
        setDisplayCountries((prevDisplayCountries) => {
          const exists = prevDisplayCountries.some(
            (c) => c.iso_code === newCountry.iso_code
          );
          if (!exists) {
            return [...prevDisplayCountries, newCountry];
          }
          return prevDisplayCountries;
        });
      }

      const director = personFromCrew(currentTv.created_by?.[0]);

      const actors = currentTv.cast.map(personFromCast);

      setForm((f) => ({
        ...f,
        isSeries: true,
        tmdbId: currentTv.id.toString(),
        title: currentTv.name,
        description: currentTv.overview,
        release: currentTv.first_air_date?.split("-")[0] || "",
        country: countryToSet,
        genres: genresToSet,
        director: director,
        actors: actors,
        duration: currentTv.duration.toString(),
        poster: getPosterUrl(currentTv.poster_path, "w500"),
        backdrop: getPosterUrl(currentTv.backdrop_path, "original"),
      }));
      // dispatch(clearMovieDetails());
    }
  }, [
    currentMovie,
    currentTv,
    detailsStatus,
    dispatch,
    reduxGenres,
    reduxCountries,
  ]);

  return (
    <section className="mx-auto max-w-4xl space-y-8 pb-20">
      <MovieAddHeader
        searchType={searchType}
        onSearchTypeChange={handleTypeChange}
      />
      {searchType === "movie" ? (
        <MovieAddForm
          form={form}
          update={update}
          displayGenres={displayGenres}
          displayCountries={displayCountries}
          formDataStatus={formDataStatus}
        />
      ) : (
        <TvAddForm
          form={form}
          update={update}
          displayGenres={displayGenres}
          displayCountries={displayCountries}
          formDataStatus={formDataStatus}
          tvDetail={currentTv}
        />
      )}
    </section>
  );
}
