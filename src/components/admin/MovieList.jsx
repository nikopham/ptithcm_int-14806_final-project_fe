import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, Search, X } from "lucide-react";
import { format } from "date-fns";
import { searchMoviesList } from "@/services/movieService";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const DEFAULT_LIMIT = 10;

export function MovieList() {
  // State cho dữ liệu
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    list: movies,
    pagination,
    loading,
    error,
  } = useSelector((state) => state.movie);

  // State cho các tham số API (trang, bộ lọc)
  const [params, setParams] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    search: "",
    status: "",
    type: "",
  });

  // State cho các input (để người dùng gõ trước khi "Áp dụng")
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    type: "",
  });

  // Effect để fetch data khi 'params' thay đổi
  useEffect(() => {
    searchMoviesList(dispatch, params);
  }, [dispatch, params]); // Hook này chạy lại mỗi khi 'params' thay đổi

  // --- Handlers (Hàm xử lý sự kiện) ---

  // Chuyển trang
  const handlePageChange = (direction) => {
    setParams((p) => ({
      ...p,
      page: p.page + (direction === "next" ? 1 : -1),
    }));
  };

  // Cập nhật state của input
  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };

  // Nút "Áp dụng"
  const applyFilters = () => {
    setParams({
      ...params,
      ...filters,
      page: 1, // Reset về trang 1 khi lọc
    });
  };

  // Nút "Xóa lọc"
  const resetFilters = () => {
    setFilters({ search: "", status: "", type: "" });
    setParams({
      ...params,
      search: "",
      status: "",
      type: "",
      page: 1,
    });
  };
  const handleEdit = (movie) => {
    navigate(`/admin-dashboard/movie/${movie.id}/edit`, {
      state: { movie },
    });
  };
  return (
    <div className="space-y-4">
      {/* 1. KHU VỰC LỌC */}
      <div className="flex flex-wrap items-end gap-3 w-full">
        {/* Input Tìm kiếm (theo yêu cầu) */}
        <div className="flex-1 min-w-[250px]">
          <Label htmlFor="search">Tìm kiếm</Label>
          <Input
            id="search"
            placeholder="Tìm theo tên phim..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="mt-1"
          />
        </div>
        {/* Lọc Trạng thái */}
        <div className="min-w-[180px]">
          <Label htmlFor="status">Trạng thái</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger id="status" className="mt-1">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Tất cả trạng thái</SelectItem>
              <SelectItem value="published">Công khai</SelectItem>
              <SelectItem value="pending">Đang chờ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Lọc Loại phim */}
        <div className="min-w-[180px]">
          <Label htmlFor="type">Loại phim</Label>
          <Select
            value={filters.type}
            onValueChange={(value) => handleFilterChange("type", value)}
          >
            <SelectTrigger id="type" className="mt-1">
              <SelectValue placeholder="Tất cả loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Tất cả loại</SelectItem>
              <SelectItem value="movie">Phim lẻ</SelectItem>
              <SelectItem value="tv">Phim bộ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Nút Áp dụng / Xóa lọc */}
        <Button onClick={applyFilters} disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          Áp dụng
        </Button>
        <Button variant="outline" onClick={resetFilters} disabled={loading}>
          <X className="h-4 w-4 mr-2" />
          Xóa lọc
        </Button>
      </div>

      {/* 2. KHU VỰC PHÂN TRANG */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={params.page <= 1 || loading}
          onClick={() => handlePageChange("prev")}
        >
          Trang trước
        </Button>
        <span className="text-sm text-muted-foreground">
          Trang {pagination?.page || 1}/{pagination?.totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={
            (pagination?.page || 1) >= (pagination?.totalPages || 1) || loading
          }
          onClick={() => handlePageChange("next")}
        >
          Trang sau
        </Button>
        <span className="ml-auto text-sm text-muted-foreground">
          Tổng cộng: {pagination?.totalItems || 0} phim
        </span>
      </div>

      {/* 3. KHU VỰC BẢNG DỮ LIỆU */}
      <div className="relative w-full overflow-x-auto rounded-lg border">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Ảnh</TableHead>
              <TableHead>Tên phim</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Số tập</TableHead>
              <TableHead>Lượt xem</TableHead>
              <TableHead>Ngày thêm</TableHead>
              <TableHead className="w-[100px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!loading && movies.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground h-24"
                >
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
            {movies.map((movie) => (
              <TableRow key={movie.id}>
                <TableCell>
                  <img
                    src={
                      movie.poster_url || "https://via.placeholder.com/50x75"
                    }
                    alt="Poster"
                    className="w-14 aspect-[2/3] rounded-md object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium max-w-[300px] truncate">
                  {movie.title}
                </TableCell>
                <TableCell>
                  {movie.status === "published" ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Công khai
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      Đang chờ
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {movie.type === "series" ? "Phim bộ" : "Phim lẻ"}
                </TableCell>
                <TableCell className="text-center">
                  {movie.total_episodes}
                </TableCell>
                <TableCell>{movie.view_count}</TableCell>
                <TableCell>
                  {format(new Date(movie.created_at), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1"
                    onClick={() => handleEdit(movie)}
                  >
                    <Pencil className="w-4 h-4" />
                    Sửa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
