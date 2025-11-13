import { useState, useMemo } from "react";
import { Link } from "react-router-dom"; // Import Link để chuyển trang
import { Pencil } from "lucide-react"; // Import icon bút chì
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Movie = {
  id: string;
  title: string;
  release: string;
  duration: number;
  age: string;
  status: "PUBLISHED" | "DRAFT" | "HIDDEN";
  view: number;
  series: boolean;
};

/* — mock sample — */
const rows: Movie[] = [
  {
    id: "1",
    title: "Oppenheimer",
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
    release: "—",
    duration: 0,
    age: "P",
    status: "DRAFT",
    view: 0,
    series: false,
  },
];

const statusColor: Record<Movie["status"], string> = {
  PUBLISHED: "bg-emerald-600",
  DRAFT: "bg-yellow-500 text-black",
  HIDDEN: "bg-zinc-700",
};

export default function MovieList() {
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Movie["status"]>(
    "all"
  );
  // 1. State mới cho bộ lọc Type
  const [filterType, setFilterType] = useState<"all" | "movie" | "series">(
    "all"
  );

  /* filtered rows */
  const data = useMemo(() => {
    return rows.filter((r) => {
      const matchQ = r.title.toLowerCase().includes(query.toLowerCase());
      const matchS = filterStatus === "all" || r.status === filterStatus;

      // 2. Logic lọc theo Type
      const matchT =
        filterType === "all" ||
        (filterType === "series" ? r.series : !r.series);

      return matchQ && matchS && matchT;
    });
  }, [query, filterStatus, filterType]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Movie List</h1>

      {/* search + filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder="Search title…"
          className="w-full max-w-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Filter Status */}
        <Select
          value={filterStatus}
          onValueChange={(v) => setFilterStatus(v as any)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="HIDDEN">Hidden</SelectItem>
          </SelectContent>
        </Select>

        {/* 3. UI Filter Type Mới */}
        <Select
          value={filterType}
          onValueChange={(v) => setFilterType(v as any)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="movie">Movie</SelectItem>
            <SelectItem value="series">TV Series</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* table */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Release</TableHead>
              <TableHead className="hidden lg:table-cell">Duration</TableHead>
              <TableHead className="hidden lg:table-cell">Age</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell text-right">
                Views
              </TableHead>
              {/* 4. Cột Action */}
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((m) => (
              <TableRow key={m.id} className="hover:bg-zinc-800/50">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{m.title}</span>
                    {m.series && (
                      <span className="text-xs text-teal-400">Series</span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  {m.release}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {m.duration ? `${m.duration} m` : "—"}
                </TableCell>
                <TableCell className="hidden lg:table-cell">{m.age}</TableCell>

                <TableCell>
                  <Badge className={statusColor[m.status]}>{m.status}</Badge>
                </TableCell>

                <TableCell className="hidden md:table-cell text-right">
                  {m.view.toLocaleString()}
                </TableCell>

                {/* 5. Nút Edit chuyển hướng */}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="text-zinc-400 hover:text-white"
                  >
                    <Link to={`/admin/movies/${m.id}`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {data.length === 0 && (
          <p className="py-6 text-center text-sm text-zinc-400">
            No movie found.
          </p>
        )}
      </div>
    </div>
  );
}
