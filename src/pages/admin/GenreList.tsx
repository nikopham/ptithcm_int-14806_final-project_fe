import { useState, useMemo, useEffect } from "react";
import { Pencil, Trash2, Plus, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";

/* ─── Type Definition ─── */
type Genre = {
  id: number;
  name: string;
  slug: string;
  movie_count: number; // Số lượng phim thuộc thể loại này
};

/* ─── Mock Data ─── */
const initialGenres: Genre[] = [
  { id: 1, name: "Action", slug: "action", movie_count: 120 },
  { id: 2, name: "Adventure", slug: "adventure", movie_count: 85 },
  { id: 3, name: "Animation", slug: "animation", movie_count: 42 },
  { id: 4, name: "Comedy", slug: "comedy", movie_count: 215 },
  { id: 5, name: "Crime", slug: "crime", movie_count: 67 },
  { id: 6, name: "Documentary", slug: "documentary", movie_count: 30 },
  { id: 7, name: "Drama", slug: "drama", movie_count: 340 },
  { id: 8, name: "Horror", slug: "horror", movie_count: 90 },
  { id: 9, name: "Sci-Fi", slug: "sci-fi", movie_count: 110 },
];

export default function GenreList() {
  const [genres, setGenres] = useState<Genre[]>(initialGenres);
  const [query, setQuery] = useState("");

  /* ─── Dialog State ─── */
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  /* ─── Form State ─── */
  const [formData, setFormData] = useState({ name: "", slug: "" });

  /* Filter logic */
  const filteredData = useMemo(() => {
    return genres.filter((g) =>
      g.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [genres, query]);

  /* Helper: Auto generate slug */
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  /* Handle Open Add Modal */
  const handleAdd = () => {
    setIsEditing(false);
    setFormData({ name: "", slug: "" });
    setIsOpen(true);
  };

  /* Handle Open Edit Modal */
  const handleEdit = (genre: Genre) => {
    setIsEditing(true);
    setCurrentId(genre.id);
    setFormData({ name: genre.name, slug: genre.slug });
    setIsOpen(true);
  };

  /* Handle Save (Create or Update) */
  const handleSave = () => {
    if (!formData.name) return; // Simple validation

    if (isEditing && currentId !== null) {
      // Logic Update
      setGenres((prev) =>
        prev.map((g) => (g.id === currentId ? { ...g, ...formData } : g))
      );
    } else {
      // Logic Create
      const newGenre: Genre = {
        id: Date.now(), // Fake ID
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        movie_count: 0,
      };
      setGenres((prev) => [newGenre, ...prev]);
    }
    setIsOpen(false);
  };

  /* Handle Delete */
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this genre?")) {
      setGenres((prev) => prev.filter((g) => g.id !== id));
    }
  };

  /* Auto update slug when typing name (only in Add mode) */
  useEffect(() => {
    if (!isEditing && formData.name) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [formData.name, isEditing]);

  return (
    <div className="space-y-6 p-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Genres</h1>
          <p className="text-sm text-zinc-400">Manage movie categories</p>
        </div>
        <Button onClick={handleAdd} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="mr-2 size-4" /> Add Genre
        </Button>
      </div>

      {/* ─── Search ─── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder="Search genres..."
          className="pl-9 bg-zinc-900 border-zinc-700"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* ─── Table ─── */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-950">
            <TableRow className="hover:bg-zinc-900">
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Movies</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((g) => (
              <TableRow
                key={g.id}
                className="hover:bg-zinc-800/50 border-zinc-800"
              >
                <TableCell className="font-mono text-zinc-500">
                  #{g.id}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    {g.name}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-400 italic">{g.slug}</TableCell>
                <TableCell className="text-right text-zinc-300">
                  {g.movie_count}
                </TableCell>
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
                        onClick={() => handleEdit(g)}
                        className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(g.id)}
                        className="text-red-500 cursor-pointer hover:bg-red-900/20 focus:bg-red-900/20 hover:text-red-400 focus:text-red-400"
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
                  No genre found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ─── Add/Edit Dialog ─── */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Genre" : "Add New Genre"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {isEditing
                ? "Make changes to the genre here. Click save when you're done."
                : "Create a new genre for your movie collection."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-zinc-300">
                Name
              </Label>
              <Input
                id="name"
                className="col-span-3 bg-zinc-950 border-zinc-700 focus-visible:ring-teal-600"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Science Fiction"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right text-zinc-300">
                Slug
              </Label>
              <Input
                id="slug"
                className="col-span-3 bg-zinc-950 border-zinc-700 font-mono text-sm text-zinc-400 focus-visible:ring-teal-600"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="e.g. science-fiction"
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
              disabled={!formData.name}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
