// src/components/admin/MovieAddForm.tsx

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/shadcn-io/dropzone"; // Giả định
import { ImageIcon, X, Trash2, UploadCloud } from "lucide-react";
import type { Person } from "@/types/person";
import type { Genre, Country } from "@/types/movie";
import {
  ageRatings,
  statusOptions,
  directorsMock,
  actorsMock,
} from "@/constants/movieConstants";

// Props
interface MovieAddFormProps {
  form: any;
  update: (k: string, v: any) => void;
  displayGenres: Genre[];
  displayCountries: Country[];
  formDataStatus: string;
}

export function MovieAddForm({
  form,
  update,
  displayGenres,
  displayCountries,
  formDataStatus,
}: MovieAddFormProps) {
  // State tìm kiếm Diễn viên/Đạo diễn (Vẫn dùng Mock)
  const [dirQuery, setDirQuery] = useState("");
  const [actQuery, setActQuery] = useState("");
  const [dirResults, setDirResults] = useState<Person[]>([]);
  const [actResults, setActResults] = useState<Person[]>([]);

  const search = (q: string, list: Person[]) =>
    list
      .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 5);

  const getPreviewUrl = (fileOrString: File | string | undefined) => {
    if (!fileOrString) return undefined;
    if (typeof fileOrString === "string") return fileOrString;
    return URL.createObjectURL(fileOrString);
  };

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
              className="relative aspect-[2/3] w-full cursor-pointer transition hover:bg-zinc-800/50"
            >
              {form.poster ? (
                <div className="relative h-full w-full group">
                  <img
                    src={getPreviewUrl(form.poster)}
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
                <DropzoneEmptyState
                  icon={<ImageIcon className="mb-2 size-8 text-zinc-500" />}
                  label="Upload Poster"
                  sublabel="Drop image here"
                />
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
              className="relative aspect-video w-full cursor-pointer transition hover:bg-zinc-800/50"
            >
              {form.backdrop ? (
                <div className="relative h-full w-full group">
                  <img
                    src={getPreviewUrl(form.backdrop)}
                    className="h-full w-full object-cover"
                    alt="Backdrop"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
                    <p className="text-xs font-medium text-white">Change</p>
                  </div>
                </div>
              ) : (
                <DropzoneEmptyState
                  icon={<ImageIcon className="mb-2 size-8 text-zinc-500" />}
                  label="Upload Backdrop"
                  sublabel="16:9 ratio"
                />
              )}
              <DropzoneContent />
            </Dropzone>
          </div>
        </div>
      </div>

      {/* ─── RIGHT COLUMN: FORM ─── */}
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* TMDB & Release */}
          <div>
            <Label>TMDB ID</Label>
            <Input
              value={form.tmdbId}
              readOnly
              className="bg-zinc-900 text-zinc-500 focus-visible:ring-0 cursor-not-allowed"
              placeholder="Auto-filled"
            />
          </div>
          <div>
            <Label>Release year</Label>
            <Input
              value={form.release}
              onChange={(e) => update("release", e.target.value)}
            />
          </div>

          {/* Title */}
          <div className="col-span-2">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

          {/* Duration & Country */}
          <div>
            <Label>Duration (min)</Label>
            <Input
              value={form.duration}
              onChange={(e) => update("duration", e.target.value)}
            />
          </div>
          <div>
            <Label>Country</Label>
            <div className="mt-2 flex min-h-[40px] flex-wrap gap-2">
              {formDataStatus === "loading" && (
                <p className="text-xs text-zinc-400">Loading countries...</p>
              )}
              {displayCountries.map((c) => {
                const active = form.country?.iso_code === c.iso_code;
                return (
                  <button
                    key={c.iso_code}
                    type="button"
                    onClick={() => update("country", active ? null : c)}
                  >
                    <Badge
                      className={
                        active
                          ? "bg-teal-600 hover:bg-teal-700"
                          : "bg-zinc-800 hover:bg-zinc-700/60"
                      }
                    >
                      {c.name}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Age Rating */}
          <div>
            <Label>Age rating</Label>
            <Select
              value={form.age}
              onValueChange={(val) => update("age", val)}
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

          {/* STATUS INPUT SELECTION */}
          <div>
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(val) => update("status", val)}
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

        {/* Genres */}
        <div>
          <Label>Genres</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {formDataStatus === "loading" && (
              <p className="text-xs text-zinc-400">Loading genres...</p>
            )}
            {displayGenres.map((g) => {
              const active = form.genres.some((fg) => fg.tmdb_id === g.tmdb_id);
              return (
                <button
                  key={g.tmdb_id}
                  type="button"
                  onClick={() =>
                    update(
                      "genres",
                      active
                        ? form.genres.filter((x) => x.tmdb_id !== g.tmdb_id)
                        : [...form.genres, g]
                    )
                  }
                >
                  <Badge
                    className={
                      active
                        ? "bg-teal-600 hover:bg-teal-700"
                        : "bg-zinc-800 hover:bg-zinc-700/60"
                    }
                  >
                    {g.name}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Director */}
        <div className="relative">
          <Label>Director</Label>
          {form.director ? (
            <div className="mt-2 flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-900 p-2 pr-3">
              <div className="flex items-center gap-3">
                <img
                  src={form.director.img}
                  alt={form.director.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    {form.director.name}
                  </p>
                  <p className="text-xs text-zinc-400">Director</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-red-400"
                onClick={() => update("director", null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="relative mt-1">
              <Input
                placeholder="Search director..."
                value={dirQuery}
                onChange={(e) => {
                  setDirQuery(e.target.value);
                  setDirResults(
                    e.target.value ? search(e.target.value, directorsMock) : []
                  );
                }}
              />
              {dirResults.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full divide-y divide-zinc-800 rounded-md bg-zinc-900 shadow-lg border border-zinc-800">
                  {dirResults.map((p) => (
                    <li
                      key={p.id}
                      className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-zinc-800/60"
                      onClick={() => {
                        update("director", p);
                        setDirQuery("");
                        setDirResults([]);
                      }}
                    >
                      <img
                        src={p.img}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <span className="text-sm">{p.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Actors */}
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
                    src={a.img}
                    alt={a.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{a.name}</p>
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
                      form.actors.filter((x: Person) => x.id !== a.id)
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="relative">
            <Input
              placeholder="Add actor..."
              value={actQuery}
              onChange={(e) => {
                setActQuery(e.target.value);
                setActResults(
                  e.target.value ? search(e.target.value, actorsMock) : []
                );
              }}
            />
            {actResults.length > 0 && (
              <ul className="absolute z-50 mt-1 w-full divide-y divide-zinc-800 rounded-md bg-zinc-900 shadow-lg border border-zinc-800">
                {actResults.map((p) => (
                  <li
                    key={p.id}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-zinc-800/60"
                    onClick={() => {
                      if (!form.actors.find((x) => x.id == p.id))
                        update("actors", [...form.actors, p]);
                      setActQuery("");
                      setActResults([]);
                    }}
                  >
                    <img
                      src={p.img}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <span className="text-sm">{p.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          <Textarea
            rows={4}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>

        {/* Video Upload */}
        <div className="space-y-2 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/30 p-6">
          <Label>Video File</Label>
          <Dropzone
            accept={{ "video/*": [] }}
            maxFiles={1}
            maxSize={1024 * 1024 * 1_500}
            onDrop={(files) => update("video", files[0])}
            src={form.video ? [form.video] : undefined}
          >
            <DropzoneEmptyState
              icon={<UploadCloud className="mb-2 size-10 text-zinc-500" />}
              label="Drag & drop movie file"
              sublabel="or click to browse"
            />
            <DropzoneContent />
          </Dropzone>
          {form.video && (
            <p className="text-center text-sm text-emerald-400">
              Ready: {form.video.name} (
              {(form.video.size / 1024 / 1024).toFixed(1)} MB)
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button className="w-full bg-teal-600 py-6 text-lg font-bold hover:bg-teal-700">
            Save Movie Database
          </Button>
        </div>
      </div>
    </form>
  );
}
