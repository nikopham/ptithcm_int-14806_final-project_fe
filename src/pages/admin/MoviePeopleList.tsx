import { useState } from "react";
import {
  Pencil,
  Plus,
  Search,
  MoreHorizontal,
  User,
  Trash2,
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
import { useDebounce } from "@/hooks/useDebounce";
import {
  useSearchPeopleQuery,
  useCreatePersonMutation,
  useUpdatePersonMutation,
} from "@/features/person/personApi";
import { useDeletePersonMutation } from "@/features/person/personApi";
import type { Person as ApiPerson } from "@/types/person";
import { PersonJob } from "@/types/person";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { toast } from "sonner";

/* ─── Simplified Type Definition ─── */
// Chỉ còn 2 loại Job
type JobType = "ACTOR" | "DIRECTOR";

export default function MoviePeopleList() {
  const [query, setQuery] = useState("");
  const [filterJob, setFilterJob] = useState<"ALL" | JobType>("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 10;

  const debouncedQuery = useDebounce(query, 400);
  const { data, isFetching, isError, refetch } = useSearchPeopleQuery({
    query: debouncedQuery || undefined,
    job: filterJob !== "ALL" ? (filterJob as unknown as PersonJob) : undefined,
    page: currentPage + 1,
    size: PAGE_SIZE,
  });
  const [createPerson, { isLoading: creating }] = useCreatePersonMutation();
  const [updatePerson, { isLoading: updating }] = useUpdatePersonMutation();
  const [deletePerson, { isLoading: deleting }] = useDeletePersonMutation();
  const totalPages = data?.totalPages ?? 0;
  const paged: ApiPerson[] = data?.content ?? [];

  /* Dialog State */
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [personId, setPersonId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* Form State */
  const [formData, setFormData] = useState({
    name: "",
    img: null as File | string | null,
    job: "ACTOR" as JobType,
  });

  /* Filter logic */
  // Table displays API data; local filtering replaced by server params
  const filteredData = paged;

  const getProfileUrl = (p: ApiPerson) =>
    p.profilePath || "https://via.placeholder.com/64x64.png?text=?";

  /* Handlers */
  const handleAdd = () => {
    setIsEditing(false);
    setPersonId(null);
    setFormData({ name: "", img: null, job: "ACTOR" });
    setIsOpen(true);
  };

  const handleEditApiPerson = (p: ApiPerson) => {
    setIsEditing(true);
    setPersonId(p.id);
    setFormData({
      name: p.fullName,
      img: p.profilePath || null,
      job: (p.job as unknown as JobType) || "ACTOR",
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    const name = formData.name.trim();
    if (!name) return;
    const fd = new FormData();
    fd.append("fullName", name);
    fd.append("job", formData.job);
    if (formData.img && formData.img instanceof File) {
      fd.append("avatar", formData.img, formData.img.name);
    }
    try {
      if (isEditing && personId) {
        await updatePerson({ id: personId, body: fd }).unwrap();
      } else {
        await createPerson(fd).unwrap();
        setCurrentPage(0);
      }
      setIsOpen(false);
      setPersonId(null);
      setFormData({ name: "", img: null, job: "ACTOR" });
      await refetch();
    } catch {
      // Optional: surface error to user with a toast
      // console.error(err);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePerson(deleteId).unwrap();
      toast.success("Person deleted!");
      setConfirmOpen(false);
      setDeleteId(null);
      await refetch();
    } catch {
      toast.error("Failed to delete person");
    }
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
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(0);
            }}
          />
        </div>

        <Select
          value={filterJob}
          onValueChange={(v) => {
            setFilterJob(v as "ALL" | JobType);
            setCurrentPage(0);
          }}
        >
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
              <TableHead className="w-20">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Movies</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-zinc-500"
                >
                  {isError ? "Failed to load people." : "No result found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((p) => (
                <TableRow
                  key={p.id}
                  className="hover:bg-zinc-800/50 border-zinc-800"
                >
                  <TableCell>
                    <img
                      src={p.profilePath || getProfileUrl(p as ApiPerson)}
                      alt={(p as ApiPerson).fullName}
                      className="h-10 w-10 rounded-full object-cover bg-zinc-800"
                      loading="lazy"
                    />
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-white">
                      {(p as ApiPerson).fullName}
                    </span>
                  </TableCell>
                  <TableCell>
                    {(p as ApiPerson).job === PersonJob.DIRECTOR ? (
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
                    {p.movieCount || 0}
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
                          onClick={() => handleEditApiPerson(p as ApiPerson)}
                          className="cursor-pointer hover:bg-zinc-800"
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete((p as ApiPerson).id)}
                          className="text-red-500 cursor-pointer hover:bg-red-900/20 focus:bg-red-900/20 hover:text-red-400 focus:text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center pt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  !isFetching && currentPage > 0 && setCurrentPage((p) => p - 1)
                }
                className={
                  isFetching || currentPage === 0
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-4 text-sm text-zinc-400">
                Page {currentPage + 1} of {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  !isFetching &&
                  currentPage < totalPages - 1 &&
                  setCurrentPage((p) => p + 1)
                }
                className={
                  isFetching || currentPage >= totalPages - 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
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
            <div className="flex justify-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-zinc-700 bg-zinc-800">
                {formData.img ? (
                  <img
                    src={
                      formData.img instanceof File
                        ? URL.createObjectURL(formData.img)
                        : (formData.img as string)
                    }
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
              <Label>Profile Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFormData({ ...formData, img: file });
                }}
                className="bg-zinc-950 border-zinc-700 text-xs"
              />
              <p className="text-[11px] text-zinc-500">PNG/JPG, up to 5MB.</p>
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
              disabled={creating || updating}
            >
              {creating || updating ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa người dùng?"
        description="Bạn có chắc muốn xóa người này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        isLoading={deleting}
      />
    </div>
  );
}
