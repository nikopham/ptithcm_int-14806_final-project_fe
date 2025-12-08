import { useState } from "react";
import { MovieAddHeader } from "@/components/admin/movie/MovieAddHeader";
import { MovieAddForm } from "@/components/admin/movie/MovieAddForm";
import { TvAddForm } from "@/components/admin/movie/TvAddForm";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { Genre } from "@/types/genre";
import type { Country } from "@/types/country";
import type { Person } from "@/types/person";
import { useGetAllGenresQuery } from "@/features/genre/genreApi";
import { useGetAllCountriesQuery } from "@/features/country/countryApi";
import { useCreateMovieMutation } from "@/features/movie/movieApi";
import {
  useAddSeasonMutation,
  useAddEpisodeMutation,
} from "@/features/series/seriesApi";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
// Fallback mocks (only used if API fails)
const fallbackGenres: Genre[] = [
  { id: 1, name: "Action", movieCount: 0 },
  { id: 2, name: "Adventure", movieCount: 0 },
  { id: 3, name: "Comedy", movieCount: 0 },
];
const fallbackCountries: Country[] = [
  { id: 1, isoCode: "US", name: "United States" },
  { id: 2, isoCode: "GB", name: "United Kingdom" },
  { id: 3, isoCode: "JP", name: "Japan" },
];

// (Removed TMDB/autofill; avatar helper no longer used)

// --- Initial State ---
// Form state shapes aligned with refactored form components
interface MovieLocalForm {
  title: string;
  originalTitle: string;
  description: string;
  release: string; // year string
  duration: string | number | null;
  poster: File | string | null;
  backdrop: File | string | null;
  age: string; // AgeRating enum value
  status: string; // MovieStatus enum value
  countries: Country[];
  genres: Genre[];
  director: Person | null;
  actors: Person[];
}
interface TvLocalForm {
  tmdbId: number | null;
  title: string;
  description: string;
  release: string;
  duration: string | number | null;
  poster: File | string | null;
  backdrop: File | string | null;
  trailerUrl?: string;
  isSeries: boolean;
  age: string;
  status: string;
  countries: Country[];
  genres: Genre[];
  director: Person | null;
  actors: Person[];
  seasons: { id: number; name: string; season_number: number }[];
  seasonDrafts: {
    seasonNumber: number;
    title?: string;
    episodes: {
      episodeNumber: number;
      title: string;
      durationMin?: number;
      synopsis?: string;
      airDate?: string;
    }[];
  }[];
}
const emptyMovie: MovieLocalForm = {
  title: "",
  originalTitle: "",
  description: "",
  release: "",
  duration: "",
  poster: null,
  backdrop: null,
  age: "",
  status: "DRAFT",
  countries: [],
  genres: [],
  director: null,
  actors: [],
};
const emptyTv: TvLocalForm = {
  tmdbId: null,
  title: "",
  description: "",
  release: "",
  duration: "",
  poster: null,
  backdrop: null,
  trailerUrl: "",
  isSeries: true,
  age: "",
  status: "DRAFT",
  countries: [],
  genres: [],
  director: null,
  actors: [],
  seasons: [],
  seasonDrafts: [],
};

export default function MovieAdd() {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<"movie" | "tv">("movie");
  const [movieForm, setMovieForm] = useState<MovieLocalForm>(emptyMovie);
  const [tvForm, setTvForm] = useState<TvLocalForm>(emptyTv);
  const [savingTv, setSavingTv] = useState(false); // TV form only (movie uses mutation)
  const {
    data: allGenres,
    isLoading: loadingGenres,
    isError: genresError,
  } = useGetAllGenresQuery();
  const {
    data: allCountries,
    isLoading: loadingCountries,
    isError: countriesError,
  } = useGetAllCountriesQuery();
  const [createMovie, { isLoading: creatingMovie }] = useCreateMovieMutation();
  const [addSeason] = useAddSeasonMutation();
  const [addEpisode] = useAddEpisodeMutation();

  const updateMovie = <K extends keyof MovieLocalForm>(
    k: K,
    v: MovieLocalForm[K]
  ) => setMovieForm((f) => ({ ...f, [k]: v }));
  const updateTv = <K extends keyof TvLocalForm>(k: K, v: TvLocalForm[K]) =>
    setTvForm((f) => ({ ...f, [k]: v }));

  const handleTypeChange = (type: "movie" | "tv") => {
    setSearchType(type);
    if (type === "movie") {
      setMovieForm(emptyMovie);
    } else {
      setTvForm(emptyTv);
    }
  };
  const handleReset = () => {
    setMovieForm(emptyMovie);
    setTvForm(emptyTv);
    setSearchType("movie");
  };

  const validateReleaseYear = (year: string | number | null): string | null => {
    if (!year) return "Release year required";

    const y = Number(year);
    if (Number.isNaN(y)) return "Release year must be a number";

    const str = String(year);
    if (str.length !== 4) return "Release year must be 4 digits";

    const min = 1900;
    const max = new Date().getFullYear();

    if (y < min || y > max) return `Year must be between ${min} and ${max}`;

    return null;
  };

  const validateMovie = (m: MovieLocalForm): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!m.title) errors.title = "Title required";
    if (!m.originalTitle) errors.originalTitle = "Original title required";
    if (!m.description) errors.description = "Description required";
    const releaseErr = validateReleaseYear(m.release);
    if (releaseErr) errors.release = releaseErr;
    if (m.countries.length === 0)
      errors.countries = "Select at least one country";
    if (m.genres.length === 0) errors.genres = "Select at least one genre";
    if (!m.director) errors.director = "Director required";
    if (m.actors.length === 0) errors.actors = "At least one actor required";
    if (!m.age) errors.age = "Age rating required";
    if (!m.poster) errors.poster = "Poster required";
    if (!m.backdrop) errors.backdrop = "Backdrop required";
    if (!m.duration) errors.duration = "Duration required";
    return errors;
  };
  const validateTv = (t: TvLocalForm): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!t.title) errors.title = "Title required";
    if (!t.description) errors.description = "Description required";
    const releaseErr = validateReleaseYear(t.release);
    if (releaseErr) errors.release = releaseErr;
    if (!t.countries || t.countries.length === 0)
      errors.countries = "Select at least one country";
    if (t.genres.length === 0) errors.genres = "Select at least one genre";
    if (!t.director) errors.director = "Director required";
    if (t.actors.length === 0) errors.actors = "At least one actor required";
    if (!t.age) errors.age = "Age rating required";
    if (!t.poster) errors.poster = "Poster required";
    if (!t.backdrop) errors.backdrop = "Backdrop required";
    return errors;
  };

  // Removed TMDB autofill logic – manual entry only

  const handleMovieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creatingMovie) return;
    const errors = validateMovie(movieForm);
    if (Object.keys(errors).length) {
      toast.error("Fix errors to continue", {
        description: (
          <ul className="list-disc pl-5 mt-2 text-sm">
            {Object.entries(errors).map(([k, v]) => (
              <li key={k}>
                {k}: {v}
              </li>
            ))}
          </ul>
        ),
      });
      return;
    }
    try {
      const fd = new FormData();
      fd.append("title", movieForm.title);
      fd.append("originalTitle", movieForm.originalTitle || movieForm.title);
      fd.append("description", movieForm.description);
      fd.append("releaseYear", movieForm.release);
      fd.append("durationMin", String(movieForm.duration));
      fd.append("ageRating", movieForm.age);
      fd.append("status", movieForm.status);
      fd.append("isSeries", "false");
      movieForm.countries.forEach((c) => fd.append("countryIds", String(c.id)));
      movieForm.genres.forEach((g) => fd.append("genreIds", String(g.id)));
      if (movieForm.director)
        fd.append("directorId", String(movieForm.director.id));
      movieForm.actors.forEach((a) => fd.append("actorIds", String(a.id)));
      if (movieForm.poster instanceof File)
        fd.append("posterImage", movieForm.poster);
      if (movieForm.backdrop instanceof File)
        fd.append("backdropImage", movieForm.backdrop);

      await createMovie(fd).unwrap();
      toast.success("Movie created successfully");
      navigate("/admin/movies");
    } catch (err) {
      const message = (err as Error)?.message || "Unknown error";
      toast.error("Failed to create movie", {
        description: message,
      });
    }
  };
  const handleTvSubmit = async (formData: TvLocalForm) => {
    if (savingTv) return;
    const errors = validateTv(formData);
    if (Object.keys(errors).length) {
      toast.error("Fix errors to continue", {
        description: (
          <ul className="list-disc pl-5 mt-2 text-sm">
            {Object.entries(errors).map(([k, v]) => (
              <li key={k}>
                {k}: {v}
              </li>
            ))}
          </ul>
        ),
      });
      return;
    }
    setSavingTv(true);
    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("originalTitle", formData.title);
      fd.append("description", formData.description);
      fd.append("releaseYear", formData.release);
      if (formData.duration)
        fd.append("durationMin", String(formData.duration));
      fd.append("ageRating", formData.age);
      fd.append("status", formData.status);
      fd.append("isSeries", "true");
      formData.countries.forEach((c) => fd.append("countryIds", String(c.id)));
      formData.genres.forEach((g) => fd.append("genreIds", String(g.id)));
      if (formData.director)
        fd.append("directorId", String(formData.director.id));
      formData.actors.forEach((a) => fd.append("actorIds", String(a.id)));
      if (formData.poster instanceof File)
        fd.append("posterImage", formData.poster);
      if (formData.backdrop instanceof File)
        fd.append("backdropImage", formData.backdrop);

      const created = await createMovie(fd).unwrap();

      for (const s of formData.seasonDrafts || []) {
        const createdSeason = await addSeason({
          movieId: String(created.id),
          body: { seasonNumber: s.seasonNumber, title: s.title },
        }).unwrap();
        for (const ep of s.episodes || []) {
          await addEpisode({
            seasonId: String(createdSeason.id),
            body: {
              episodeNumber: ep.episodeNumber,
              title: ep.title,
              durationMin: ep.durationMin,
              synopsis: ep.synopsis,
              airDate: ep.airDate,
            },
          }).unwrap();
        }
      }

      toast.success("TV Series created successfully");
      navigate("/admin/movies");
    } catch (err) {
      const message = (err as Error)?.message || "Unknown error";
      toast.error("Failed to create TV Series", { description: message });
    } finally {
      setSavingTv(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex-1">
          <MovieAddHeader
            searchType={searchType}
            onSearchTypeChange={handleTypeChange}
            onReset={handleReset}
          />
        </div>
      </div>

      {searchType === "movie" ? (
        <MovieAddForm
          form={movieForm}
          update={updateMovie}
          displayGenres={genresError ? fallbackGenres : (allGenres ?? [])}
          displayCountries={
            countriesError ? fallbackCountries : (allCountries ?? [])
          }
          formDataStatus={
            loadingGenres || loadingCountries ? "loading" : "succeeded"
          }
          handleSubmit={handleMovieSubmit}
          loading={creatingMovie}
        />
      ) : (
        <TvAddForm
          form={tvForm}
          update={updateTv}
          displayGenres={genresError ? fallbackGenres : (allGenres ?? [])}
          displayCountries={
            countriesError ? fallbackCountries : (allCountries ?? [])
          }
          formDataStatus={
            loadingGenres || loadingCountries ? "loading" : "succeeded"
          }
          loading={savingTv}
          onSubmit={handleTvSubmit}
        />
      )}
    </section>
  );
}
