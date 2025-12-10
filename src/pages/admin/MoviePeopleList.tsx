import { useState } from "react";
import {
  Pencil,
  Plus,
  Search,
  MoreHorizontal,
  User,
  Trash2,
  Users2,
  Film,
  Image as ImageIcon,
  UserCircle,
  Loader2,
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
      toast.success("Đã xóa người!");
      setConfirmOpen(false);
      setDeleteId(null);
      await refetch();
    } catch {
      toast.error("Không thể xóa người");
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Users2 className="size-6 text-[#C40E61]" />
            Quản Lý Diễn Viên & Đạo Diễn
          </h1>
          <p className="text-sm text-gray-500">Diễn Viên & Đạo Diễn</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#C40E61] hover:bg-[#C40E61]/90 text-white">
          <Plus className="mr-2 size-4" /> Thêm Diễn Viên & Đạo Diễn
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Tìm kiếm tên..."
            className="pl-9 bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C40E61]"
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
          <SelectTrigger className="w-full sm:w-40 bg-white border-gray-300 text-gray-700 hover:bg-gray-100">
            <SelectValue placeholder="Vai Trò" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-300 text-gray-900">
            <SelectItem value="ALL">Tất Cả Vai Trò</SelectItem>
            <SelectItem value="ACTOR">Diễn Viên</SelectItem>
            <SelectItem value="DIRECTOR">Đạo Diễn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-300 bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow className="hover:bg-gray-50">
              <TableHead className="w-20">Hình Ảnh</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Vai Trò</TableHead>
              <TableHead className="text-right">Phim</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Loader2 className="size-5 animate-spin text-[#C40E61]" />
                    Đang tải...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-gray-500"
                >
                  {isError ? "Không thể tải danh sách người." : "Không tìm thấy kết quả."}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((p) => (
                <TableRow
                  key={p.id}
                  className="hover:bg-gray-50 border-gray-200"
                >
                  <TableCell>
                    <img
                      src={p.profilePath || getProfileUrl(p as ApiPerson)}
                      alt={(p as ApiPerson).fullName}
                      className="h-10 w-10 rounded-full object-cover bg-gray-200 border-2 border-gray-300"
                      loading="lazy"
                    />
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900">
                      {(p as ApiPerson).fullName}
                    </span>
                  </TableCell>
                  <TableCell>
                    {(p as ApiPerson).job === PersonJob.DIRECTOR ? (
                      <Badge className="bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200">
                        <Film className="mr-1 size-3" />
                        DIRECTOR
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200">
                        <User className="mr-1 size-3" />
                        ACTOR
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-gray-700">
                    {p.movieCount || 0}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-white border-gray-300 text-gray-900"
                      >
                        <DropdownMenuItem
                          onClick={() => handleEditApiPerson(p as ApiPerson)}
                          className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Chỉnh Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete((p as ApiPerson).id)}
                          className="text-red-600 cursor-pointer hover:bg-red-50 focus:bg-red-50 hover:text-red-700 focus:text-red-700"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Xóa
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
                    ? "pointer-events-none opacity-50 text-gray-400"
                    : "cursor-pointer text-gray-700 hover:bg-gray-100"
                }
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-4 text-sm text-gray-500">
                Trang {currentPage + 1} / {totalPages}
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
                    ? "pointer-events-none opacity-50 text-gray-400"
                    : "cursor-pointer text-gray-700 hover:bg-gray-100"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-white border-gray-300 text-gray-900 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <UserCircle className="size-5 text-[#C40E61]" />
              {isEditing ? "Chỉnh Sửa Người" : "Thêm Người Mới"}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Quản lý thông tin diễn viên hoặc đạo diễn.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-gray-300 bg-gray-100 shadow-sm">
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
                  <User className="h-full w-full p-4 text-gray-400" />
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2 text-gray-900">
                <User className="size-4 text-[#C40E61]" />
                Họ Tên
              </Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C40E61]"
                placeholder="Nhập họ tên..."
              />
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2 text-gray-900">
                <Film className="size-4 text-[#C40E61]" />
                Vai Trò Chính
              </Label>
              <Select
                value={formData.job}
                onValueChange={(v) =>
                  setFormData({ ...formData, job: v as JobType })
                }
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 text-gray-900">
                  <SelectItem value="ACTOR">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-blue-600" />
                      Diễn Viên
                    </div>
                  </SelectItem>
                  <SelectItem value="DIRECTOR">
                    <div className="flex items-center gap-2">
                      <Film className="size-4 text-purple-600" />
                      Đạo Diễn
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2 text-gray-900">
                <ImageIcon className="size-4 text-[#C40E61]" />
                Ảnh Đại Diện
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFormData({ ...formData, img: file });
                }}
                className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C40E61] text-xs"
              />
              <p className="text-[11px] text-gray-500">PNG/JPG, tối đa 5MB.</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#C40E61] hover:bg-[#C40E61]/90 text-white"
              disabled={creating || updating}
            >
              {creating || updating ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu"
              )}
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
