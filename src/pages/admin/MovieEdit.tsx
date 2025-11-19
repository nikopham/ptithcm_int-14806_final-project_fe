import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchMovieByIdAsync, // Thunk lấy chi tiết từ DB
  updateMovieAsync, // Thunk cập nhật (PUT)
  fetchMovieFormDataAsync, // Thunk lấy genres/countries
} from "@/features/movie/movieThunks";
import {
  clearMovieDetails,
  resetSubmitStatus,
} from "@/features/movie/movieSlice";
import { MovieAddForm } from "@/components/admin/movie/MovieAddForm";
import { TvAddForm } from "@/components/admin/movie/TvAddForm";
import type { Person } from "@/types/person";
import type {
  Genre,
  Country,
  MovieRequestDto,
  MovieDetailDto,
  TvDetailDto,
} from "@/types/movie";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";


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


export default function MovieEdit() {
  const { id } = useParams<{ id: string }>(); // Lấy ID từ URL
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // 1. Lấy state từ Redux
  const {
    currentMovie, // Dữ liệu Movie (từ DB)
    currentTv, // Dữ liệu TV (từ DB)
    detailsStatus, // Trạng thái load dữ liệu
    allGenres,
    allCountries,
    formDataStatus,
    submitStatus, // Trạng thái submit (PUT)
  } = useAppSelector((state) => state.movie);

  const isDataLoading =
    detailsStatus === "loading" || formDataStatus === "loading";
  const isSubmitting = submitStatus === "loading";

  // 2. State Form
  // (Khởi tạo rỗng, sẽ được điền khi data tải xong)
  const [form, setForm] = useState<any>({
    tmdbId: "",
    title: "",
    description: "",
    release: "",
    country: null,
    genres: [],
    director: null,
    actors: [],
    duration: "",
    age: "",
    status: "",
    poster: undefined,
    backdrop: undefined,
    video: undefined,
    isSeries: false,
    trailerUrl: "",
    seasons: [],
  });

  // 3. State hiển thị (để merge)
  const [displayGenres, setDisplayGenres] = useState<Genre[]>([]);
  const [displayCountries, setDisplayCountries] = useState<Country[]>([]);

  // 4. Load dữ liệu khi component mount
  useEffect(() => {
    if (id) {
      // Gọi API lấy chi tiết phim từ DB
      dispatch(fetchMovieByIdAsync(id));
      // Gọi API lấy genres/countries (nếu chưa có)
      if (formDataStatus === "idle") {
        dispatch(fetchMovieFormDataAsync());
      }
    }

    // Cleanup khi thoát trang
    return () => {
      dispatch(clearMovieDetails());
      dispatch(resetSubmitStatus());
    };
  }, [id, dispatch, formDataStatus]);

  // 5. Đồng bộ Genres/Countries nền
  useEffect(() => {
    if (formDataStatus === "succeeded") {
      setDisplayGenres(allGenres);
      setDisplayCountries(allCountries);
    }
  }, [formDataStatus, allGenres, allCountries]);

  // 6. Điền dữ liệu vào Form (Khi fetch thành công)
  useEffect(() => {
    if (detailsStatus === "succeeded") {
      let data: MovieDetailDto | TvDetailDto | null = null;
      let isSeries = false;

      if (currentMovie) {
        data = currentMovie;
        isSeries = false;
      } else if (currentTv) {
        data = currentTv;
        isSeries = true;
      }

      if (data) {
        // --- Merge Genres/Countries (Logic giống MovieAdd) ---
        // (Lược bỏ logic merge phức tạp để ngắn gọn, bạn có thể copy từ MovieAdd)
        // Ở đây giả sử dữ liệu từ DB đã chuẩn và có trong allGenres

        // --- Map dữ liệu vào Form ---
        setForm({
          tmdbId: data.id.toString(),
          imdbId: data.imdb_id || "",
          title: isSeries
            ? (data as TvDetailDto).name
            : (data as MovieDetailDto).title,
          description: data.overview,
          // (Xử lý ngày tháng)
          release: isSeries
            ? (data as TvDetailDto).first_air_date?.split("-")[0]
            : (data as MovieDetailDto).release_date?.split("-")[0],

          country: data.production_countries[0]
            ? {
                isoCode: data.production_countries[0].iso_code,
                name: data.production_countries[0].name,
              }
            : null,

          genres: data.genres.map((g) => ({ tmdbId: g.id, name: g.name })), // Map lại key nếu cần

          // (Director & Cast cần map sang type Person)
          director: data.director
            ? {
                /* map director */
              }
            : null,
          actors: data.cast.slice(0, 10).map((c) => ({
            /* map actor */
          })),

          duration: isSeries
            ? (data as TvDetailDto).duration?.toString()
            : (data as MovieDetailDto).runtime?.toString(),

          age: "", // (Lưu ý: DB của bạn có lưu age_rating, API cần trả về trường này)
          status: "PUBLISHED", // (Lưu ý: API cần trả về status)

          // (URL ảnh từ DB/Cloudinary)
          poster: data.poster_path,
          backdrop: data.backdrop_path,
          trailerUrl: data.trailer_key,

          isSeries: isSeries,
          seasons: isSeries ? (data as TvDetailDto).seasons : [],
        });
      }
    }
  }, [currentMovie, currentTv, detailsStatus]);

  // 7. Hàm Update State
  const update = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  // 8. Hàm Validate (Tái sử dụng logic)
  const validateForm = () => {
    /* Copy logic validate từ MovieAdd */ return {};
  };

  // 9. Hàm Submit (PUT)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !id) return;

    // (Validate...)

    const formData = new FormData();
    // (Append files...)
    // (Tạo DTO...)

    // Dispatch Update Thunk
    dispatch(updateMovieAsync({ id, payload: formData }));
  };

  // 10. Xử lý sau khi Submit
  useEffect(() => {
    if (submitStatus === "succeeded") {
      toast.success("Movie updated successfully!");
      navigate("/admin/movies");
    }
  }, [submitStatus, navigate]);

  // --- RENDER ---

  if (isDataLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="size-10 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-4xl space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-2xl font-bold text-white">
          Edit {form.isSeries ? "TV Series" : "Movie"}
        </h1>
      </div>

      {/* Form */}
      {/* Tái sử dụng component form */}
      {!form.isSeries ? (
        <MovieAddForm
          form={form}
          update={update}
          displayGenres={displayGenres}
          displayCountries={displayCountries}
          formDataStatus={formDataStatus}
          isLoading={isSubmitting}
          handleSubmit={handleSubmit} // (Bạn cần truyền prop này vào component con)
        />
      ) : (
        <TvAddForm
          form={form}
          update={update}
          displayGenres={displayGenres}
          displayCountries={displayCountries}
          formDataStatus={formDataStatus}
          tvDetail={currentTv} // (Dữ liệu seasons lấy từ DB)
          isLoading={isSubmitting}
          handleSubmit={handleSubmit}
        />
      )}
    </section>
  );
}
