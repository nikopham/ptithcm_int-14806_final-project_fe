import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  MoreHorizontal,
  Loader2,
  Film,
} from "lucide-react";
import {
  useSearchMoviesQuery,
  useDeleteMovieMutation,
} from "@/features/movie/movieApi";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
// Using API search; no local mocks

// Shape used for admin listing rows (superset of API summary)
interface MovieRow {
  id: string;
  title: string;
  originalTitle?: string;
  posterUrl?: string;
  ageRating: string;
  isSeries: boolean;
  createdAt?: string;
  durationMin?: number;
  status?: string;
  viewCount?: number;
  releaseYear?: number;
}

const statusColor: Record<string, string> = {
  PUBLISHED: "bg-emerald-600 hover:bg-emerald-700 text-white",
  DRAFT: "bg-yellow-600 text-white hover:bg-yellow-700",
  HIDDEN: "bg-gray-600 hover:bg-gray-700 text-white",
};

export default function MovieList() {
  const navigate = useNavigate();
  const [deleteMovie, { isLoading: deletingMutation }] =
    useDeleteMovieMutation();

  // Local UI state for filters and paging
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | "all">("all");
  const [filterType, setFilterType] = useState<"all" | "movie" | "series">(
    "all"
  );
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 7;

  // Delete dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Query API with current filters (page is 1-based for UI)
  const { data, isLoading, isError } = useSearchMoviesQuery({
    query: query || undefined,
    status: filterStatus === "all" ? undefined : filterStatus,
    isSeries: filterType === "all" ? undefined : filterType === "series",
    page: currentPage + 1,
    size: PAGE_SIZE,
  });

  const totalPages = data?.totalPages ?? 0;
  const pagedItems = (data?.content ?? []) as unknown as MovieRow[];

  const handleFilterChange = <T,>(setter: (v: T) => void, value: T) => {
    setter(value);
    if (currentPage !== 0) setCurrentPage(0);
  };

  const handleNext = () => {
    if (!isLoading && currentPage < totalPages - 1)
      setCurrentPage((p) => p + 1);
  };
  const handlePrev = () => {
    if (!isLoading && currentPage > 0) setCurrentPage((p) => p - 1);
  };

  const handleDelete = (id: string) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    setDeleting(true);
    try {
      await deleteMovie(selectedId).unwrap();
      setConfirmOpen(false);
      toast.success("Xóa thành công");
    } catch {
      setConfirmOpen(false);
      setErrorOpen(true);
    } finally {
      setDeleting(false);
    }
  };

  // Confirm and error dialogs
  return (
    <>
      <div className="space-y-6 p-6">
        {/* ─── Header ─── */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Film className="size-6 text-[#C40E61]" />
              Phim
            </h1>
            <p className="text-sm text-gray-500">Quản lý cơ sở dữ liệu phim của bạn</p>
          </div>
          <Button
            onClick={() => navigate("/admin/movies/new")}
            className="bg-[#C40E61] hover:bg-[#C40E61]/90 text-white"
          >
            <Plus className="mr-2 size-4" /> Thêm Phim
          </Button>
        </div>

        {/* ─── Filters ─── */}
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Search */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Tìm kiếm tiêu đề…"
              className="pl-9 bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C40E61]"
              value={query}
              onChange={(e) => handleFilterChange(setQuery, e.target.value)}
            />
          </div>

          {/* Filter Status */}
          <Select
            value={filterStatus}
            onValueChange={(v) => handleFilterChange(setFilterStatus, v)}
          >
            <SelectTrigger className="w-full sm:w-40 bg-white border-gray-300 text-gray-700 hover:bg-gray-100">
              <SelectValue placeholder="Trạng Thái" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-300 text-gray-900">
              <SelectItem value="all">Tất Cả Trạng Thái</SelectItem>
              <SelectItem value="PUBLISHED">Đã Xuất Bản</SelectItem>
              <SelectItem value="DRAFT">Bản Nháp</SelectItem>
              <SelectItem value="HIDDEN">Ẩn</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Type */}
          <Select
            value={filterType}
            onValueChange={(v: "all" | "movie" | "series") =>
              handleFilterChange(setFilterType, v)
            }
          >
            <SelectTrigger className="w-full sm:w-40 bg-white border-gray-300 text-gray-700 hover:bg-gray-100">
              <SelectValue placeholder="Loại" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-300 text-gray-900">
              <SelectItem value="all">Tất Cả Loại</SelectItem>
              <SelectItem value="movie">Phim</SelectItem>
              <SelectItem value="series">Phim Bộ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ─── Table ─── */}
        <div className="rounded-lg border border-gray-300 bg-white overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow className="hover:bg-gray-50">
                <TableHead className="w-20">Poster</TableHead>

                <TableHead>Tiêu Đề</TableHead>

                <TableHead className="hidden md:table-cell">Phát Hành</TableHead>

                <TableHead className="hidden lg:table-cell">Thời Lượng</TableHead>

                <TableHead className="hidden lg:table-cell">Độ Tuổi</TableHead>

                <TableHead>Trạng Thái</TableHead>

                <TableHead className="hidden md:table-cell text-right">
                  Lượt Xem
                </TableHead>

                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <Loader2 className="mx-auto size-6 animate-spin text-[#C40E61]" />
                  </TableCell>
                </TableRow>
              )}

              {/* Render filtered + paginated list */}
              {!isLoading &&
                pagedItems.map((m: MovieRow) => (
                  <TableRow
                    key={m.id}
                    className="hover:bg-gray-50 border-gray-200"
                  >
                    {/* Poster */}
                    <TableCell>
                      <div className="h-14 w-10 overflow-hidden rounded bg-gray-200 shrink-0">
                        {m.posterUrl ? (
                          <img
                            src={m.posterUrl}
                            alt={m.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                            N/A
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Title & Type */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {m.title}
                        </span>
                        {m.isSeries && (
                          <span className="text-xs font-medium text-[#C40E61]">
                            Phim Bộ
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Metadata */}
                    <TableCell className="hidden md:table-cell text-gray-500">
                      {m.releaseYear}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-gray-500">
                      {m.durationMin || "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="inline-flex items-center rounded border border-gray-300 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {m.ageRating}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        className={`${statusColor[m.status || "DRAFT"]} border-none`}
                      >
                        {m.status || "DRAFT"}
                      </Badge>
                    </TableCell>

                    <TableCell className="hidden md:table-cell text-right text-gray-700">
                      {m.viewCount ?? 0}
                    </TableCell>

                    {/* Action Menu */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          >
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-white border-gray-300 text-gray-900"
                        >
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/admin/movies/edit/${m.id}`)
                            }
                            className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Chỉnh Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/admin/movies/source/${m.id}`)
                            }
                            className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
                          >
                            <Search className="mr-2 h-4 w-4" /> Quản Lý Nguồn
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(m.id)}
                            className="text-red-600 cursor-pointer hover:bg-red-50 focus:bg-red-50 hover:text-red-700 focus:text-red-700"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

              {/* 13. (MỚI) Trạng thái Không có kết quả */}
              {!isLoading && pagedItems.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-gray-500"
                  >
                    Không tìm thấy phim nào phù hợp với tiêu chí của bạn.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={handlePrev}
                className={
                  isLoading || currentPage === 0
                    ? "pointer-events-none text-gray-400 hover:bg-transparent"
                    : "cursor-pointer text-gray-700 hover:bg-gray-100"
                }
              />
            </PaginationItem>

            {/* Hiển thị trang hiện tại */}
            <PaginationItem>
              <span className="px-4 py-2 text-sm font-medium text-gray-500">
                Trang {totalPages > 0 ? currentPage + 1 : 0} / {totalPages}
                {isError ? " (lỗi)" : ""}
              </span>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                onClick={handleNext}
                className={
                  isLoading || currentPage + 1 >= totalPages
                    ? "pointer-events-none text-gray-400 hover:bg-transparent"
                    : "cursor-pointer text-gray-700 hover:bg-gray-100"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xóa phim?"
        description="Bạn chỉ có thể xóa nếu chưa có người xem nào xem phim này hoặc comment phim này hoặc đánh giá phim này"
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        isLoading={deleting || deletingMutation}
      />

      {/* Error dialog when delete is not allowed */}
      <AlertDialog open={errorOpen} onOpenChange={setErrorOpen}>
        <AlertDialogContent className="bg-white border-gray-300 text-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">
              Đã có dữ liệu người dùng trên phim này
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="text-sm text-gray-500">
            Đã có dữ liệu người dùng trên phim này, vui lòng set status là
            HIDDEN thay vì xóa
          </div>
          <AlertDialogFooter>
            <AlertDialogAction
              className="bg-[#C40E61] hover:bg-[#C40E61]/90 text-white"
              onClick={() => setErrorOpen(false)}
            >
              Đóng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
