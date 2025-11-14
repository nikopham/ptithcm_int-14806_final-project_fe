// import { useState, useMemo } from "react";
// import { Link } from "react-router-dom";
// import { Pencil } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";

// type Movie = {
//   id: string;
//   title: string;
//   poster: string; // 1. Thêm trường poster
//   release: string;
//   duration: number;
//   age: string;
//   status: "PUBLISHED" | "DRAFT" | "HIDDEN";
//   view: number;
//   series: boolean;
// };

// /* — mock sample — */
// const rows: Movie[] = [
//   {
//     id: "1",
//     title: "Oppenheimer",
//     // 2. Thêm link ảnh poster
//     poster: "https://image.tmdb.org/t/p/w200/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
//     release: "2023-07-21",
//     duration: 180,
//     age: "T18",
//     status: "PUBLISHED",
//     view: 542_000,
//     series: false,
//   },
//   {
//     id: "2",
//     title: "Stranger Things",
//     poster: "https://image.tmdb.org/t/p/w200/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
//     release: "2016-07-15",
//     duration: 51,
//     age: "T16",
//     status: "PUBLISHED",
//     view: 11_420_000,
//     series: true,
//   },
//   {
//     id: "3",
//     title: "Untitled Sci-Fi",
//     poster: "", // Trường hợp không có ảnh
//     release: "—",
//     duration: 0,
//     age: "P",
//     status: "DRAFT",
//     view: 0,
//     series: false,
//   },
// ];

// const statusColor: Record<Movie["status"], string> = {
//   PUBLISHED: "bg-emerald-600",
//   DRAFT: "bg-yellow-500 text-black",
//   HIDDEN: "bg-zinc-700",
// };

// export default function MovieList() {
//   const [query, setQuery] = useState("");
//   const [filterStatus, setFilterStatus] = useState<"all" | Movie["status"]>(
//     "all"
//   );
//   const [filterType, setFilterType] = useState<"all" | "movie" | "series">(
//     "all"
//   );

//   /* filtered rows */
//   const data = useMemo(() => {
//     return rows.filter((r) => {
//       const matchQ = r.title.toLowerCase().includes(query.toLowerCase());
//       const matchS = filterStatus === "all" || r.status === filterStatus;
//       const matchT =
//         filterType === "all" ||
//         (filterType === "series" ? r.series : !r.series);

//       return matchQ && matchS && matchT;
//     });
//   }, [query, filterStatus, filterType]);

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold text-white">Movie List</h1>

//       {/* search + filter */}
//       <div className="flex flex-col gap-4 sm:flex-row">
//         <Input
//           placeholder="Search title…"
//           className="w-full max-w-sm"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//         />

//         <Select
//           value={filterStatus}
//           onValueChange={(v) => setFilterStatus(v as any)}
//         >
//           <SelectTrigger className="w-40">
//             <SelectValue placeholder="Status" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Status</SelectItem>
//             <SelectItem value="PUBLISHED">Published</SelectItem>
//             <SelectItem value="DRAFT">Draft</SelectItem>
//             <SelectItem value="HIDDEN">Hidden</SelectItem>
//           </SelectContent>
//         </Select>

//         <Select
//           value={filterType}
//           onValueChange={(v) => setFilterType(v as any)}
//         >
//           <SelectTrigger className="w-40">
//             <SelectValue placeholder="Type" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Types</SelectItem>
//             <SelectItem value="movie">Movie</SelectItem>
//             <SelectItem value="series">TV Series</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {/* table */}
//       <div className="rounded-lg border border-zinc-700/50 bg-zinc-900">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               {/* 3. Thêm Header Poster */}
//               <TableHead className="w-[80px]">Poster</TableHead>
//               <TableHead>Title</TableHead>
//               <TableHead className="hidden md:table-cell">Release</TableHead>
//               <TableHead className="hidden lg:table-cell">Duration</TableHead>
//               <TableHead className="hidden lg:table-cell">Age</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead className="hidden md:table-cell text-right">
//                 Views
//               </TableHead>
//               <TableHead className="w-[50px]"></TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {data.map((m) => (
//               <TableRow key={m.id} className="hover:bg-zinc-800/50">
//                 {/* 4. Thêm Cell hiển thị ảnh */}
//                 <TableCell>
//                   <div className="h-14 w-10 overflow-hidden rounded bg-zinc-800">
//                     {m.poster ? (
//                       <img
//                         src={m.poster}
//                         alt={m.title}
//                         className="h-full w-full object-cover"
//                         loading="lazy"
//                       />
//                     ) : (
//                       <div className="flex h-full w-full items-center justify-center text-xs text-zinc-600">
//                         N/A
//                       </div>
//                     )}
//                   </div>
//                 </TableCell>

//                 <TableCell>
//                   <div className="flex flex-col">
//                     <span className="font-medium text-white">{m.title}</span>
//                     {m.series && (
//                       <span className="text-xs text-teal-400">Series</span>
//                     )}
//                   </div>
//                 </TableCell>

//                 <TableCell className="hidden md:table-cell">
//                   {m.release}
//                 </TableCell>
//                 <TableCell className="hidden lg:table-cell">
//                   {m.duration ? `${m.duration} m` : "—"}
//                 </TableCell>
//                 <TableCell className="hidden lg:table-cell">{m.age}</TableCell>

//                 <TableCell>
//                   <Badge className={statusColor[m.status]}>{m.status}</Badge>
//                 </TableCell>

//                 <TableCell className="hidden md:table-cell text-right">
//                   {m.view.toLocaleString()}
//                 </TableCell>

//                 <TableCell>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     asChild
//                     className="text-zinc-400 hover:text-white"
//                   >
//                     <Link to={`/admin/movies/${m.id}`}>
//                       <Pencil className="size-4" />
//                     </Link>
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>

//         {data.length === 0 && (
//           <p className="py-6 text-center text-sm text-zinc-400">
//             No movie found.
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // Hook điều hướng
import { Pencil, Trash2, Plus, Search, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ─── Type Definition ─── */
type Movie = {
  id: string;
  title: string;
  poster: string;
  release: string;
  duration: number;
  age: string;
  status: "PUBLISHED" | "DRAFT" | "HIDDEN";
  view: number;
  series: boolean;
};

/* ─── Mock Data ─── */
const rows: Movie[] = [
  {
    id: "1",
    title: "Oppenheimer",
    poster: "https://image.tmdb.org/t/p/w200/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    release: "2023-07-21",
    duration: 180,
    age: "T18",
    status: "PUBLISHED",
    view: 542_000,
    series: false,
  },
  {
    id: "2",
    title: "Stranger Things",
    poster: "https://image.tmdb.org/t/p/w200/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    release: "2016-07-15",
    duration: 51,
    age: "T16",
    status: "PUBLISHED",
    view: 11_420_000,
    series: true,
  },
  {
    id: "3",
    title: "Untitled Sci-Fi",
    poster: "",
    release: "—",
    duration: 0,
    age: "P",
    status: "DRAFT",
    view: 0,
    series: false,
  },
];

const statusColor: Record<Movie["status"], string> = {
  PUBLISHED: "bg-emerald-600 hover:bg-emerald-700",
  DRAFT: "bg-yellow-600 text-white hover:bg-yellow-700",
  HIDDEN: "bg-zinc-700 hover:bg-zinc-600",
};

export default function MovieList() {
  const navigate = useNavigate(); // Hook để chuyển trang
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Movie["status"]>(
    "all"
  );
  const [filterType, setFilterType] = useState<"all" | "movie" | "series">(
    "all"
  );

  /* Filter Logic */
  const data = useMemo(() => {
    return rows.filter((r) => {
      const matchQ = r.title.toLowerCase().includes(query.toLowerCase());
      const matchS = filterStatus === "all" || r.status === filterStatus;
      const matchT =
        filterType === "all" ||
        (filterType === "series" ? r.series : !r.series);
      return matchQ && matchS && matchT;
    });
  }, [query, filterStatus, filterType]);

  /* Action Handlers */
  const handleDelete = (id: string) => {
    if (confirm(`Are you sure you want to delete movie ID: ${id}?`)) {
      console.log("Delete logic here for", id);
      // Gọi API delete ở đây
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Movies</h1>
          <p className="text-sm text-zinc-400">Manage your movie database</p>
        </div>
        <Button
          onClick={() => navigate("/admin/movies/new")}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="mr-2 size-4" /> Add Movie
        </Button>
      </div>

      {/* ─── Filters ─── */}
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search title…"
            className="pl-9 bg-zinc-900 border-zinc-700"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Filter Status */}
        <Select
          value={filterStatus}
          onValueChange={(v) => setFilterStatus(v as any)}
        >
          <SelectTrigger className="w-full sm:w-40 bg-zinc-900 border-zinc-700">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="HIDDEN">Hidden</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter Type */}
        <Select
          value={filterType}
          onValueChange={(v) => setFilterType(v as any)}
        >
          <SelectTrigger className="w-full sm:w-40 bg-zinc-900 border-zinc-700">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="movie">Movie</SelectItem>
            <SelectItem value="series">TV Series</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ─── Table ─── */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-950">
            <TableRow className="hover:bg-zinc-900">
              <TableHead className="w-[80px]">Poster</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Release</TableHead>
              <TableHead className="hidden lg:table-cell">Duration</TableHead>
              <TableHead className="hidden lg:table-cell">Age</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell text-right">
                Views
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((m) => (
              <TableRow
                key={m.id}
                className="hover:bg-zinc-800/50 border-zinc-800"
              >
                {/* Poster */}
                <TableCell>
                  <div className="h-14 w-10 overflow-hidden rounded bg-zinc-800 shrink-0">
                    {m.poster ? (
                      <img
                        src={m.poster}
                        alt={m.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-600">
                        N/A
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Title & Type */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{m.title}</span>
                    {m.series && (
                      <span className="text-xs font-medium text-teal-400">
                        TV Series
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Metadata */}
                <TableCell className="hidden md:table-cell text-zinc-400">
                  {m.release}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-zinc-400">
                  {m.duration ? `${m.duration} min` : "—"}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="inline-flex items-center rounded border border-zinc-700 px-2 py-0.5 text-xs font-medium text-zinc-300">
                    {m.age}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge className={`${statusColor[m.status]} border-none`}>
                    {m.status}
                  </Badge>
                </TableCell>

                <TableCell className="hidden md:table-cell text-right text-zinc-300">
                  {m.view.toLocaleString()}
                </TableCell>

                {/* Action Menu */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-zinc-900 border-zinc-700 text-white"
                    >
                      <DropdownMenuItem
                        onClick={() => navigate(`/admin/movies/edit/${m.id}`)}
                        className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(m.id)}
                        className="text-red-500 cursor-pointer hover:bg-red-900/20 focus:bg-red-900/20 hover:text-red-400 focus:text-red-400"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-zinc-500"
                >
                  No movie found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}