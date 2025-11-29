import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MovieEditForm } from "@/components/admin/movie/MovieEditForm";
import { TvEditForm } from "@/components/admin/movie/TvEditForm";
import { MovieEditHeader } from "@/components/admin/movie/MovieEditHeader";
import type { Genre } from "@/types/genre";
import type { Country } from "@/types/country";
import type { Person } from "@/types/person";
import { PersonJob } from "@/types/person";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetMovieInfoQuery } from "@/features/movie/movieApi";
import { useUpdateMovieMutation } from "@/features/movie/movieApi";
import {
  useAddSeasonMutation,
  useAddEpisodeMutation,
  useUpdateSeasonMutation,
  useUpdateEpisodeMutation,
} from "@/features/series/seriesApi";
import type { TvFormState } from "@/components/admin/movie/TvAddForm";
// MovieEditFormState is internal to the component; no need to import

// Simplified local initial states (aligned with refactored forms)
interface LocalMovieFormState {
  originalTitle: string;
  title: string;
  description: string;
  release: string;
  duration: number | string | null;
  poster: File | string | null;
  backdrop: File | string | null;
  trailerUrl?: string;
  age: string;
  status: string;
  countries: Country[];
  genres: Genre[];
  director: Person | null;
  actors: Person[];
}
// Use TvFormState from TvAddForm for typing

export default function MovieEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [isSeries, setIsSeries] = useState(false);
  const [movieForm, setMovieForm] = useState<LocalMovieFormState | null>(null);
  const [tvForm, setTvForm] = useState<TvFormState | null>(null);
  const seasonIdByNumberRef = useRef<Map<number, string>>(new Map());
  const episodeIdMapRef = useRef<Map<string, string>>(new Map());
  const {
    data,
    isLoading: infoLoading,
    isError,
  } = useGetMovieInfoQuery(id as string, {
    skip: !id,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const [updateMovieMutation] = useUpdateMovieMutation();
  const [addSeason] = useAddSeasonMutation();
  const [addEpisode] = useAddEpisodeMutation();
  const [updateSeason] = useUpdateSeasonMutation();
  const [updateEpisode] = useUpdateEpisodeMutation();

  useEffect(() => {
    if (!data) return;
    const mapDirector = (): Person | null =>
      data.director
        ? {
            id: data.director.id,
            fullName: data.director.name,
            job: PersonJob.DIRECTOR,
          }
        : null;
    const mapActors = (): Person[] =>
      (data.actors || []).map((a) => ({
        id: a.id,
        fullName: a.name,
        job: PersonJob.ACTOR,
      }));

    if (data.series) {
      type ApiEpisode = {
        id?: string;
        episodeNumber?: number;
        episode_number?: number;
        title?: string;
        duration?: number;
        durationMin?: number;
        synopsis?: string;
        airDate?: string;
      };
      type ApiSeason = {
        id?: string;
        seasonNumber?: number;
        season_number?: number;
        title?: string;
        name?: string;
        episodes?: ApiEpisode[];
      };
      const seasonsFromApi =
        (data as unknown as { seasons?: ApiSeason[] })?.seasons || [];
      // build quick lookup maps for updates
      const seasonIdByNumber = new Map<number, string>();
      const episodeIdMap = new Map<string, string>();
      seasonsFromApi.forEach((s) => {
        const sn = s.seasonNumber ?? s.season_number;
        if (sn != null && s.id) seasonIdByNumber.set(sn, String(s.id));
        (s.episodes || []).forEach((ep) => {
          const en = ep.episodeNumber ?? ep.episode_number;
          if (en != null && ep.id && sn != null) {
            episodeIdMap.set(`${sn}:${en}`, String(ep.id));
          }
        });
      });
      seasonIdByNumberRef.current = seasonIdByNumber;
      episodeIdMapRef.current = episodeIdMap;
      const draftSeasons: TvFormState["seasonDrafts"] = seasonsFromApi.map(
        (s: ApiSeason) => ({
          seasonNumber: s.seasonNumber ?? s.season_number ?? 0,
          title: s.title ?? s.name ?? "",
          episodes: (s.episodes || []).map((ep: ApiEpisode) => ({
            episodeNumber: ep.episodeNumber ?? ep.episode_number ?? 0,
            title: ep.title ?? "",
            durationMin: ep.duration ?? ep.durationMin,
            synopsis: ep.synopsis ?? "",
            airDate: ep.airDate ?? "",
          })),
        })
      );
      setIsSeries(true);
      setTvForm({
        title: data.title,
        originalTitle: data.originalTitle,
        description: data.description,
        release: data.release,
        duration: data.duration,
        poster: data.poster,
        backdrop: data.backdrop,
        trailerUrl: data.trailerUrl ?? "",
        isSeries: true,
        age: data.age,
        status: data.status,
        countries: data.countries as Country[],
        genres: data.genres as Genre[],
        director: mapDirector(),
        actors: mapActors(),
        seasons: seasonsFromApi
          .filter((s) => (s.seasonNumber ?? s.season_number) != null)
          .map((s) => ({
            id: Number(s.id),
            name:
              s.title ??
              s.name ??
              `Season ${(s.seasonNumber ?? s.season_number) || ""}`,
            season_number: Number(s.seasonNumber ?? s.season_number),
          })),
        seasonDrafts: draftSeasons,
      });
    } else {
      setIsSeries(false);
      setMovieForm({
        originalTitle: data.originalTitle,
        title: data.title,
        description: data.description,
        release: data.release,
        duration: data.duration,
        poster: data.poster,
        backdrop: data.backdrop,
        trailerUrl: data.trailerUrl ?? "",
        age: data.age,
        status: data.status,
        countries: data.countries as Country[],
        genres: data.genres as Genre[],
        director: mapDirector(),
        actors: mapActors(),
      });
    }
  }, [data]);

  const updateMovie = <K extends keyof LocalMovieFormState>(
    k: K,
    v: LocalMovieFormState[K]
  ) => {
    setMovieForm((f) => (f ? { ...f, [k]: v } : f));
  };
  const updateTv = <K extends keyof TvFormState>(k: K, v: TvFormState[K]) => {
    setTvForm((f) => (f ? { ...f, [k]: v } : f));
  };

  const handleMovieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieForm || saving || !id) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", movieForm.title);
      fd.append("originalTitle", movieForm.originalTitle || movieForm.title);
      fd.append("description", movieForm.description);
      fd.append("releaseYear", movieForm.release);
      if (movieForm.duration != null && movieForm.duration !== "")
        fd.append("durationMin", String(movieForm.duration));
      fd.append("ageRating", movieForm.age);
      fd.append("status", movieForm.status);
      fd.append("isSeries", "false");
      (movieForm.countries || []).forEach((c) =>
        fd.append("countryIds", String(c.id))
      );
      (movieForm.genres || []).forEach((g) =>
        fd.append("genreIds", String(g.id))
      );
      if (movieForm.director)
        fd.append("directorId", String(movieForm.director.id));
      (movieForm.actors || []).forEach((a) =>
        fd.append("actorIds", String(a.id))
      );
      if (movieForm.poster instanceof File)
        fd.append("posterImage", movieForm.poster);
      if (movieForm.backdrop instanceof File)
        fd.append("backdropImage", movieForm.backdrop);

      await updateMovieMutation({ id, body: fd }).unwrap();
      toast.success("Movie updated successfully");
      navigate("/admin/movies");
    } catch (err) {
      const message = (err as Error)?.message || "Unknown error";
      toast.error("Failed to update movie", { description: message });
    } finally {
      setSaving(false);
    }
  };

  const handleTvSubmit = async (formData: TvFormState) => {
    if (saving || !id) return;
    setSaving(true);
    try {
      // 1) Update base movie fields (series=true)
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("originalTitle", formData.originalTitle || formData.title);
      fd.append("description", formData.description);
      fd.append("releaseYear", formData.release);
      if (formData.duration != null && formData.duration !== "")
        fd.append("durationMin", String(formData.duration));
      fd.append("ageRating", formData.age);
      fd.append("status", formData.status);
      fd.append("isSeries", "true");
      (formData.countries || []).forEach((c) =>
        fd.append("countryIds", String(c.id))
      );
      (formData.genres || []).forEach((g) =>
        fd.append("genreIds", String(g.id))
      );
      if (formData.director)
        fd.append("directorId", String(formData.director.id));
      (formData.actors || []).forEach((a) =>
        fd.append("actorIds", String(a.id))
      );
      if (formData.poster instanceof File)
        fd.append("posterImage", formData.poster);
      if (formData.backdrop instanceof File)
        fd.append("backdropImage", formData.backdrop);

      await updateMovieMutation({ id, body: fd }).unwrap();

      // 2) Update or create seasons and episodes
      const seasonIdByNumber = seasonIdByNumberRef.current;
      for (const s of formData.seasonDrafts || []) {
        const existingSeasonId = seasonIdByNumber.get(s.seasonNumber);
        let seasonIdToUse = existingSeasonId;
        if (existingSeasonId) {
          await updateSeason({
            id: existingSeasonId,
            body: { seasonNumber: s.seasonNumber, title: s.title },
          }).unwrap();
        } else {
          const createdSeason = await addSeason({
            movieId: String(id),
            body: { seasonNumber: s.seasonNumber, title: s.title },
          }).unwrap();
          seasonIdToUse = String(createdSeason.id);
          seasonIdByNumber.set(s.seasonNumber, seasonIdToUse);
        }
        if (!seasonIdToUse) continue;
        for (const ep of s.episodes || []) {
          const key = `${s.seasonNumber}:${ep.episodeNumber}`;
          const existingEpisodeId = episodeIdMapRef.current.get(key);
          const body = {
            episodeNumber: ep.episodeNumber,
            title: ep.title,
            durationMin: ep.durationMin,
            synopsis: ep.synopsis,
            airDate: ep.airDate,
          };
          if (existingEpisodeId) {
            await updateEpisode({ id: existingEpisodeId, body }).unwrap();
          } else {
            await addEpisode({
              seasonId: String(seasonIdToUse),
              body,
            }).unwrap();
          }
        }
      }

      toast.success("TV Series updated successfully");
      navigate("/admin/movies");
    } catch (err) {
      const message = (err as Error)?.message || "Unknown error";
      toast.error("Failed to update TV Series", { description: message });
    } finally {
      setSaving(false);
    }
  };

  if (infoLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="size-10 animate-spin text-teal-500" />
      </div>
    );
  }
  if (isError || (!movieForm && !tvForm)) {
    return (
      <div className="mx-auto max-w-xl p-10 text-center text-zinc-400">
        <p>Unable to load movie info. Please try again.</p>
        <Button className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
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
        <div className="flex-1">
          <MovieEditHeader
            contentType={isSeries ? "tv" : "movie"}
            // Selection is locked based on API isSeries
            disabled
            onReset={() => {
              setMovieForm(null);
              setTvForm(null);
            }}
          />
        </div>
      </div>

      {/* Form */}
      {/* Tái sử dụng component form */}
      {!isSeries && movieForm && (
        <MovieEditForm
          form={movieForm}
          update={updateMovie}
          displayGenres={(data?.genres as Genre[]) || []}
          displayCountries={(data?.countries as Country[]) || []}
          formDataStatus="succeeded"
          loading={saving}
          onSubmit={handleMovieSubmit}
        />
      )}
      {isSeries && tvForm && (
        <TvEditForm
          form={tvForm}
          update={updateTv}
          displayGenres={(data?.genres as Genre[]) || []}
          displayCountries={(data?.countries as Country[]) || []}
          formDataStatus="succeeded"
          loading={saving}
          onSubmit={handleTvSubmit}
        />
      )}
    </section>
  );
}
