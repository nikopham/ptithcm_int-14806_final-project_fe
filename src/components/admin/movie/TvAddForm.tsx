import { useEffect, useMemo, useRef, useState } from "react";
import { GenreSelector } from "@/components/admin/common/GenreSelector";
import { CountrySelector } from "@/components/admin/common/CountrySelector";
import { PersonSelectDialog } from "@/components/admin/common/PersonSelectDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// badge not used
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone"; // Giả định bạn có component này
import { X, Trash2, Loader2 } from "lucide-react";
import type { Person } from "@/types/person";
import { PersonJob } from "@/types/person";
import { useSearchPeopleQuery } from "@/features/person/personApi";
import type { Genre } from "@/types/genre";
import type { Country } from "@/types/country";
import { ageRatings, statusOptions } from "@/constants/movieConstants";

// --- Props Interface ---
export interface TvFormState {
  originalTitle?: string;
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

interface TvAddFormProps {
  form: TvFormState;
  update: <K extends keyof TvFormState>(k: K, v: TvFormState[K]) => void;
  displayGenres?: Genre[];
  displayCountries?: Country[];
  movieGenre?: Genre[];
  movieCountry?: Country[];
  formDataStatus?: string;
  loading?: boolean;
  onSubmit?: (form: TvFormState) => void;
}

// Removed TMDB auto-fill; seasons are entered manually via sheet

// --- Helper Functions ---

const getPreviewUrl = (fileOrString: File | string | undefined) => {
  if (!fileOrString) return undefined;
  if (typeof fileOrString === "string") return fileOrString;
  return URL.createObjectURL(fileOrString);
};

// --- Component ---
export function TvAddForm({
  form,
  update,
  displayGenres,
  displayCountries,
  movieGenre,
  movieCountry,
  formDataStatus = "idle",
  loading = false,
  onSubmit,
}: TvAddFormProps) {
  // People modal state + search/pagination (match MovieAddForm)
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

  // Countries modal state
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const isLoading = loading;
  // Map incoming movie genres/countries to the display lists if provided
  const safeGenres = useMemo(() => displayGenres ?? [], [displayGenres]);
  const safeCountries = useMemo(
    () => displayCountries ?? [],
    [displayCountries]
  );
  const selectedGenresForDisplay = useMemo(() => {
    if (movieGenre && movieGenre.length > 0) {
      return movieGenre
        .map((mg) => safeGenres.find((g) => g.id === mg.id))
        .filter(Boolean) as Genre[];
    }
    return form.genres || [];
  }, [movieGenre, safeGenres, form.genres]);
  const selectedCountriesForDisplay = useMemo(() => {
    if (movieCountry && movieCountry.length > 0) {
      return movieCountry
        .map((mc) => safeCountries.find((c) => c.id === mc.id))
        .filter(Boolean) as Country[];
    }
    return form.countries || [];
  }, [movieCountry, safeCountries, form.countries]);
  const releaseYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1900 }, (_, i) =>
      String(currentYear - i)
    );
  }, []);
  const [seasonSheetOpen, setSeasonSheetOpen] = useState(false);

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

  const { data: actorData, isFetching: actorFetching } = useSearchPeopleQuery(
    {
      query: actorSearch || undefined,
      job: PersonJob.ACTOR,
      page: actorPage + 1,
      size: PAGE_SIZE,
    },
    { skip: !actorModalOpen }
  );

  // Guard optional arrays (not used directly but kept if later needed)
  return (
    <form className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
      {/* LEFT COLUMN: uploads */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Ảnh Bìa (Dọc)</Label>
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
                    alt="Ảnh Bìa"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
                    <p className="text-xs font-medium text-white">
                      Nhấn để thay đổi
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
        <div className="space-y-2">
          <Label>Ảnh Nền (Ngang)</Label>
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
                    alt="Ảnh Nền"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
                    <p className="text-xs font-medium text-white">Thay đổi</p>
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

      {/* RIGHT COLUMN: form */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Tiêu Đề Gốc</Label>
            <Input
              value={form.originalTitle ?? ""}
              onChange={(e) =>
                update("originalTitle", e.target.value as unknown as string)
              }
              disabled={isLoading}
              placeholder="Nhập tiêu đề gốc"
            />
          </div>
          <div>
            <Label>Năm Phát Hành</Label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Nhập năm phát hành"
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

          <div className="col-span-2">
            <Label>Tiêu Đề Hiển Thị</Label>
            <Input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label>Xếp Hạng Độ Tuổi</Label>
            <Select
              value={form.age}
              onValueChange={(val) => update("age", val)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn xếp hạng" />
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
          <div>
            <Label>Trạng Thái</Label>
            <Select
              value={form.status}
              onValueChange={(val) => update("status", val)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
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

        {/* Genres (reusable) */}
        <GenreSelector
          available={safeGenres}
          selected={selectedGenresForDisplay}
          onChange={(genres) => update("genres", genres)}
          loading={formDataStatus === "loading"}
        />

        {/* Seasons summary + sheet trigger */}
        <div className="border-t border-zinc-800 pt-4">
          <div className="flex items-center justify-between">
            <Label>Mùa tùy chỉnh (bản nháp)</Label>
            <Button
              type="button"
              size="sm"
              onClick={() => setSeasonSheetOpen(true)}
            >
              Quản Lý Mùa
            </Button>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            {form.seasonDrafts?.length || 0} mùa đã cấu hình
          </p>
          <div className="mt-2 space-y-2">
            {(form.seasonDrafts || []).map((s, idx) => (
              <div key={idx} className="rounded border border-zinc-800 p-2">
                <div className="text-sm text-white">
                  Mùa {s.seasonNumber} {s.title ? `- ${s.title}` : ""}
                </div>
                <div className="text-xs text-zinc-400">
                  {s.episodes?.length || 0} tập
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Director */}
        <div className="relative">
          <Label>Đạo Diễn</Label>
          {form.director ? (
            <div className="mt-2 flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-900 p-2 pr-3">
              <div className="flex items-center gap-3">
                <img
                  src={
                    form.director.profilePath ||
                    "https://via.placeholder.com/48x48.png?text=?"
                  }
                  alt={form.director.fullName}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    {form.director.fullName}
                  </p>
                  <p className="text-xs text-zinc-400">Đạo Diễn</p>
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
              placeholder="Nhập để tìm đạo diễn..."
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
            label="Tìm Đạo Diễn"
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
            selected={(form.director ?? ({} as Person)) as Person}
            onSelect={(p) => {
              update("director", p);
              setDirectorModalOpen(false);
            }}
          />
        </div>

        {/* Actors */}
        <div className="relative">
          <Label className="flex items-center justify-between">
            Diễn Viên{" "}
            <span className="text-xs text-zinc-400">
              {(form.actors || []).length} đã chọn
            </span>
          </Label>
          <div className="mb-3 mt-2 space-y-2">
            {(form.actors || []).map((a: Person) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-900 p-2 pr-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      a.profilePath ||
                      "https://via.placeholder.com/48x48.png?text=?"
                    }
                    alt={a.fullName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {a.fullName}
                    </p>
                    <p className="text-xs text-zinc-400">Diễn Viên</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-red-400"
                  onClick={() =>
                    update(
                      "actors",
                      (form.actors || []).filter((x: Person) => x.id !== a.id)
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
            placeholder="Nhập để tìm diễn viên..."
            value={actorSearch}
            onChange={(e) => {
              setActorSearch(e.target.value);
              if (!actorModalOpen) setActorModalOpen(true);
              setActorPage(0);
            }}
            disabled={isLoading}
          />
          <PersonSelectDialog
            label="Tìm Diễn Viên"
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
            selected={(form.actors || []) as Person[]}
            onSelect={(p) => {
              const already = (form.actors || []).some((a) => a.id === p.id);
              if (!already) update("actors", [...(form.actors || []), p]);
            }}
          />
        </div>

        {/* Description */}
        <div>
          <Label>Mô Tả</Label>
          <Textarea
            rows={4}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Submit */}
        <div className="pt-4 flex flex-col gap-3 sm:flex-row">
          {/* <Button
            type="button"
            variant="outline"
            className="w-full sm:w-40 border-zinc-600 hover:bg-zinc-800"
            disabled={isLoading}
            onClick={() => {
              if (isLoading) return;
              update("title", "");
              update("description", "");
              update("release", "");
              update("duration", "");
              update("poster", null);
              update("backdrop", null);
              update("trailerUrl", "");
              update("age", "");
              update("status", "");
              update("countries", []);
              update("genres", []);
              update("director", null);
              update("actors", []);
              update("seasons", []);
            }}
          >
            Đặt Lại Form
          </Button> */}
          <Button
            className="w-full bg-teal-600 py-6 text-lg font-bold hover:bg-teal-700 sm:flex-1"
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault();
              onSubmit?.(form);
            }}
          >
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isLoading ? "Đang lưu..." : "Lưu Phim Bộ"}
          </Button>
        </div>
      </div>

      {/* Seasons Sheet */}
      <SeasonsSheet
        form={form}
        update={update}
        disabled={isLoading}
        open={seasonSheetOpen}
        onOpenChange={setSeasonSheetOpen}
      />

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
        <DialogContent
          className="bg-zinc-900 border-zinc-800 text-white max-w-md"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Search Director</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
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
                      src={
                        p.profilePath ||
                        "https://via.placeholder.com/48x48.png?text=?"
                      }
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
        <DialogContent
          className="bg-zinc-900 border-zinc-800 text-white max-w-md"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Search Actors</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
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
                        src={
                          p.profilePath ||
                          "https://via.placeholder.com/48x48.png?text=?"
                        }
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
              {(displayCountries ?? [])
                .filter((c) =>
                  countrySearch
                    ? c.name.toLowerCase().includes(countrySearch.toLowerCase())
                    : true
                )
                .map((c) => {
                  const selected = (form.countries || []).some(
                    (x) => x.id === c.id
                  );
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        if (selected) {
                          update(
                            "countries",
                            (form.countries || []).filter((x) => x.id !== c.id)
                          );
                        } else {
                          update("countries", [...(form.countries || []), c]);
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

function SeasonsSheet({
  form,
  update,
  disabled,
  open,
  onOpenChange,
}: {
  form: TvFormState;
  update: <K extends keyof TvFormState>(k: K, v: TvFormState[K]) => void;
  disabled: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [drafts, setDrafts] = useState<TvFormState["seasonDrafts"]>(
    form.seasonDrafts && form.seasonDrafts.length ? form.seasonDrafts : []
  );

  const addSeason = () => {
    const nextNum = (drafts?.[drafts.length - 1]?.seasonNumber || 0) + 1;
    setDrafts([
      ...(drafts || []),
      { seasonNumber: nextNum, title: "", episodes: [] },
    ]);
  };
  const removeSeason = (i: number) => {
    setDrafts((prev) => prev.filter((_, idx) => idx !== i));
  };
  const updateSeason = (
    i: number,
    patch: Partial<TvFormState["seasonDrafts"][number]>
  ) => {
    setDrafts((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s))
    );
  };
  const addEpisode = (si: number) => {
    const nextEp =
      (drafts?.[si]?.episodes?.[drafts[si].episodes.length - 1]
        ?.episodeNumber || 0) + 1;
    setDrafts((prev) =>
      prev.map((s, idx) =>
        idx === si
          ? {
              ...s,
              episodes: [
                ...(s.episodes || []),
                {
                  episodeNumber: nextEp,
                  title: "",
                  durationMin: undefined,
                  synopsis: "",
                  airDate: "",
                },
              ],
            }
          : s
      )
    );
  };
  const updateEpisode = (
    si: number,
    ei: number,
    patch: Partial<TvFormState["seasonDrafts"][number]["episodes"][number]>
  ) => {
    setDrafts((prev) =>
      prev.map((s, idx) =>
        idx === si
          ? {
              ...s,
              episodes: s.episodes.map((e, eidx) =>
                eidx === ei ? { ...e, ...patch } : e
              ),
            }
          : s
      )
    );
  };
  const removeEpisode = (si: number, ei: number) => {
    setDrafts((prev) =>
      prev.map((s, idx) =>
        idx === si
          ? { ...s, episodes: s.episodes.filter((_, eidx) => eidx !== ei) }
          : s
      )
    );
  };

  // --- Duplicate Validation Helpers ---
  const seasonDuplicateSet = (() => {
    const counts: Record<number, number> = {};
    drafts.forEach((s) => {
      if (Number.isFinite(s.seasonNumber)) {
        counts[s.seasonNumber] = (counts[s.seasonNumber] || 0) + 1;
      }
    });
    return new Set(
      Object.entries(counts)
        .filter(([, v]) => v > 1)
        .map(([k]) => Number(k))
    );
  })();

  const hasEpisodeDuplicates = drafts.some((s) => {
    const epNums = s.episodes
      .map((e) => e.episodeNumber)
      .filter((n) => Number.isFinite(n));
    const dup = epNums.filter((n, i, arr) => arr.indexOf(n) !== i);
    return dup.length > 0;
  });

  const hasSeasonDuplicates = seasonDuplicateSet.size > 0;
  const hasAnyDuplicates = hasSeasonDuplicates || hasEpisodeDuplicates;

  // --- Required Field Validation ---
  const seasonInvalidSet = new Set<number>();
  const episodeInvalidMap: Record<number, Set<number>> = {};

  drafts.forEach((s, si) => {
    const seasonInvalid = s.seasonNumber < 0 || !s.title?.trim();

    if (seasonInvalid) seasonInvalidSet.add(si);
    s.episodes.forEach((e, ei) => {
      const epInvalid =
        !e.episodeNumber ||
        e.episodeNumber < 0 ||
        !e.title?.trim() ||
        !e.durationMin ||
        e.durationMin <= 0 ||
        !e.synopsis?.trim() ||
        !e.airDate?.trim();
      if (epInvalid) {
        if (!episodeInvalidMap[si]) episodeInvalidMap[si] = new Set<number>();
        episodeInvalidMap[si].add(ei);
      }
    });
  });
  const hasInvalid =
    seasonInvalidSet.size > 0 ||
    Object.values(episodeInvalidMap).some((set) => set.size > 0);
  const hasBlockingIssues = hasAnyDuplicates || hasInvalid;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-zinc-950 text-white border-zinc-800 w-[95vw] sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Quản Lý Mùa & Tập</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-6 overflow-y-auto pr-2 max-h-[85vh]">
          {(hasAnyDuplicates || hasInvalid) && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 space-y-1">
              {hasAnyDuplicates && (
                <p>
                  Phát hiện số trùng lặp: đảm bảo mỗi số mùa là duy nhất và số tập trong mỗi mùa là duy nhất.
                </p>
              )}
              {hasInvalid && (
                <p>
                  Thiếu các trường bắt buộc: số mùa/tiêu đề và số tập/tiêu đề/thời lượng/tóm tắt/năm phải được điền và lớn hơn hoặc bằng 0.
                </p>
              )}
            </div>
          )}
          {(drafts || []).map((s, si) => (
            <div key={si} className="rounded-lg border border-zinc-800 p-3">
              <div className="flex items-center gap-2">
                <Label className="w-28">Số mùa</Label>
                <div className="flex flex-col">
                  <Input
                    className={`w-24 ${seasonDuplicateSet.has(s.seasonNumber) || seasonInvalidSet.has(si) ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    type="number"
                    value={s.seasonNumber}
                    onChange={(e) =>
                      updateSeason(si, { seasonNumber: Number(e.target.value) })
                    }
                    disabled={disabled}
                  />
                  {seasonDuplicateSet.has(s.seasonNumber) && (
                    <span className="mt-1 text-[10px] text-red-400">
                      Số mùa trùng lặp
                    </span>
                  )}
                  {!seasonDuplicateSet.has(s.seasonNumber) &&
                    seasonInvalidSet.has(si) && (
                      <span className="mt-1 text-[10px] text-red-400">
                        Bắt buộc (lớn hơn hoặc bằng 0)
                      </span>
                    )}
                </div>
                <Label className="ml-4 w-12">Tiêu đề</Label>
                <Input
                  value={s.title ?? ""}
                  onChange={(e) => updateSeason(si, { title: e.target.value })}
                  className={`${seasonInvalidSet.has(si) && !s.title?.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  disabled={disabled}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="ml-auto text-red-400"
                  onClick={() => removeSeason(si)}
                  disabled={disabled}
                >
                  Xóa
                </Button>
              </div>
              <div className="mt-3 space-y-2">
                {(s.episodes || []).map((ep, ei) => {
                  const currentYear = new Date().getFullYear();
                  const years = Array.from(
                    { length: currentYear - 1900 },
                    (_, i) => String(currentYear - i)
                  );
                  const existingYear = ep.airDate?.slice(0, 4) || "";
                  const episodeDuplicateSet = (() => {
                    const nums = s.episodes
                      .map((e) => e.episodeNumber)
                      .filter((n) => Number.isFinite(n));
                    return new Set(
                      nums.filter((n, i, arr) => arr.indexOf(n) !== i)
                    );
                  })();
                  const isEpisodeInvalid = episodeInvalidMap[si]?.has(ei);
                  return (
                    <div
                      key={ei}
                      className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">
                          Tập #{ei + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-400"
                          onClick={() => removeEpisode(si, ei)}
                          disabled={disabled}
                        >
                          Xóa
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-zinc-400">
                            Số tập
                          </Label>
                          <div className="flex flex-col">
                            <Input
                              type="number"
                              value={ep.episodeNumber}
                              onChange={(e) =>
                                updateEpisode(si, ei, {
                                  episodeNumber: Number(e.target.value),
                                })
                              }
                              className={`${episodeDuplicateSet.has(ep.episodeNumber) || (isEpisodeInvalid && (!ep.episodeNumber || ep.episodeNumber <= 0)) ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                              disabled={disabled}
                            />
                            {episodeDuplicateSet.has(ep.episodeNumber) && (
                              <span className="mt-1 text-[10px] text-red-400">
                                Số tập trùng lặp
                              </span>
                            )}
                            {!episodeDuplicateSet.has(ep.episodeNumber) &&
                              isEpisodeInvalid &&
                              (!ep.episodeNumber || ep.episodeNumber < 0) && (
                                <span className="mt-1 text-[10px] text-red-400">
                                  Bắt buộc (lớn hơn hoặc bằng 0)
                                </span>
                              )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-zinc-400">Tiêu đề</Label>
                          <Input
                            placeholder="Tiêu đề tập"
                            value={ep.title}
                            onChange={(e) =>
                              updateEpisode(si, ei, { title: e.target.value })
                            }
                            className={`${isEpisodeInvalid && !ep.title?.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            disabled={disabled}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-zinc-400">
                            Thời lượng (phút)
                          </Label>
                          <Input
                            type="number"
                            placeholder="ví dụ: 42"
                            value={ep.durationMin ?? ""}
                            onChange={(e) =>
                              updateEpisode(si, ei, {
                                durationMin: Number(e.target.value),
                              })
                            }
                            className={`${isEpisodeInvalid && (!ep.durationMin || ep.durationMin <= 0) ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            disabled={disabled}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-zinc-400">
                            Năm phát sóng
                          </Label>
                          <Select
                            value={existingYear}
                            onValueChange={(year) =>
                              updateEpisode(si, ei, {
                                airDate: `${year}-01-01`,
                              })
                            }
                            disabled={disabled}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Năm" />
                            </SelectTrigger>
                            <SelectContent className="max-h-72 overflow-y-auto">
                              {years.map((y) => (
                                <SelectItem key={y} value={y}>
                                  {y}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {isEpisodeInvalid && !existingYear && (
                            <span className="mt-1 text-[10px] text-red-400">
                              Bắt buộc
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-zinc-400">
                          Tóm tắt
                        </Label>
                        <Textarea
                          placeholder="Tóm tắt ngắn tập phim"
                          value={ep.synopsis ?? ""}
                          onChange={(e) =>
                            updateEpisode(si, ei, { synopsis: e.target.value })
                          }
                          className={`${isEpisodeInvalid && !ep.synopsis?.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          disabled={disabled}
                        />
                      </div>
                    </div>
                  );
                })}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addEpisode(si)}
                  disabled={disabled}
                >
                  Thêm tập
                </Button>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            onClick={addSeason}
            disabled={disabled}
          >
            Thêm mùa
          </Button>
        </div>
        <SheetFooter className="mt-4">
          <Button
            type="button"
            className="bg-teal-600 hover:bg-teal-700"
            onClick={() => {
              update("seasonDrafts", drafts || []);
              onOpenChange(false);
            }}
            disabled={disabled || hasBlockingIssues}
          >
            Lưu mùa
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
