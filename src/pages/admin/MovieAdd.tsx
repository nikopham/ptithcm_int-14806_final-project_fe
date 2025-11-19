import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  addMovieAsync,
  fetchMovieFormDataAsync,
} from "@/features/movie/movieThunks";
import { clearMovieDetails, resetAddStatus } from "@/features/movie/movieSlice";
import { MovieAddHeader } from "@/components/admin/movie/MovieAddHeader";
import { MovieAddForm } from "@/components/admin/movie/MovieAddForm";
import type { Person } from "@/types/person";
import type {
  Genre,
  Country,
  CrewMember,
  CastMember,
  MovieRequestDto,
} from "@/types/movie";
import { TvAddForm } from "@/components/admin/movie/TvAddForm";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
    let foundInDb = reduxGenres.find((g) => g.tmdbId == tmdbGenre.id);

    if (foundInDb) {
      genresToSet.push(foundInDb);
    } else {
      const tempGenre: Genre = {
        id: null,
        tmdbId: tmdbGenre.id,
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

  console.log(reduxCountries);
  console.log(tmdbCountries);

  let countryToSet: Country | null = null;
  let newCountry: Country | null = null;
  if (tmdbCountry) {
    let foundInDb = reduxCountries.find(
      (c) => c.isoCode === tmdbCountry["iso_3166_1"]
    );
    if (foundInDb) {
      countryToSet = foundInDb;
    } else {
      countryToSet = {
        id: null,
        isoCode: tmdbCountry["iso_3166_1"],
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
  const navigate = useNavigate();
  // 1. Lấy state từ Redux
  const {
    currentMovie,
    currentTv,
    detailsStatus,
    allGenres: reduxGenres,
    allCountries: reduxCountries,
    formDataStatus,
    addStatus,
  } = useAppSelector((state) => state.movie);
  const [searchType, setSearchType] = useState<"movie" | "tv">("movie");
  // 2. State Form chính
  const [form, setForm] = useState(initialFormState);

  // 3. State Hiển thị (để merge)
  const [displayGenres, setDisplayGenres] = useState<Genre[]>([]);
  const [displayCountries, setDisplayCountries] = useState<Country[]>([]);

  const isLoading = addStatus === "loading";

  const update = (k: keyof typeof form, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleTypeChange = (type: "movie" | "tv") => {
    resetAllState(type);
  };

  const resetAllState = (type: "movie" | "tv") => {
    setSearchType(type);
    setForm(initialFormState);
    dispatch(clearMovieDetails());
    setDisplayGenres(reduxGenres);
    setDisplayCountries(reduxCountries);
  };

  const handleReset = () => {
    // Reset mọi thứ về trạng thái "movie" ban đầu
    resetAllState("movie");
  };

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    const {
      tmdbId,
      title,
      description,
      release,
      country,
      genres,
      director,
      actors,
      duration,
      age,
      poster,
      backdrop,
      video,
      isSeries,
    } = form;

    if (!title) newErrors.title = "Title is required.";
    if (!description) newErrors.description = "Description is required.";
    if (!release) newErrors.release = "Release year is required.";
    if (!country) newErrors.country = "Country is required.";
    if (genres.length === 0)
      newErrors.genres = "At least one genre is required.";
    if (!director) newErrors.director = "Director is required.";
    if (actors.length === 0)
      newErrors.actors = "At least one actor is required.";
    if (!age) newErrors.age = "Age rating is required.";
    if (!poster) newErrors.poster = "Poster image is required.";
    if (!backdrop) newErrors.backdrop = "Backdrop image is required.";

    if (!isSeries && !duration) {
      newErrors.duration = "Duration is required for movies.";
    }

    // setErrors(newErrors); // (XÓA)
    return newErrors; // <-- 2. Trả về object lỗi
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
            prevDisplayGenres.map((g) => g.tmdbId)
          );

          // Lọc ra các genre "mới" mà THỰC SỰ chưa có
          const trulyNewGenres = newGenres.filter(
            (g) => !existingTmdbIds.has(g.tmdbId)
          );

          // Chỉ thêm các genre thực sự mới
          return [...prevDisplayGenres, ...trulyNewGenres];
        });
      }

      if (newCountry) {
        setDisplayCountries((prevDisplayCountries) => {
          // Kiểm tra iso_code đã tồn tại chưa
          const exists = prevDisplayCountries.some(
            (c) => c.isoCode === newCountry.isoCode
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
        imdbId: currentMovie.imdbId || "",
        trailerUrl: currentMovie.trailer_key || "",
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
            prevDisplayGenres.map((g) => g.tmdbId)
          );
          const trulyNewGenres = newGenres.filter(
            (g) => !existingTmdbIds.has(g.tmdbId)
          );
          return [...prevDisplayGenres, ...trulyNewGenres];
        });
      }
      if (newCountry) {
        setDisplayCountries((prevDisplayCountries) => {
          const exists = prevDisplayCountries.some(
            (c) => c.isoCode === newCountry.isoCode
          );
          if (!exists) {
            return [...prevDisplayCountries, newCountry];
          }
          return prevDisplayCountries;
        });
      }
    
      const director = personFromCrew(currentTv.created_by?.[0]);

      const actors = currentTv.cast.map(personFromCast);
      console.log(currentTv);
      
      setForm((f) => ({
        ...f,
        isSeries: true,
        tmdbId: currentTv.id.toString(),
        imdbId: currentTv.imdbId || "",
        trailerUrl: currentTv.trailer_key || "",
        title: currentTv.name,
        description: currentTv.overview,
        release: currentTv.first_air_date?.split("-")[0] || "",
        country: countryToSet,
        genres: genresToSet,
        director: director,
        actors: actors,
        seasons: currentTv.seasons,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // setErrors({}); // (XÓA)

    // 1. Chạy Validate và lấy object lỗi
    const validationErrors = validateForm();

    // 2. (CẬP NHẬT) Xử lý lỗi
    if (Object.keys(validationErrors).length > 0) {
      // Hiển thị toast với danh sách lỗi
      toast.error("ALL FIELD MUST BE NOT EMPTY ⚠️", {
        description: (
          <ul className="list-disc pl-5 mt-2 text-sm">
            {Object.entries(validationErrors).map(([key, message]) => (
              <li key={key}>
                <strong className="capitalize">{key}:</strong> {message}
              </li>
            ))}
          </ul>
        ),
        duration: 5000,
      });
      return; // Dừng lại
    }

    if (addStatus === "loading") return;

    // --- 1. Tạo đối tượng FormData ---
    const formData = new FormData();

    let posterUrl: string | undefined = undefined;
    if (form.poster instanceof File) {
      // Nếu là File, thêm vào FormData với key "posterFile"
      formData.append("posterFile", form.poster);
    } else if (typeof form.poster === "string") {
      // Nếu là string, nó là URL từ TMDb/Cloudinary
      posterUrl = form.poster;
    }

    let backdropUrl: string | undefined = undefined;
    if (form.backdrop instanceof File) {
      // Nếu là File, thêm vào key "backdropFile"
      formData.append("backdropFile", form.backdrop);
    } else if (typeof form.backdrop === "string") {
      // Nếu là string, nó là URL
      backdropUrl = form.backdrop;
    }

    // Biến đổi DTO
    const dto: MovieRequestDto = {
      tmdbId: form.tmdbId,
      imdbId: form.imdbId,
      title: form.title,
      description: form.description,
      release: form.release,
      duration: Number(form.duration) || null,
      poster: posterUrl,
      backdrop: backdropUrl,
      trailerUrl: form.trailerUrl,
      isSeries: form.isSeries,
      age: form.age,
      status: form.status,
      // Chuyển đổi DTO con
      countries: form.country
        ? [{ iso_code: form.country.isoCode, name: form.country.name }]
        : [],
      genres: form.genres.map((g) => ({ tmdb_id: g.tmdbId, name: g.name })),
      director: form.director
        ? {
            id: form.director.id,
            name: form.director.name,
            img: form.director.img,
          }
        : null,
      actors: form.actors.map((a) => ({ id: a.id, name: a.name, img: a.img })),
      seasons: form.isSeries ? form.seasons : null,
    };

    formData.append("dto", JSON.stringify(dto));
    dispatch(addMovieAsync(formData));
  };


  useEffect(() => {
    if (addStatus === "succeeded") {
      toast.success("Content added successfully!");
      navigate("/admin/movies"); // Điều hướng về trang danh sách
      dispatch(resetAddStatus());
    }
    if (addStatus === "failed") {
      // (Interceptor đã lo modal, có thể thêm toast ở đây nếu muốn)
      dispatch(resetAddStatus());
    }
  }, [addStatus, dispatch, navigate]);
  return (
    <section className="mx-auto max-w-4xl space-y-8 pb-20">
      <MovieAddHeader
        searchType={searchType}
        onSearchTypeChange={handleTypeChange}
        onReset={handleReset}
      />
      {searchType === "movie" ? (
        <MovieAddForm
          form={form}
          update={update}
          displayGenres={displayGenres}
          displayCountries={displayCountries}
          formDataStatus={formDataStatus}
          handleSubmit={handleSubmit}
        />
      ) : (
        <TvAddForm
          form={form}
          update={update}
          displayGenres={displayGenres}
          displayCountries={displayCountries}
          formDataStatus={formDataStatus}
          tvDetail={currentTv}
          handleSubmit={handleSubmit}
        />
      )}
    </section>
  );
}
