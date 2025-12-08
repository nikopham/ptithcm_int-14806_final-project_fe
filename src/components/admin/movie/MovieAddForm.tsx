import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenreSelector } from "@/components/admin/common/GenreSelector";
import { CountrySelector } from "@/components/admin/common/CountrySelector";
import { PersonSelectDialog } from "@/components/admin/common/PersonSelectDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { X, Trash2, Loader2 } from "lucide-react";
import type { Person } from "@/types/person";
import { PersonJob } from "@/types/person";
import { useSearchPeopleQuery } from "@/features/person/personApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Genre } from "@/types/genre";
import type { Country } from "@/types/country";
import { ageRatings, statusOptions } from "@/constants/movieConstants";
// Removed store usage; using local mock and optional loading prop.

// Props
interface MovieFormState {
  title: string;
  originalTitle: string;
  description: string;
  release: string;
  duration: string | number | null;
  poster: File | string | null;
  backdrop: File | string | null;
  age: string;
  status: string;
  countries: Country[]; // multi-select
  genres: Genre[]; // multi-select
  director: Person | null;
  actors: Person[];
}

interface MovieAddFormProps {
  form: MovieFormState;
  update: <K extends keyof MovieFormState>(k: K, v: MovieFormState[K]) => void;
  displayGenres?: Genre[];
  displayCountries?: Country[];
  movieGenre?: Genre[]; // original movie genres from detail
  movieCountry?: Country[]; // original movie countries from detail
  formDataStatus?: string;
  handleSubmit: (e: React.FormEvent) => void;
  loading?: boolean; // optional external loading state
  submitLabel?: string; // optional override for submit button text
  showReset?: boolean; // optional flag to show/hide reset button
}

export function MovieAddForm({
  form,
  update,
  displayGenres,
  displayCountries,
  movieGenre,
  movieCountry,
  formDataStatus = "idle",
  handleSubmit,
  loading = false,
  submitLabel,
  showReset = true,
}: MovieAddFormProps) {
  // Country modal state
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  // Modal & search state for People (Director / Actors)
  const [directorModalOpen, setDirectorModalOpen] = useState(false);
  const [actorModalOpen, setActorModalOpen] = useState(false);
  const [directorSearch, setDirectorSearch] = useState("");
  const [actorSearch, setActorSearch] = useState("");
  const [directorPage, setDirectorPage] = useState(0); // 0-based UI
  const [actorPage, setActorPage] = useState(0);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [backdropPreview, setBackdropPreview] = useState<string | null>(null);
  const PAGE_SIZE = 8;

  const { data: directorData, isFetching: directorFetching } =
    useSearchPeopleQuery(
      {
        query: directorSearch || undefined,
        job: PersonJob.DIRECTOR,
        page: directorPage + 1,
        size: PAGE_SIZE,
      },
      { skip: !directorModalOpen }
    );
  const { data: actorData, isFetching: actorFetching } = useSearchPeopleQuery(
    {
      query: actorSearch || undefined,
      job: PersonJob.ACTOR,
      page: actorPage + 1,
      size: PAGE_SIZE,
    },
    { skip: !actorModalOpen }
  );

  const isLoading = loading;
  // Local mock fallbacks when props undefined or empty
  const genreMock: Genre[] = [
    { id: 1, name: "Action", movieCount: 0 },
    { id: 2, name: "Adventure", movieCount: 0 },
    { id: 3, name: "Comedy", movieCount: 0 },
  ];
  const countryMock: Country[] = [
    { id: 1, isoCode: "US", name: "United States" },
    { id: 2, isoCode: "GB", name: "United Kingdom" },
    { id: 3, isoCode: "JP", name: "Japan" },
  ];
  const safeGenres =
    displayGenres && displayGenres.length > 0 ? displayGenres : genreMock;
  const safeCountries =
    displayCountries && displayCountries.length > 0
      ? displayCountries
      : countryMock;

  // Map incoming movie genres/countries to the display lists if provided
  const selectedGenresForDisplay =
    movieGenre && movieGenre.length > 0
      ? (movieGenre
          .map((mg) => safeGenres.find((g) => g.id === mg.id))
          .filter(Boolean) as Genre[])
      : form.genres;
  const selectedCountriesForDisplay =
    movieCountry && movieCountry.length > 0
      ? (movieCountry
          .map((mc) => safeCountries.find((c) => c.id === mc.id))
          .filter(Boolean) as Country[])
      : form.countries;

  const handleReset = () => {
    if (isLoading) return;
    update("title", "");
    update("originalTitle", "");
    update("description", "");
    update("release", "");
    update("duration", "");
    update("poster", null);
    update("backdrop", null);
    update("age", "");
    update("status", "");
    update("countries", []);
    update("genres", []);
    update("director", null);
    update("actors", []);
  };

  const getProfileUrl = (p: Person) =>
    p.profilePath || "https://via.placeholder.com/48x48.png?text=?";

  const getPreviewUrl = (fileOrString: File | string | undefined) => {
    if (!fileOrString) return undefined;
    if (typeof fileOrString === "string") return fileOrString;
    return URL.createObjectURL(fileOrString);
  };

  // Poster
  useEffect(() => {
    if (!form.poster) {
      setPosterPreview(null);
      return;
    }

    // Nếu là string (URL từ backend) thì dùng luôn, không createObjectURL
    if (typeof form.poster === "string") {
      setPosterPreview(form.poster);
      return;
    }

    const url = URL.createObjectURL(form.poster);
    setPosterPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [form.poster]);

  // Backdrop
  useEffect(() => {
    if (!form.backdrop) {
      setBackdropPreview(null);
      return;
    }

    if (typeof form.backdrop === "string") {
      setBackdropPreview(form.backdrop);
      return;
    }

    const url = URL.createObjectURL(form.backdrop);
    setBackdropPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [form.backdrop]);
  return (
    <form className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
      {/* ─── LEFT COLUMN ─── */}
      <div className="space-y-6">
        {/* POSTER */}
        <div className="space-y-2">
          <Label>Poster (Vertical)</Label>
          <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900/50">
            <Dropzone
              accept={{ "image/*": [] }}
              maxFiles={1}
              onDrop={(files) => update("poster", files[0])}
              className={`relative aspect-2/3 w-full cursor-pointer transition hover:bg-zinc-800/50 ${
                isLoading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {form.poster ? (
                <div className="relative h-full w-full group">
                  <img
                    src={posterPreview ?? undefined}
                    className="h-full w-full object-cover"
                    alt="Poster"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
                    <p className="text-xs font-medium text-white">
                      Click to change
                    </p>
                  </div>
                </div>
              ) : (
                <DropzoneEmptyState />
              )}
              <DropzoneContent />
            </Dropzone>
          </div>
        </div>
        {/* BACKDROP */}
        <div className="space-y-2">
          <Label>Backdrop (Horizontal)</Label>
          <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900/50">
            <Dropzone
              accept={{ "image/*": [] }}
              maxFiles={1}
              onDrop={(files) => update("backdrop", files[0])}
              className={`relative aspect-video w-full cursor-pointer transition hover:bg-zinc-800/50 ${
                isLoading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {form.backdrop ? (
                <div className="relative h-full w-full group">
                  <img
                    src={backdropPreview ?? undefined}
                    className="h-full w-full object-cover"
                    alt="Backdrop"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
                    <p className="text-xs font-medium text-white">Change</p>
                  </div>
                </div>
              ) : (
                <DropzoneEmptyState />
              )}
              <DropzoneContent />
            </Dropzone>
          </div>
        </div>
      </div>

      {/* ─── RIGHT COLUMN: FORM ─── */}
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Original Title & Release */}
          <div>
            <Label>Original Title</Label>
            <Input
              value={form.originalTitle}
              onChange={(e) => update("originalTitle", e.target.value)}
              disabled={isLoading}
              placeholder="Enter original title"
            />
          </div>
          <div>
            <Label>Release year</Label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Enter release year"
              value={form.release}
              onChange={(e) => {
                let val = e.target.value;

                if (val === "") {
                  update("release", "");
                  return;
                }

                if (val.length > 4) {
                  val = val.slice(0, 4);
                }

                const num = Number(val);
                if (!Number.isNaN(num)) {
                  update("release", val);
                }
              }}
              onBlur={() => {
                if (!form.release) return;

                const yr = Number(form.release);
                const min = 1900;
                const max = new Date().getFullYear();

                if (yr < min) update("release", String(min));
                if (yr > max) update("release", String(max));
              }}
              disabled={isLoading}
            />
          </div>

          {/* Title */}
          <div className="col-span-2">
            <Label>Display Title</Label>
            <Input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Duration */}
          <div>
            <Label>Duration (min)</Label>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              required
              value={
                form.duration === null || form.duration === ""
                  ? ""
                  : String(form.duration)
              }
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") {
                  update("duration", "");
                } else {
                  const n = Number(v);
                  if (!Number.isNaN(n)) update("duration", n);
                }
              }}
              disabled={isLoading}
            />
          </div>

          {/* Age Rating */}
          <div>
            <Label>Age rating</Label>
            <Select
              value={form.age}
              onValueChange={(val) => update("age", val)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                {ageRatings.map((rating) => (
                  <SelectItem key={rating.value} value={rating.value}>
                    {rating.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(val) => update("status", val)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${s.color}`} />
                      {s.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Countries (reusable) */}
        <CountrySelector
          available={safeCountries}
          selected={selectedCountriesForDisplay}
          onChange={(countries) => update("countries", countries)}
          isOpen={countryModalOpen}
          onOpenChange={(open) => {
            setCountryModalOpen(open);
            if (!open) setCountrySearch("");
          }}
          search={countrySearch}
          setSearch={setCountrySearch}
        />

        <GenreSelector
          available={safeGenres}
          selected={selectedGenresForDisplay}
          onChange={(genres) => update("genres", genres)}
          loading={formDataStatus === "loading"}
        />

        <div className="relative">
          <Label>Director</Label>
          {form.director ? (
            <div className="mt-2 flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-900 p-2 pr-3">
              <div className="flex items-center gap-3">
                <img
                  src={getProfileUrl(form.director)}
                  alt={form.director.fullName}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    {form.director.fullName}
                  </p>
                  <p className="text-xs text-zinc-400">Director</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-red-400"
                onClick={() => update("director", null)}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Input
              placeholder="Type to search director..."
              value={directorSearch}
              onChange={(e) => {
                setDirectorSearch(e.target.value);
                if (!directorModalOpen) setDirectorModalOpen(true);
                setDirectorPage(0);
              }}
              disabled={isLoading}
            />
          )}
          <PersonSelectDialog
            label="Search Director"
            open={directorModalOpen}
            onOpenChange={(open) => {
              setDirectorModalOpen(open);
              if (!open) {
                setDirectorSearch("");
                setDirectorPage(0);
              }
            }}
            search={directorSearch}
            setSearch={setDirectorSearch}
            page={directorPage}
            setPage={setDirectorPage}
            isFetching={directorFetching}
            totalPages={directorData?.totalPages || 0}
            results={directorData?.content || []}
            singleSelect
            selected={form.director ?? ({} as Person)}
            onSelect={(p) => {
              update("director", p);
              setDirectorModalOpen(false);
            }}
          />
        </div>

        {/* Actors (reusable) */}
        <div className="relative">
          <Label className="flex items-center justify-between">
            Actors{" "}
            <span className="text-xs text-zinc-400">
              {form.actors.length} selected
            </span>
          </Label>
          <div className="mb-3 mt-2 space-y-2">
            {form.actors.map((a: Person) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-900 p-2 pr-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={getProfileUrl(a)}
                    alt={a.fullName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {a.fullName}
                    </p>
                    <p className="text-xs text-zinc-400">Cast</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-red-400"
                  onClick={() =>
                    update(
                      "actors",
                      form.actors.filter((x) => x.id !== a.id)
                    )
                  }
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Input
            placeholder="Type to search actors..."
            value={actorSearch}
            onChange={(e) => {
              setActorSearch(e.target.value);
              if (!actorModalOpen) setActorModalOpen(true);
              setActorPage(0);
            }}
            disabled={isLoading}
          />
          <PersonSelectDialog
            label="Search Actors"
            open={actorModalOpen}
            onOpenChange={(open) => {
              setActorModalOpen(open);
              if (!open) {
                setActorSearch("");
                setActorPage(0);
              }
            }}
            search={actorSearch}
            setSearch={setActorSearch}
            page={actorPage}
            setPage={setActorPage}
            isFetching={actorFetching}
            totalPages={actorData?.totalPages || 0}
            results={actorData?.content || []}
            singleSelect={false}
            selected={form.actors as Person[]}
            onSelect={(p) => {
              if (!form.actors.some((a) => a.id === p.id)) {
                update("actors", [...form.actors, p]);
              }
            }}
          />
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          <Textarea
            rows={4}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex flex-col gap-3 sm:flex-row">
          {/* {showReset && (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-40 border-zinc-600 hover:bg-zinc-800"
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset Form
            </Button>
          )} */}
          <Button
            className="w-full bg-teal-600 py-6 text-lg font-bold hover:bg-teal-700 sm:flex-1"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isLoading ? "Saving..." : submitLabel || "Save Movie"}
          </Button>
        </div>
      </div>
      {/* Director Modal */}
      {/* <Dialog
        open={directorModalOpen}
        onOpenChange={(open) => {
          setDirectorModalOpen(open);
          if (!open) {
            setDirectorSearch("");
            setDirectorPage(0);
          }
        }}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Search Director</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              autoFocus
              placeholder="Enter name..."
              value={directorSearch}
              onChange={(e) => {
                setDirectorSearch(e.target.value);
                setDirectorPage(0);
              }}
            />
            <div className="max-h-72 overflow-y-auto rounded-md border border-zinc-700">
              {directorFetching && (
                <div className="p-4 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-zinc-500" />
                </div>
              )}
              {!directorFetching &&
                (directorData?.content?.length ?? 0) === 0 && (
                  <p className="p-3 text-sm text-zinc-400">No results.</p>
                )}
              {!directorFetching &&
                directorData?.content?.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      update("director", p);
                      setDirectorModalOpen(false);
                    }}
                    className="flex w-full items-center gap-3 border-b border-zinc-800 p-3 text-left hover:bg-zinc-800/60"
                  >
                    <img
                      src={getProfileUrl(p)}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium">{p.fullName}</span>
                  </button>
                ))}
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <Button
                variant="outline"
                disabled={directorPage === 0 || directorFetching}
                onClick={() => setDirectorPage((p) => Math.max(0, p - 1))}
                className="h-7 px-2"
              >
                Prev
              </Button>
              <span>
                Page {directorPage + 1} of {directorData?.totalPages || 0}
              </span>
              <Button
                variant="outline"
                disabled={
                  directorFetching ||
                  (directorData?.totalPages || 0) === 0 ||
                  directorPage + 1 >= (directorData?.totalPages || 0)
                }
                onClick={() =>
                  setDirectorPage((p) =>
                    p + 1 < (directorData?.totalPages || 0) ? p + 1 : p
                  )
                }
                className="h-7 px-2"
              >
                Next
              </Button>
            </div>
          </div>
          <DialogFooter></DialogFooter>
        </DialogContent>
      </Dialog> */}
      {/* Actor Modal */}
      {/* <Dialog
        open={actorModalOpen}
        onOpenChange={(open) => {
          setActorModalOpen(open);
          if (!open) {
            setActorSearch("");
            setActorPage(0);
          }
        }}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Search Actors</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              autoFocus
              placeholder="Enter name..."
              value={actorSearch}
              onChange={(e) => {
                setActorSearch(e.target.value);
                setActorPage(0);
              }}
            />
            <div className="max-h-72 overflow-y-auto rounded-md border border-zinc-700">
              {actorFetching && (
                <div className="p-4 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-zinc-500" />
                </div>
              )}
              {!actorFetching && (actorData?.content?.length ?? 0) === 0 && (
                <p className="p-3 text-sm text-zinc-400">No results.</p>
              )}
              {!actorFetching &&
                actorData?.content?.map((p) => {
                  const already = form.actors.some((a) => a.id === p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        if (!already) update("actors", [...form.actors, p]);
                      }}
                      className="flex w-full items-center gap-3 border-b border-zinc-800 p-3 text-left hover:bg-zinc-800/60 disabled:opacity-40"
                      disabled={already}
                    >
                      <img
                        src={getProfileUrl(p)}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {p.fullName}
                        </span>
                        {already && (
                          <span className="text-[10px] text-teal-400">
                            Added
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <Button
                variant="outline"
                disabled={actorPage === 0 || actorFetching}
                onClick={() => setActorPage((p) => Math.max(0, p - 1))}
                className="h-7 px-2"
              >
                Prev
              </Button>
              <span>
                Page {actorPage + 1} of {actorData?.totalPages || 0}
              </span>
              <Button
                variant="outline"
                disabled={
                  actorFetching ||
                  (actorData?.totalPages || 0) === 0 ||
                  actorPage + 1 >= (actorData?.totalPages || 0)
                }
                onClick={() =>
                  setActorPage((p) =>
                    p + 1 < (actorData?.totalPages || 0) ? p + 1 : p
                  )
                }
                className="h-7 px-2"
              >
                Next
              </Button>
            </div>
          </div>
          <DialogFooter></DialogFooter>
        </DialogContent>
      </Dialog> */}

      {/* Country Modal */}
      {/* <Dialog
        open={countryModalOpen}
        onOpenChange={(open) => {
          setCountryModalOpen(open);
          if (!open) {
            setCountrySearch("");
          }
        }}
      >
        <DialogContent
          className="bg-zinc-900 border-zinc-800 text-white max-w-md"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Search Countries</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter country name..."
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
            />
            <div className="max-h-72 overflow-y-auto rounded-md border border-zinc-700">
              {(
                safeCountries.filter((c) =>
                  countrySearch
                    ? c.name.toLowerCase().includes(countrySearch.toLowerCase())
                    : true
                ) || []
              ).map((c) => {
                const selected = form.countries.some((x) => x.id === c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      if (selected) {
                        update(
                          "countries",
                          form.countries.filter((x) => x.id !== c.id)
                        );
                      } else {
                        update("countries", [...form.countries, c]);
                      }
                    }}
                    className="flex w-full items-center justify-between gap-3 border-b border-zinc-800 p-3 text-left hover:bg-zinc-800/60"
                  >
                    <span className="text-sm font-medium">{c.name}</span>
                    {selected && (
                      <span className="text-[10px] text-teal-400">Added</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <DialogFooter></DialogFooter>
        </DialogContent>
      </Dialog> */}
    </form>
  );
}
