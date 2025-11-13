import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
 Label
} from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Search } from "lucide-react";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { Badge } from "@/components/ui/badge";
/* ─── mock genre list (TMDB) ─── */
const tmdbGenres = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "History",
  "Horror",
  "Music",
  "Mystery",
  "Romance",
  "Science Fiction",
  "Thriller",
  "TV Movie",
  "War",
  "Western"
];
/* ─── mock TMDB people list ─── */
type Person = { id: number; name: string; img: string };
const directorsMock: Person[] = [
  { id: 1, name: "Christopher Nolan", img: "https://i.pravatar.cc/40?img=1" },
  { id: 2, name: "Greta Gerwig", img: "https://i.pravatar.cc/40?img=2" },
  { id: 3, name: "Bong Joon-ho", img: "https://i.pravatar.cc/40?img=3" },
];
const actorsMock: Person[] = [
  { id: 10, name: "Cillian Murphy", img: "https://i.pravatar.cc/40?img=10" },
  { id: 11, name: "Emily Blunt", img: "https://i.pravatar.cc/40?img=11" },
  { id: 12, name: "Ryan Gosling", img: "https://i.pravatar.cc/40?img=12" },
  { id: 13, name: "Margot Robbie", img: "https://i.pravatar.cc/40?img=13" },
];

/* ─── demo search data ─── */
const tmdbMock = [
  {
    id: 1,
    title: "Oppenheimer",
    release: "2023",
    overview: "The story of J. Robert Oppenheimer…",
    country: "US",
    genres: ["Drama", "History"],
    director: "Christopher Nolan",
    actors: ["Cillian Murphy", "Emily Blunt"],
  },
  {
    id: 2,
    title: "Parasite",
    release: "2019",
    overview: "Greed and class discrimination ...",
    country: "KR",
    genres: ["Thriller", "Drama"],
    director: "Bong Joon-ho",
    actors: ["Song Kang-ho", "Jang Hye-jin"],
  },
];

export default function MovieAdd() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof tmdbMock>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  /* inside component */
  const [dirQuery, setDirQuery] = useState("");
  const [actQuery, setActQuery] = useState("");
  const [dirResults, setDirResults] = useState<Person[]>([]);
  const [actResults, setActResults] = useState<Person[]>([]);

  /* helper search */
  const search = (q: string, list: Person[]) =>
    list
      .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 5);

  /* form state */
  const [form, setForm] = useState({
    title: "",
    description: "",
    release: "",
    country: "",
    genres: [] as string[],
    director: "",
    actors: [] as Person[],
    duration: "",
    age: "",
    video: undefined as File | undefined,
  });

  /* handle pick result */
  const pick = (m: (typeof tmdbMock)[0]) => {
    setForm((f) => ({
      ...f,
      title: m.title,
      description: m.overview,
      release: m.release,
      country: m.country,
      genres: m.genres,
      director: m.director,
      actors: m.actors.join(", "),
    }));
    setSheetOpen(false);
  };

  /* mock search */
  const doSearch = () => {
    const kw = query.toLowerCase();
    setResults(
      tmdbMock.filter((r) => r.title.toLowerCase().includes(kw)).slice(0, 5)
    );
    setSheetOpen(true);
  };

  const update = (k: keyof typeof form, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <section className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold text-white">Add new movie</h1>

      {/* search */}
      <div className="flex gap-3">
        <Input
          placeholder="Search TMDB…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={doSearch} disabled={!query}>
          <Search className="mr-1 size-4" /> Search
        </Button>
      </div>

      {/* search sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="top" className="max-h-80 overflow-y-auto">
          <h3 className="mb-4 font-semibold">Results</h3>
          {results.length === 0 && (
            <p className="text-sm text-zinc-400">No match</p>
          )}
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => pick(r)}
              className="block w-full rounded-md p-3 text-left hover:bg-zinc-800/50"
            >
              <p className="font-medium text-white">{r.title}</p>
              <p className="text-xs text-zinc-400">{r.release}</p>
            </button>
          ))}
        </SheetContent>
      </Sheet>

      {/* form */}
      <form className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>
          <div>
            <Label>Release year</Label>
            <Input
              value={form.release}
              onChange={(e) => update("release", e.target.value)}
            />
          </div>
          <div>
            <Label>Duration (min)</Label>
            <Input
              value={form.duration}
              onChange={(e) => update("duration", e.target.value)}
            />
          </div>
          <div>
            <Label>Age rating</Label>
            <Input
              value={form.age}
              onChange={(e) => update("age", e.target.value)}
            />
          </div>
          <div>
            <Label>Country</Label>
            <Input
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
            />
          </div>
          <div>
            <Label>Genres</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {tmdbGenres.map((g) => {
                const active = form.genres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() =>
                      update(
                        "genres",
                        active
                          ? form.genres.filter((x) => x !== g)
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
                      {g}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
          {/* ─── DIRECTOR single picker ─── */}
          <div className="relative">
            <Label>Director</Label>
            <Input
              placeholder="Search director..."
              value={dirQuery}
              onChange={(e) => {
                const v = e.target.value;
                setDirQuery(v);
                setDirResults(v ? search(v, directorsMock) : []);
              }}
            />

            {/* dropdown */}
            {dirResults.length > 0 && (
              <ul className="absolute z-50 mt-1 w-full divide-y divide-zinc-800 rounded-md bg-zinc-900 shadow-lg">
                {dirResults.map((p) => (
                  <li
                    key={p.id}
                    className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-zinc-800/60"
                    onClick={() => {
                      update("director", p.name);
                      setDirQuery(p.name);
                      setDirResults([]);
                    }}
                  >
                    <img src={p.img} className="h-6 w-6 rounded-full" />
                    <span className="text-sm">{p.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ─── ACTORS multi picker ─── */}
          <div className="relative">
            <Label className="flex items-center justify-between">
              Actors
              <span className="text-xs text-zinc-400">
                {form.actors.length} selected
              </span>
            </Label>

            {/* chips */}
            <div className="mb-2 flex flex-wrap gap-2">
              {form.actors.map((a: Person) => (
                <span
                  key={a.id}
                  className="flex items-center gap-1 rounded bg-teal-700 px-2 py-0.5 text-xs"
                >
                  {a.name}
                  <button
                    onClick={() =>
                      update(
                        "actors",
                        form.actors.filter((x: Person) => x.id !== a.id)
                      )
                    }
                    className="text-zinc-200 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* search box */}
            <Input
              placeholder="Add actor..."
              value={actQuery}
              onChange={(e) => {
                const v = e.target.value;
                setActQuery(v);
                setActResults(v ? search(v, actorsMock) : []);
              }}
            />

            {/* dropdown list */}
            {actResults.length > 0 && (
              <ul className="absolute z-50 mt-1 w-full divide-y divide-zinc-800 rounded-md bg-zinc-900 shadow-lg">
                {actResults.map((p) => (
                  <li
                    key={p.id}
                    className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-zinc-800/60"
                    onClick={() => {
                      if (!form.actors.find((x: Person) => x.id == p.id)) {
                        update("actors", [...form.actors, p]);
                      }
                      setActQuery("");
                      setActResults([]);
                    }}
                  >
                    <img src={p.img} className="h-6 w-6 rounded-full" />
                    <span className="text-sm">{p.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            rows={4}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>

        {/* upload */}
        <div className="space-y-2">
          <Label>Video source</Label>
          <Dropzone
            accept={{ "video/*": [] }}
            maxFiles={1}
            maxSize={1024 * 1024 * 1_500} /* ≈1.5 GB */
            onDrop={(files) => update("video", files[0])}
            onError={console.error}
            src={form.video ? [form.video] : undefined}
          >
            <DropzoneEmptyState
              label="Drag & drop movie file"
              sublabel="or click to browse"
            />
            <DropzoneContent />
          </Dropzone>

          {form.video && (
            <p className="text-sm text-emerald-400">
              Selected: {form.video.name} —{" "}
              {(form.video.size / 1024 / 1024).toFixed(1)}
              MB
            </p>
          )}
        </div>

        <Button className="bg-teal-600 hover:bg-teal-700">Save movie</Button>
      </form>
    </section>
  );
}
