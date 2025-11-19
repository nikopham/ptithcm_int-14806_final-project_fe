import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  MoreHorizontal,
  Loader2,
} from "lucide-react"; // 1. Import Loader2
import { useAppDispatch, useAppSelector } from "@/app/hooks"; // 2. Import hooks
import { useDebounce } from "@/hooks/useDebounce"; // 3. Import useDebounce (Rất quan trọng)
import {
  fetchMoviesAsync,
  // deleteMovieAsync, // (Bạn sẽ cần Thunk này)
} from "@/features/movie/movieThunks";
import { clearMovieList } from "@/features/movie/movieSlice";

import type { MovieListItem, MovieStatus } from "@/types/movie"; // 4. Import types

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
import type { GetMoviesParams } from "@/features/movie/movieApi";

/* ─── (XÓA) Mock Data ─── */
// const rows: Movie[] = [...] // Đã xóa

const statusColor: Record<MovieStatus, string> = {
  PUBLISHED: "bg-emerald-600 hover:bg-emerald-700",
  DRAFT: "bg-yellow-600 text-white hover:bg-yellow-700",
  HIDDEN: "bg-zinc-700 hover:bg-zinc-600",
};

export default function MovieList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // 5. Lấy State từ Redux
  const { list, listPage, listTotalPages, listStatus } = useAppSelector(
    (state) => state.movie
  );
  const isLoading = listStatus === "loading";

  // 6. State cho Filter (Giữ nguyên)
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | MovieStatus>("all");
  const [filterType, setFilterType] = useState<"all" | "movie" | "series">(
    "all"
  );

  // 7. State cho Phân trang
  const [currentPage, setCurrentPage] = useState(0); // Bắt đầu từ trang 0

  // 8. Tối ưu hóa tìm kiếm (Chỉ tìm khi người dùng ngừng gõ 500ms)
  const debouncedQuery = useDebounce(query, 500);

  /* 9. (XÓA) Filter Logic (useMemo) */
  // const data = useMemo(...) // Đã xóa

  /* 10. (MỚI) useEffect để gọi API */
  useEffect(() => {
    // Chuyển đổi state của component sang param của API
    const params: GetMoviesParams = {
      query: debouncedQuery || undefined, // Gửi undefined nếu rỗng
      status: filterStatus === "all" ? undefined : filterStatus,
      isSeries: filterType === "all" ? undefined : filterType === "series",
      page: currentPage,
      size: 7, // (Bạn có thể đổi số này)
    };

    dispatch(fetchMoviesAsync(params));
  }, [debouncedQuery, filterStatus, filterType, currentPage, dispatch]);

  /**
   * (MỚI) Hàm reset và tìm kiếm lại từ trang 0
   * (Được gọi khi thay đổi filter)
   */
  const handleFilterChange = (setter: Function, value: any) => {
    setter(value);
    // Khi filter thay đổi, LUÔN quay về trang 0
    if (currentPage !== 0) {
      setCurrentPage(0);
    } else {
      // Nếu đã ở trang 0, ta cần xóa list cũ và fetch lại
      dispatch(clearMovieList());
    }
  };

  /**
   * (MỚI) Hàm tải thêm (Load More)
   */
  const handleLoadMore = () => {
    if (!isLoading && currentPage < listTotalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentPage < listTotalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };
  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  /* Action Handlers */
  const handleDelete = (id: string) => {
    if (confirm(`Are you sure you want to delete movie ID: ${id}?`)) {
      // dispatch(deleteMovieAsync(id)); // (Bạn sẽ cần tạo Thunk này)
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
            onChange={(e) => handleFilterChange(setQuery, e.target.value)}
          />
        </div>

        {/* Filter Status */}
        <Select
          value={filterStatus}
          onValueChange={(v) => handleFilterChange(setFilterStatus, v)}
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
          onValueChange={(v) => handleFilterChange(setFilterType, v)}
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
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <Loader2 className="mx-auto size-6 animate-spin text-zinc-500" />
                </TableCell>
              </TableRow>
            )}

            {/* 11. (CẬP NHẬT) Lặp qua 'list' từ Redux */}
            {!isLoading &&
              list.map((m: MovieListItem) => (
                <TableRow
                  key={m.id}
                  className="hover:bg-zinc-800/50 border-zinc-800"
                >
                  {/* Poster */}
                  <TableCell>
                    <div className="h-14 w-10 overflow-hidden rounded bg-zinc-800 shrink-0">
                      {m.poster ? (
                        <img
                          src={m.poster} // (Giờ đã là URL Cloudinary)
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
                      {m.series && ( // (Backend trả về 'isSeries')
                        <span className="text-xs font-medium text-teal-400">
                          TV Series
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Metadata */}
                  <TableCell className="hidden md:table-cell text-zinc-400">
                    {" "}
                    {m.release && m.release !== "—"
                      ? m.release.split("-")[0] // Lấy phần tử đầu tiên (năm)
                      : "—"}{" "}
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

            {/* 12. (MỚI) Trạng thái Loading */}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <Loader2 className="mx-auto size-6 animate-spin text-zinc-500" />
                </TableCell>
              </TableRow>
            )}

            {/* 13. (MỚI) Trạng thái Không có kết quả */}
            {!isLoading && list.length === 0 && (
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

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={handlePrev}
              disabled={isLoading || currentPage === 0}
              className={
                isLoading || currentPage === 0
                  ? "text-zinc-600 hover:bg-transparent"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {/* Hiển thị trang hiện tại */}
          <PaginationItem>
            <span className="px-4 py-2 text-sm font-medium text-zinc-300">
              Page {listTotalPages > 0 ? currentPage + 1 : 0} of{" "}
              {listTotalPages}
            </span>
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              onClick={handleNext}
              disabled={isLoading || currentPage + 1 >= listTotalPages}
              className={
                isLoading || currentPage + 1 >= listTotalPages
                  ? "text-zinc-600 hover:bg-transparent"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
