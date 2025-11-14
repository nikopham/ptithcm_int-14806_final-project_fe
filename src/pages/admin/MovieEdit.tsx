// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Input } from "@/components/ui/input";
// import { Sheet, SheetContent } from "@/components/ui/sheet";
// import {
//   Search,
//   X,
//   Trash2,
//   Image as ImageIcon,
//   UploadCloud,
// } from "lucide-react";
// import {
//   Dropzone,
//   DropzoneContent,
//   DropzoneEmptyState,
// } from "@/components/ui/shadcn-io/dropzone";
// import { Badge } from "@/components/ui/badge";

// /* ─── mock genre list ─── */
// const tmdbGenres = [
//   "Action",
//   "Adventure",
//   "Animation",
//   "Comedy",
//   "Crime",
//   "Documentary",
//   "Drama",
//   "Family",
//   "Fantasy",
//   "History",
//   "Horror",
//   "Music",
//   "Mystery",
//   "Romance",
//   "Science Fiction",
//   "Thriller",
//   "TV Movie",
//   "War",
//   "Western",
// ];

// /* ─── mock TMDB people list ─── */
// type Person = { id: number; name: string; img: string };

// const directorsMock: Person[] = [
//   { id: 1, name: "Christopher Nolan", img: "https://i.pravatar.cc/150?img=1" },
//   { id: 2, name: "Greta Gerwig", img: "https://i.pravatar.cc/150?img=5" },
//   { id: 3, name: "Bong Joon-ho", img: "https://i.pravatar.cc/150?img=3" },
// ];
// const actorsMock: Person[] = [
//   { id: 10, name: "Cillian Murphy", img: "https://i.pravatar.cc/150?img=11" },
//   { id: 11, name: "Emily Blunt", img: "https://i.pravatar.cc/150?img=10" },
//   { id: 12, name: "Ryan Gosling", img: "https://i.pravatar.cc/150?img=12" },
//   { id: 13, name: "Margot Robbie", img: "https://i.pravatar.cc/150?img=9" },
// ];

// /* ─── demo search data (Đã thêm ảnh mock) ─── */
// const tmdbMock = [
//   {
//     id: 1,
//     title: "Oppenheimer",
//     release: "2023",
//     overview: "The story of J. Robert Oppenheimer…",
//     country: "US",
//     genres: ["Drama", "History"],
//     director: "Christopher Nolan",
//     actors: ["Cillian Murphy", "Emily Blunt"],
//     // Mock ảnh URL
//     poster_path:
//       "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
//     backdrop_path:
//       "https://image.tmdb.org/t/p/w1280/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
//   },
//   {
//     id: 2,
//     title: "Parasite",
//     release: "2019",
//     overview: "Greed and class discrimination ...",
//     country: "KR",
//     genres: ["Thriller", "Drama"],
//     director: "Bong Joon-ho",
//     actors: ["Song Kang-ho", "Jang Hye-jin"],
//     poster_path:
//       "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
//     backdrop_path:
//       "https://image.tmdb.org/t/p/w1280/hiKmpZMGZsrkA3cdce8a7DwyQP2.jpg",
//   },
// ];

// export default function MovieAdd() {
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState<typeof tmdbMock>([]);
//   const [sheetOpen, setSheetOpen] = useState(false);

//   const [dirQuery, setDirQuery] = useState("");
//   const [actQuery, setActQuery] = useState("");
//   const [dirResults, setDirResults] = useState<Person[]>([]);
//   const [actResults, setActResults] = useState<Person[]>([]);

//   /* helper search */
//   const search = (q: string, list: Person[]) =>
//     list
//       .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
//       .slice(0, 5);

//   /* form state */
//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     release: "",
//     country: "",
//     genres: [] as string[],
//     director: null as Person | null,
//     actors: [] as Person[],
//     duration: "",
//     age: "",
//     poster: undefined as File | string | undefined, // Cho phép File hoặc URL string
//     backdrop: undefined as File | string | undefined, // Cho phép File hoặc URL string
//     video: undefined as File | undefined,
//   });

//   /* Hàm helper lấy URL để hiển thị */
//   const getPreviewUrl = (fileOrString: File | string | undefined) => {
//     if (!fileOrString) return undefined;
//     if (typeof fileOrString === "string") return fileOrString;
//     return URL.createObjectURL(fileOrString);
//   };

//   /* handle pick result from TMDB */
//   const pick = (m: (typeof tmdbMock)[0]) => {
//     const fakeDirectorObj: Person = {
//       id: 999,
//       name: m.director,
//       img: `https://ui-avatars.com/api/?name=${m.director}&background=random`,
//     };
//     const fakeActorsObj = m.actors.map((name, idx) => ({
//       id: 1000 + idx,
//       name: name,
//       img: `https://ui-avatars.com/api/?name=${name}&background=random`,
//     }));

//     setForm((f) => ({
//       ...f,
//       title: m.title,
//       description: m.overview,
//       release: m.release,
//       country: m.country,
//       genres: m.genres,
//       director: fakeDirectorObj,
//       actors: fakeActorsObj,
//       poster: m.poster_path, // Gán URL từ API
//       backdrop: m.backdrop_path, // Gán URL từ API
//     }));
//     setSheetOpen(false);
//   };

//   const doSearch = () => {
//     const kw = query.toLowerCase();
//     setResults(
//       tmdbMock.filter((r) => r.title.toLowerCase().includes(kw)).slice(0, 5)
//     );
//     setSheetOpen(true);
//   };

//   const update = (k: keyof typeof form, v: any) =>
//     setForm((f) => ({ ...f, [k]: v }));

//   return (
//     <section className="mx-auto max-w-4xl space-y-8 pb-20">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold text-white">Add new movie</h1>
//         <div className="flex gap-2">
//           <Input
//             className="w-[250px]"
//             placeholder="Search TMDB…"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//           />
//           <Button onClick={doSearch} disabled={!query} variant="secondary">
//             <Search className="mr-1 size-4" /> Auto-fill
//           </Button>
//         </div>
//       </div>

//       <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
//         <SheetContent side="top" className="max-h-80 overflow-y-auto">
//           <h3 className="mb-4 font-semibold">Select Movie</h3>
//           {results.map((r) => (
//             <button
//               key={r.id}
//               onClick={() => pick(r)}
//               className="flex w-full items-start gap-3 rounded-md p-3 text-left hover:bg-zinc-800/50"
//             >
//               {/* Hiển thị thumbnail nhỏ trong kết quả tìm kiếm */}
//               <img
//                 src={r.poster_path}
//                 className="h-16 w-10 rounded object-cover bg-zinc-800"
//               />
//               <div>
//                 <p className="font-medium text-white">{r.title}</p>
//                 <p className="text-xs text-zinc-400">
//                   {r.release} • {r.country}
//                 </p>
//               </div>
//             </button>
//           ))}
//         </SheetContent>
//       </Sheet>

//       <form className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
//         {/* ─── CỘT TRÁI: ẢNH (Poster & Backdrop) ─── */}
//         <div className="space-y-6">
//           {/* 1. POSTER INPUT */}
//           <div className="space-y-2">
//             <Label>Poster (Vertical)</Label>
//             <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900/50">
//               <Dropzone
//                 accept={{ "image/*": [] }}
//                 maxFiles={1}
//                 onDrop={(files) => update("poster", files[0])}
//                 className="relative aspect-[2/3] w-full cursor-pointer transition hover:bg-zinc-800/50"
//               >
//                 {/* Nếu có ảnh (URL hoặc File) thì hiển thị full */}
//                 {form.poster ? (
//                   <div className="relative h-full w-full group">
//                     <img
//                       src={getPreviewUrl(form.poster)}
//                       className="h-full w-full object-cover"
//                       alt="Poster"
//                     />
//                     <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
//                       <p className="text-xs font-medium text-white">
//                         Click to change
//                       </p>
//                     </div>
//                   </div>
//                 ) : (
//                   <DropzoneEmptyState
//                     icon={<ImageIcon className="mb-2 size-8 text-zinc-500" />}
//                     label="Upload Poster"
//                     sublabel="Drop image here"
//                   />
//                 )}
//                 <DropzoneContent />
//               </Dropzone>
//             </div>
//           </div>

//           {/* 2. BACKDROP INPUT */}
//           <div className="space-y-2">
//             <Label>Backdrop (Horizontal)</Label>
//             <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900/50">
//               <Dropzone
//                 accept={{ "image/*": [] }}
//                 maxFiles={1}
//                 onDrop={(files) => update("backdrop", files[0])}
//                 className="relative aspect-video w-full cursor-pointer transition hover:bg-zinc-800/50"
//               >
//                 {form.backdrop ? (
//                   <div className="relative h-full w-full group">
//                     <img
//                       src={getPreviewUrl(form.backdrop)}
//                       className="h-full w-full object-cover"
//                       alt="Backdrop"
//                     />
//                     <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
//                       <p className="text-xs font-medium text-white">Change</p>
//                     </div>
//                   </div>
//                 ) : (
//                   <DropzoneEmptyState
//                     icon={<ImageIcon className="mb-2 size-8 text-zinc-500" />}
//                     label="Upload Backdrop"
//                     sublabel="16:9 ratio"
//                   />
//                 )}
//                 <DropzoneContent />
//               </Dropzone>
//             </div>
//           </div>
//         </div>

//         {/* ─── CỘT PHẢI: FORM THÔNG TIN ─── */}
//         <div className="space-y-6">
//           <div className="grid gap-4 sm:grid-cols-2">
//             <div className="col-span-2">
//               <Label>Title</Label>
//               <Input
//                 value={form.title}
//                 onChange={(e) => update("title", e.target.value)}
//               />
//             </div>
//             <div>
//               <Label>Release year</Label>
//               <Input
//                 value={form.release}
//                 onChange={(e) => update("release", e.target.value)}
//               />
//             </div>
//             <div>
//               <Label>Country</Label>
//               <Input
//                 value={form.country}
//                 onChange={(e) => update("country", e.target.value)}
//               />
//             </div>
//             <div>
//               <Label>Duration (min)</Label>
//               <Input
//                 value={form.duration}
//                 onChange={(e) => update("duration", e.target.value)}
//               />
//             </div>
//             <div>
//               <Label>Age rating</Label>
//               <Input
//                 value={form.age}
//                 onChange={(e) => update("age", e.target.value)}
//               />
//             </div>
//           </div>

//           {/* Genres */}
//           <div>
//             <Label>Genres</Label>
//             <div className="mt-2 flex flex-wrap gap-2">
//               {tmdbGenres.map((g) => {
//                 const active = form.genres.includes(g);
//                 return (
//                   <button
//                     key={g}
//                     type="button"
//                     onClick={() =>
//                       update(
//                         "genres",
//                         active
//                           ? form.genres.filter((x) => x !== g)
//                           : [...form.genres, g]
//                       )
//                     }
//                   >
//                     <Badge
//                       className={
//                         active
//                           ? "bg-teal-600 hover:bg-teal-700"
//                           : "bg-zinc-800 hover:bg-zinc-700/60"
//                       }
//                     >
//                       {g}
//                     </Badge>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Director (Menu Item Style) */}
//           <div className="relative">
//             <Label>Director</Label>
//             {form.director ? (
//               <div className="mt-2 flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-900 p-2 pr-3">
//                 <div className="flex items-center gap-3">
//                   <img
//                     src={form.director.img}
//                     alt={form.director.name}
//                     className="h-10 w-10 rounded-full object-cover"
//                   />
//                   <div>
//                     <p className="text-sm font-medium text-white">
//                       {form.director.name}
//                     </p>
//                     <p className="text-xs text-zinc-400">Director</p>
//                   </div>
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="h-8 w-8 text-zinc-400 hover:text-red-400"
//                   onClick={() => update("director", null)}
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>
//             ) : (
//               <div className="relative mt-1">
//                 <Input
//                   placeholder="Search director..."
//                   value={dirQuery}
//                   onChange={(e) => {
//                     setDirQuery(e.target.value);
//                     setDirResults(
//                       e.target.value
//                         ? search(e.target.value, directorsMock)
//                         : []
//                     );
//                   }}
//                 />
//                 {dirResults.length > 0 && (
//                   <ul className="absolute z-50 mt-1 w-full divide-y divide-zinc-800 rounded-md bg-zinc-900 shadow-lg border border-zinc-800">
//                     {dirResults.map((p) => (
//                       <li
//                         key={p.id}
//                         className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-zinc-800/60"
//                         onClick={() => {
//                           update("director", p);
//                           setDirQuery("");
//                           setDirResults([]);
//                         }}
//                       >
//                         <img
//                           src={p.img}
//                           className="h-8 w-8 rounded-full object-cover"
//                         />
//                         <span className="text-sm">{p.name}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Actors (Menu Item Style) */}
//           <div className="relative">
//             <Label className="flex items-center justify-between">
//               Actors{" "}
//               <span className="text-xs text-zinc-400">
//                 {form.actors.length} selected
//               </span>
//             </Label>
//             <div className="mb-3 mt-2 space-y-2">
//               {form.actors.map((a: Person) => (
//                 <div
//                   key={a.id}
//                   className="flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-900 p-2 pr-3"
//                 >
//                   <div className="flex items-center gap-3">
//                     <img
//                       src={a.img}
//                       alt={a.name}
//                       className="h-10 w-10 rounded-full object-cover"
//                     />
//                     <div>
//                       <p className="text-sm font-medium text-white">{a.name}</p>
//                       <p className="text-xs text-zinc-400">Cast</p>
//                     </div>
//                   </div>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="h-8 w-8 text-zinc-400 hover:text-red-400"
//                     onClick={() =>
//                       update(
//                         "actors",
//                         form.actors.filter((x: Person) => x.id !== a.id)
//                       )
//                     }
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </div>
//               ))}
//             </div>
//             <div className="relative">
//               <Input
//                 placeholder="Add actor..."
//                 value={actQuery}
//                 onChange={(e) => {
//                   setActQuery(e.target.value);
//                   setActResults(
//                     e.target.value ? search(e.target.value, actorsMock) : []
//                   );
//                 }}
//               />
//               {actResults.length > 0 && (
//                 <ul className="absolute z-50 mt-1 w-full divide-y divide-zinc-800 rounded-md bg-zinc-900 shadow-lg border border-zinc-800">
//                   {actResults.map((p) => (
//                     <li
//                       key={p.id}
//                       className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-zinc-800/60"
//                       onClick={() => {
//                         if (!form.actors.find((x) => x.id == p.id))
//                           update("actors", [...form.actors, p]);
//                         setActQuery("");
//                         setActResults([]);
//                       }}
//                     >
//                       <img
//                         src={p.img}
//                         className="h-8 w-8 rounded-full object-cover"
//                       />
//                       <span className="text-sm">{p.name}</span>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           </div>

//           <div>
//             <Label>Description</Label>
//             <Textarea
//               rows={4}
//               value={form.description}
//               onChange={(e) => update("description", e.target.value)}
//             />
//           </div>

//           {/* Video Upload */}
//           <div className="space-y-2 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/30 p-6">
//             <Label>Video File</Label>
//             <Dropzone
//               accept={{ "video/*": [] }}
//               maxFiles={1}
//               maxSize={1024 * 1024 * 1_500}
//               onDrop={(files) => update("video", files[0])}
//               src={form.video ? [form.video] : undefined}
//             >
//               <DropzoneEmptyState
//                 icon={<UploadCloud className="mb-2 size-10 text-zinc-500" />}
//                 label="Drag & drop movie file"
//                 sublabel="or click to browse"
//               />
//               <DropzoneContent />
//             </Dropzone>
//             {form.video && (
//               <p className="text-center text-sm text-emerald-400">
//                 Ready: {form.video.name} (
//                 {(form.video.size / 1024 / 1024).toFixed(1)} MB)
//               </p>
//             )}
//           </div>

//           <div className="pt-4">
//             <Button className="w-full bg-teal-600 py-6 text-lg font-bold hover:bg-teal-700">
//               Save Movie Database
//             </Button>
//           </div>
//         </div>
//       </form>
//     </section>
//   );
// }
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Search,
  X,
  Trash2,
  Image as ImageIcon,
  UploadCloud,
} from "lucide-react";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ─── CONSTANTS ─── */
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
  "Western",
];

const ageRatings = ["G", "PG", "PG-13", "R", "NC-17", "16+", "18+"];

// 1. Định nghĩa danh sách Status
const statusOptions = [
  { value: "DRAFT", label: "Draft", color: "bg-yellow-500" },
  { value: "PUBLISHED", label: "Published", color: "bg-emerald-500" },
  { value: "HIDDEN", label: "Hidden", color: "bg-zinc-500" },
];

/* ─── MOCK DATA ─── */
type Person = { id: number; name: string; img: string };

const directorsMock: Person[] = [
  { id: 1, name: "Christopher Nolan", img: "https://i.pravatar.cc/150?img=1" },
  { id: 2, name: "Greta Gerwig", img: "https://i.pravatar.cc/150?img=5" },
  { id: 3, name: "Bong Joon-ho", img: "https://i.pravatar.cc/150?img=3" },
];
const actorsMock: Person[] = [
  { id: 10, name: "Cillian Murphy", img: "https://i.pravatar.cc/150?img=11" },
  { id: 11, name: "Emily Blunt", img: "https://i.pravatar.cc/150?img=10" },
  { id: 12, name: "Ryan Gosling", img: "https://i.pravatar.cc/150?img=12" },
  { id: 13, name: "Margot Robbie", img: "https://i.pravatar.cc/150?img=9" },
];

const tmdbMock = [
  {
    id: 872585,
    title: "Oppenheimer",
    release: "2023",
    overview: "The story of J. Robert Oppenheimer…",
    country: "US",
    genres: ["Drama", "History"],
    director: "Christopher Nolan",
    actors: ["Cillian Murphy", "Emily Blunt"],
    poster_path:
      "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop_path:
      "https://image.tmdb.org/t/p/w1280/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    age_rating: "R",
  },
  {
    id: 496243,
    title: "Parasite",
    release: "2019",
    overview: "Greed and class discrimination ...",
    country: "KR",
    genres: ["Thriller", "Drama"],
    director: "Bong Joon-ho",
    actors: ["Song Kang-ho", "Jang Hye-jin"],
    poster_path:
      "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    backdrop_path:
      "https://image.tmdb.org/t/p/w1280/hiKmpZMGZsrkA3cdce8a7DwyQP2.jpg",
    age_rating: "18+",
  },
];

export default function MovieEdit() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof tmdbMock>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [dirQuery, setDirQuery] = useState("");
  const [actQuery, setActQuery] = useState("");
  const [dirResults, setDirResults] = useState<Person[]>([]);
  const [actResults, setActResults] = useState<Person[]>([]);

  const search = (q: string, list: Person[]) =>
    list
      .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 5);

  /* form state */
  const [form, setForm] = useState({
    tmdbId: "",
    title: "",
    description: "",
    release: "",
    country: "",
    genres: [] as string[],
    director: null as Person | null,
    actors: [] as Person[],
    duration: "",
    age: "",
    status: "DRAFT", // 2. Default Value
    poster: undefined as File | string | undefined,
    backdrop: undefined as File | string | undefined,
    video: undefined as File | undefined,
  });

  const getPreviewUrl = (fileOrString: File | string | undefined) => {
    if (!fileOrString) return undefined;
    if (typeof fileOrString === "string") return fileOrString;
    return URL.createObjectURL(fileOrString);
  };

  /* handle pick result from TMDB */
  const pick = (m: (typeof tmdbMock)[0]) => {
    const fakeDirectorObj: Person = {
      id: 999,
      name: m.director,
      img: `https://ui-avatars.com/api/?name=${m.director}&background=random`,
    };
    const fakeActorsObj = m.actors.map((name, idx) => ({
      id: 1000 + idx,
      name: name,
      img: `https://ui-avatars.com/api/?name=${name}&background=random`,
    }));

    setForm((f) => ({
      ...f,
      tmdbId: m.id.toString(),
      title: m.title,
      description: m.overview,
      release: m.release,
      country: m.country,
      genres: m.genres,
      director: fakeDirectorObj,
      actors: fakeActorsObj,
      poster: m.poster_path,
      backdrop: m.backdrop_path,
      age: m.age_rating || "",
    }));
    setSheetOpen(false);
  };

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
    <section className="mx-auto max-w-4xl space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Edit movie</h1>
        <div className="flex gap-2">
          <Input
            className="w-[250px]"
            placeholder="Search TMDB…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={doSearch} disabled={!query} variant="secondary">
            <Search className="mr-1 size-4" /> Auto-fill
          </Button>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="top" className="max-h-80 overflow-y-auto">
          <h3 className="mb-4 font-semibold">Select Movie</h3>
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => pick(r)}
              className="flex w-full items-start gap-3 rounded-md p-3 text-left hover:bg-zinc-800/50"
            >
              <img
                src={r.poster_path}
                className="h-16 w-10 rounded object-cover bg-zinc-800"
              />
              <div>
                <p className="font-medium text-white">{r.title}</p>
                <p className="text-xs text-zinc-400">
                  {r.release} • {r.country}
                </p>
              </div>
            </button>
          ))}
        </SheetContent>
      </Sheet>

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
              <Input
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
              />
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
                    <SelectItem key={rating} value={rating}>
                      {rating}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 3. STATUS INPUT SELECTION */}
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
                        {/* Chấm màu trạng thái */}
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

          {/* Director & Actors (Giữ nguyên code cũ cho gọn) */}
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
                      e.target.value
                        ? search(e.target.value, directorsMock)
                        : []
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

          <div className="pt-4">
            <Button className="w-full bg-teal-600 py-6 text-lg font-bold hover:bg-teal-700">
              Save Movie Database
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
