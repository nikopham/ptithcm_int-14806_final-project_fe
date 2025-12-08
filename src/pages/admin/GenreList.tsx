import { useState } from "react";
import {
  Pencil,
  Plus,
  Search,
  MoreHorizontal,
  Loader2,
  Trash2,
} from "lucide-react";
import type { Genre } from "@/types/genre";
import {
  useSearchGenresQuery,
  useCreateGenreMutation,
  useUpdateGenreMutation,
  useDeleteGenreMutation,
} from "@/features/genre/genreApi";
import { useDebounce } from "@/hooks/useDebounce";

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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"; // Giả sử bạn đã fix lỗi export ButtonProps
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

export default function GenreList() {
  // UI state
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const PAGE_SIZE = 10;

  // Debounce search and query API
  const debouncedQuery = useDebounce(query, 400);
  const { data, isFetching, isError, refetch } = useSearchGenresQuery({
    query: debouncedQuery || undefined,
    page: currentPage + 1,
    size: PAGE_SIZE,
  });
  const [createGenre] = useCreateGenreMutation();
  const [updateGenre] = useUpdateGenreMutation();
  const [deleteGenre, { isLoading: deletingGenre }] = useDeleteGenreMutation();
  const totalPages = data?.totalPages ?? 0;
  const paged: Genre[] = data?.content ?? [];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };
  const handleNext = () => {
    if (!isFetching && currentPage < totalPages - 1)
      setCurrentPage((p) => p + 1);
  };
  const handlePrev = () => {
    if (!isFetching && currentPage > 0) setCurrentPage((p) => p - 1);
  };

  /* ─── Dialog State ─── */
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({ name: "" });
    setIsOpen(true);
  };

  const handleEdit = (genre: { id: number; name: string }) => {
    setIsEditing(true);
    setCurrentId(genre.id);
    setFormData({ name: genre.name });
    setIsOpen(true);
  };
  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteGenre(deleteId).unwrap();
      toast.success("Đã xóa thể loại!");
      setConfirmOpen(false);
      setDeleteId(null);
      await refetch();
    } catch {
      toast.error("Không thể xóa thể loại");
    }
  };
  const handleSave = async () => {
    if (!formData.name.trim()) return;
    try {
      setIsSaving(true);
      if (isEditing && currentId) {
        await updateGenre({
          id: currentId,
          body: { name: formData.name },
        }).unwrap();
        toast.success("Đã cập nhật thể loại!");
      } else {
        await createGenre({ name: formData.name }).unwrap();
        toast.success("Đã tạo thể loại!");
        setCurrentPage(0);
      }
      setIsOpen(false);
      setFormData({ name: "" });
      await refetch();
    } catch {
      toast.error("Không thể lưu thể loại");
    } finally {
      setIsSaving(false);
    }
  };

  // --- JSX ---
  return (
    <div className="space-y-6 p-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Thể Loại</h1>
          <p className="text-sm text-zinc-400">Quản lý danh mục phim</p>
        </div>
        <Button onClick={handleAdd} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="mr-2 size-4" /> Thêm Thể Loại
        </Button>
      </div>

      {/* ─── Search ─── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder="Tìm kiếm thể loại..."
          className="pl-9 bg-zinc-900 border-zinc-700"
          value={query}
          onChange={handleSearch}
        />
      </div>

      {/* ─── Table ─── */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-950">
            <TableRow className="hover:bg-zinc-900">
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Tên</TableHead>
              {/* <TableHead>Slug</TableHead> (Tạm ẩn nếu chưa có data) */}
              <TableHead className="text-right">Phim</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto size-6 animate-spin text-zinc-500" />
                </TableCell>
              </TableRow>
            ) : paged.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-zinc-500"
                >
                  {isError ? "Không thể tải thể loại." : "Không tìm thấy thể loại nào."}
                </TableCell>
              </TableRow>
            ) : (
              paged.map((g) => (
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
                  {/* <TableCell className="text-zinc-400 italic">slug-here</TableCell> */}
                  <TableCell className="text-right text-zinc-300">
                    {g.movieCount || "0"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
                        >
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-zinc-900 border-zinc-700 text-white"
                      >
                        <DropdownMenuItem
                          onClick={() => handleEdit({ id: g.id, name: g.name })}
                          className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Chỉnh Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(g.id)}
                          className="text-red-500 cursor-pointer hover:bg-red-900/20 focus:bg-red-900/20 hover:text-red-400 focus:text-red-400"
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

      {/* ─── Pagination ─── */}
      <div className="flex justify-center pt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={handlePrev}
                className={
                  isFetching || currentPage === 0
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-4 text-sm text-zinc-400">
                Trang {currentPage + 1} / {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={handleNext}
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

      {/* ─── Add/Edit Dialog (Giữ nguyên UI) ─── */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Chỉnh Sửa Thể Loại" : "Thêm Thể Loại Mới"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {isEditing ? "Cập nhật thông tin thể loại." : "Nhập tên thể loại."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4 relative">
              <Label htmlFor="name" className="text-right text-zinc-300">
                Tên
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="name"
                  className="bg-zinc-950 border-zinc-700 focus-visible:ring-teal-600"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="Nhập tên thể loại..."
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              className="bg-teal-600 hover:bg-teal-700"
              disabled={isSaving || !formData.name.trim()}
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin text-zinc-500" />
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
        title="Xóa thể loại?"
        description="Bạn có chắc muốn xóa thể loại này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        isLoading={deletingGenre}
      />
    </div>
  );
}
