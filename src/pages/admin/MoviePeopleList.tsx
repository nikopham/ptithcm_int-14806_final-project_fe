import { useState, useMemo } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  MoreHorizontal,
  User,
  Clapperboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ─── Simplified Type Definition ─── */
// Chỉ còn 2 loại Job
type JobType = "ACTOR" | "DIRECTOR";

type Person = {
  id: number;
  tmdbId?: string;
  name: string;
  img: string;
  job: JobType; // Cột Job mới trong DB
  movie_count: number;
};

/* ─── Mock Data ─── */
const initialPeople: Person[] = [
  {
    id: 1,
    name: "Cillian Murphy",
    tmdbId: "2037",
    img: "https://i.pravatar.cc/150?img=11",
    job: "ACTOR",
    movie_count: 12,
  },
  {
    id: 2,
    name: "Christopher Nolan",
    tmdbId: "525",
    img: "https://i.pravatar.cc/150?img=1",
    job: "DIRECTOR",
    movie_count: 11,
  },
  {
    id: 3,
    name: "Emily Blunt",
    tmdbId: "5081",
    img: "https://i.pravatar.cc/150?img=10",
    job: "ACTOR",
    movie_count: 8,
  },
];

const mockTmdbSearch = [
  {
    id: 101,
    name: "Tom Cruise",
    img: "https://i.pravatar.cc/150?img=60",
    known_for_department: "Acting",
  },
  {
    id: 102,
    name: "Quentin Tarantino",
    img: "https://i.pravatar.cc/150?img=61",
    known_for_department: "Directing",
  },
];

export default function MoviePeopleList() {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [query, setQuery] = useState("");
  const [filterJob, setFilterJob] = useState<"ALL" | JobType>("ALL");

  /* Dialog State */
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  /* Form State */
  const [formData, setFormData] = useState({
    name: "",
    img: "",
    tmdbId: "",
    job: "ACTOR" as JobType,
  });

  /* TMDB Search State */
  const [tmdbQuery, setTmdbQuery] = useState("");
  const [tmdbResults, setTmdbResults] = useState<typeof mockTmdbSearch>([]);

  /* Filter logic */
  const filteredData = useMemo(() => {
    return people.filter((p) => {
      const matchName = p.name.toLowerCase().includes(query.toLowerCase());
      const matchJob = filterJob === "ALL" || p.job === filterJob;
      return matchName && matchJob;
    });
  }, [people, query, filterJob]);

  /* Handlers */
  const handleAdd = () => {
    setIsEditing(false);
    setFormData({ name: "", img: "", tmdbId: "", job: "ACTOR" });
    setTmdbQuery("");
    setTmdbResults([]);
    setIsOpen(true);
  };

  const handleEdit = (p: Person) => {
    setIsEditing(true);
    setCurrentId(p.id);
    setFormData({
      name: p.name,
      img: p.img,
      tmdbId: p.tmdbId || "",
      job: p.job,
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return;
    if (isEditing && currentId !== null) {
      setPeople((prev) =>
        prev.map((p) => (p.id === currentId ? { ...p, ...formData } : p))
      );
    } else {
      const newPerson: Person = {
        id: Date.now(),
        ...formData,
        movie_count: 0,
      };
      setPeople((prev) => [newPerson, ...prev]);
    }
    setIsOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this person?")) {
      setPeople((prev) => prev.filter((p) => p.id !== id));
    }
  };

  /* TMDB Logic */
  const handleTmdbSearch = (val: string) => {
    setTmdbQuery(val);
    if (val.length > 2) {
      // Mock search result based on input
      const matches = mockTmdbSearch.filter((p) =>
        p.name.toLowerCase().includes(val.toLowerCase())
      );
      setTmdbResults(matches);
    } else {
      setTmdbResults([]);
    }
  };

  const selectTmdbPerson = (p: (typeof mockTmdbSearch)[0]) => {
    // Auto-detect job from TMDB "known_for_department"
    const detectedJob: JobType =
      p.known_for_department === "Directing" ? "DIRECTOR" : "ACTOR";

    setFormData({
      name: p.name,
      img: p.img,
      tmdbId: p.id.toString(),
      job: detectedJob,
    });
    setTmdbQuery("");
    setTmdbResults([]);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">People Manager</h1>
          <p className="text-sm text-zinc-400">Actors & Directors</p>
        </div>
        <Button onClick={handleAdd} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="mr-2 size-4" /> Add Person
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search name..."
            className="pl-9 bg-zinc-900 border-zinc-700"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <Select value={filterJob} onValueChange={(v) => setFilterJob(v as any)}>
          <SelectTrigger className="w-full sm:w-40 bg-zinc-900 border-zinc-700">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="ACTOR">Actors</SelectItem>
            <SelectItem value="DIRECTOR">Directors</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-950">
            <TableRow className="hover:bg-zinc-900">
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Movies</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((p) => (
              <TableRow
                key={p.id}
                className="hover:bg-zinc-800/50 border-zinc-800"
              >
                <TableCell>
                  <img
                    src={p.img}
                    alt={p.name}
                    className="h-10 w-10 rounded-full object-cover bg-zinc-800"
                    loading="lazy"
                  />
                </TableCell>
                <TableCell>
                  <span className="font-medium text-white">{p.name}</span>
                </TableCell>
                <TableCell>
                  {p.job === "DIRECTOR" ? (
                    <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/50 hover:bg-purple-600/30">
                      DIRECTOR
                    </Badge>
                  ) : (
                    <Badge className="bg-teal-600/20 text-teal-400 border-teal-600/50 hover:bg-teal-600/30">
                      ACTOR
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right text-zinc-300">
                  {p.movie_count}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-zinc-900 border-zinc-700 text-white"
                    >
                      <DropdownMenuItem
                        onClick={() => handleEdit(p)}
                        className="cursor-pointer hover:bg-zinc-800"
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(p.id)}
                        className="text-red-500 cursor-pointer hover:bg-red-900/20"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-zinc-500"
                >
                  No result found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Person" : "Add New Person"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Manage actor or director details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!isEditing && (
              <div className="relative z-20 mb-6">
                <Label className="mb-1.5 block">Auto-fill from TMDB</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    placeholder="Search TMDB..."
                    className="pl-9 bg-zinc-950 border-teal-800 focus-visible:ring-teal-600"
                    value={tmdbQuery}
                    onChange={(e) => handleTmdbSearch(e.target.value)}
                  />
                  {tmdbResults.length > 0 && (
                    <ul className="absolute mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 shadow-lg">
                      {tmdbResults.map((r) => (
                        <li
                          key={r.id}
                          onClick={() => selectTmdbPerson(r)}
                          className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-zinc-800"
                        >
                          <img
                            src={r.img}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm text-white">{r.name}</span>
                            <span className="text-xs text-zinc-400">
                              {r.known_for_department}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="my-4 h-px bg-zinc-800" />
              </div>
            )}

            <div className="flex justify-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-zinc-700 bg-zinc-800">
                {formData.img ? (
                  <img
                    src={formData.img}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-full w-full p-4 text-zinc-500" />
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-zinc-950 border-zinc-700"
              />
            </div>

            <div className="grid gap-2">
              <Label>Primary Job</Label>
              <Select
                value={formData.job}
                onValueChange={(v) =>
                  setFormData({ ...formData, job: v as JobType })
                }
              >
                <SelectTrigger className="bg-zinc-950 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                  <SelectItem value="ACTOR">Actor</SelectItem>
                  <SelectItem value="DIRECTOR">Director</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Profile Image URL</Label>
              <Input
                value={formData.img}
                onChange={(e) =>
                  setFormData({ ...formData, img: e.target.value })
                }
                className="bg-zinc-950 border-zinc-700 text-xs font-mono text-zinc-400"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsOpen(false)}
              className="bg-zinc-800 hover:bg-zinc-700 text-white border-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
