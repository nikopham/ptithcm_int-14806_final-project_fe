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
import { X, Trash2, Loader2, Image, Calendar, Clock, Film, Users, FileText, Globe, Tag } from "lucide-react";
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
  director: Person[]; // multi-select
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
  isEditMode?: boolean; // optional flag to indicate edit mode
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
  isEditMode = false,
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
    update("director", []);
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
          <Label className="flex items-center gap-2 text-gray-900">
            <Image className="size-4 text-[#C40E61]" />
            Poster (Dọc)
          </Label>
          <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
            <Dropzone
              accept={{ "image/*": [] }}
              maxFiles={1}
              onDrop={(files) => update("poster", files[0])}
              className={`relative aspect-2/3 w-full cursor-pointer transition hover:bg-gray-50 ${
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
                      Nhấp để thay đổi
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
          <Label className="flex items-center gap-2 text-gray-900">
            <Image className="size-4 text-[#C40E61]" />
            Backdrop (Ngang)
          </Label>
          <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
            <Dropzone
              accept={{ "image/*": [] }}
              maxFiles={1}
              onDrop={(files) => update("backdrop", files[0])}
              className={`relative aspect-video w-full cursor-pointer transition hover:bg-gray-50 ${
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
                    <p className="text-xs font-medium text-white">Thay Đổi</p>
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
            <Label className="flex items-center gap-2 text-gray-900">
              <Film className="size-4 text-[#C40E61]" />
              Tiêu Đề Gốc
            </Label>
            <Input
              value={form.originalTitle}
              onChange={(e) => update("originalTitle", e.target.value)}
              disabled={isLoading}
              placeholder="Nhập tiêu đề gốc"
              className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C40E61]"
            />
          </div>
          <div>
            <Label className="flex items-center gap-2 text-gray-900">
              <Calendar className="size-4 text-[#C40E61]" />
              Năm Phát Hành
            </Label>
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
              className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C40E61]"
            />
          </div>

          {/* Title */}
          <div className="col-span-2">
            <Label className="flex items-center gap-2 text-gray-900">
              <Film className="size-4 text-[#C40E61]" />
              Tiêu Đề Hiển Thị
            </Label>
            <Input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              disabled={isLoading}
              className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C40E61]"
            />
          </div>

          {/* Duration */}
          <div>
            <Label className="flex items-center gap-2 text-gray-900">
              <Clock className="size-4 text-[#C40E61]" />
              Thời Lượng (phút)
            </Label>
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
              className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C40E61]"
            />
          </div>

          {/* Age Rating */}
          <div>
            <Label className="flex items-center gap-2 text-gray-900">
              <Tag className="size-4 text-[#C40E61]" />
              Xếp Hạng Độ Tuổi
            </Label>
            <Select
              value={form.age}
              onValueChange={(val) => update("age", val)}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100">
                <SelectValue placeholder="Chọn xếp hạng" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300 text-gray-900">
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
            <Label className="text-gray-900">Trạng Thái</Label>
            <Select
              value={form.status}
              onValueChange={(val) => update("status", val)}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300 text-gray-900">
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${s.color}`} />
                      {s.label}
                    </div>
                  </SelectItem>
                ))}
                {isEditMode && (
                  <SelectItem value="PUBLISHED">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Đã xuất bản
                    </div>
                  </SelectItem>
                )}
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
          <Label className="flex items-center justify-between text-gray-900">
            <span className="flex items-center gap-2">
              <Users className="size-4 text-[#C40E61]" />
              Đạo Diễn
            </span>
            <span className="text-xs text-gray-500">
              {form.director.length} đã chọn
            </span>
          </Label>
          <div className="mb-3 mt-2 space-y-2">
            {form.director.map((d: Person) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-md border border-gray-300 bg-white p-2 pr-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={getProfileUrl(d)}
                    alt={d.fullName}
                    className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {d.fullName}
                    </p>
                    <p className="text-xs text-gray-500">Đạo Diễn</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() =>
                    update(
                      "director",
                      form.director.filter((x) => x.id !== d.id)
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
            placeholder="Nhập để tìm đạo diễn..."
            value={directorSearch}
            onChange={(e) => {
              setDirectorSearch(e.target.value);
              if (!directorModalOpen) setDirectorModalOpen(true);
              setDirectorPage(0);
            }}
            disabled={isLoading}
            className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C40E61]"
          />
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
            singleSelect={false}
            selected={form.director as Person[]}
            onSelect={(p) => {
              if (!form.director.some((d) => d.id === p.id)) {
                update("director", [...form.director, p]);
              }
            }}
          />
        </div>

        {/* Actors (reusable) */}
        <div className="relative">
          <Label className="flex items-center justify-between text-gray-900">
            <span className="flex items-center gap-2">
              <Users className="size-4 text-[#C40E61]" />
              Diễn Viên
            </span>
            <span className="text-xs text-gray-500">
              {form.actors.length} đã chọn
            </span>
          </Label>
          <div className="mb-3 mt-2 space-y-2">
            {form.actors.map((a: Person) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-md border border-gray-300 bg-white p-2 pr-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={getProfileUrl(a)}
                    alt={a.fullName}
                    className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {a.fullName}
                    </p>
                    <p className="text-xs text-gray-500">Diễn Viên</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
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
            placeholder="Nhập để tìm diễn viên..."
            value={actorSearch}
            onChange={(e) => {
              setActorSearch(e.target.value);
              if (!actorModalOpen) setActorModalOpen(true);
              setActorPage(0);
            }}
            disabled={isLoading}
            className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C40E61]"
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
          <Label className="flex items-center gap-2 text-gray-900">
            <FileText className="size-4 text-[#C40E61]" />
            Mô Tả
          </Label>
          <Textarea
            rows={4}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            disabled={isLoading}
            className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C40E61]"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex flex-col gap-3 sm:flex-row">
          {/* {showReset && (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-40 border-gray-300 text-gray-700 hover:bg-gray-100"
              onClick={handleReset}
              disabled={isLoading}
            >
              Đặt Lại Form
            </Button>
          )} */}
          <Button
            className="w-full bg-[#C40E61] py-6 text-lg font-bold hover:bg-[#C40E61]/90 text-white sm:flex-1"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isLoading ? "Đang lưu..." : submitLabel || "Lưu Phim"}
          </Button>
        </div>
      </div>
     
    </form>
  );
}
