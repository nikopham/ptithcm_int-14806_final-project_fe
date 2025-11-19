import { useState, useEffect } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useDebounce } from "@/hooks/useDebounce";
import {
  createGenreAsync,
  fetchGenresAsync,
  searchTmdbGenresAsync,
  updateGenreAsync,
} from "@/features/genre/genreThunks";
import {
  clearGenreList,
  clearTmdbResults,
  resetCreateStatus,
  resetUpdateStatus,
} from "@/features/genre/genreSlice"; // (Nếu bạn có action này)
import type { GetGenresParams } from "@/types/genre"; // (Nếu bạn tách file types)
import type { GenreListItem } from "@/types/genre";

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

export default function GenreList() {
  const dispatch = useAppDispatch();

  // 1. Lấy State từ Redux
  const {
    list,
    status,
    tmdbResults,
    tmdbStatus,
    listTotalPages,
    createStatus,
    updateStatus,
  } = useAppSelector((state) => state.genre);
  const isLoading = status === "loading";

  const isSaving = createStatus === "loading" || updateStatus === "loading";

  // 2. State Local
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const debouncedQuery = useDebounce(query, 500);

  // 3. useEffect Gọi API
  useEffect(() => {
    const params: GetGenresParams = {
      query: debouncedQuery || undefined,
      page: currentPage,
      size: 10, // Số lượng mỗi trang
    };

    // (Tùy chọn: Reset list khi query đổi để tránh flash nội dung cũ)
    // if (currentPage === 0) dispatch(clearGenreList());

    dispatch(fetchGenresAsync(params));
  }, [debouncedQuery, currentPage, dispatch]);

  // 4. Hàm xử lý Filter/Page
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setCurrentPage(0); // Reset về trang 0 khi tìm kiếm
  };

  const handleNext = () => {
    if (currentPage < listTotalPages - 1) setCurrentPage((p) => p + 1);
  };

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage((p) => p - 1);
  };

  /* ─── Dialog State (Giữ nguyên logic UI, chưa kết nối API Add/Edit) ─── */
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [currentId, setCurrentId] = useState<number | null>(null);

  // (MỚI) Form data có thêm tmdbId
  const [formData, setFormData] = useState({
    name: "",
    tmdbId: null as number | null,
  });

  // (MỚI) State tìm kiếm trong Modal
  const [modalSearch, setModalSearch] = useState("");
  const debouncedModalSearch = useDebounce(modalSearch, 300);

  // (MỚI) useEffect để tìm kiếm TMDb khi gõ trong Modal
  useEffect(() => {
    if (isOpen && debouncedModalSearch) {
      dispatch(searchTmdbGenresAsync(debouncedModalSearch));
    } else {
      dispatch(clearTmdbResults());
    }
  }, [debouncedModalSearch, isOpen, dispatch]);

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({ name: "", tmdbId: null });
    setModalSearch(""); // Reset search
    setIsOpen(true);
  };

  const handleEdit = (genre: GenreListItem) => {
    setIsEditing(true);
    setCurrentId(genre.id);

    // 1. Đổ dữ liệu vào state
    setFormData({
      name: genre.name,
      tmdbId: genre.tmdbId || null, // Lấy từ list
    });
    // 2. Set modalSearch để hiển thị trong ô Input
    setModalSearch(genre.name);

    setIsOpen(true);
  };
  const pickTmdbGenre = (g: { id: number; name: string }) => {
    setFormData({ name: g.name, tmdbId: g.id });
    setModalSearch(g.name); // Hiển thị tên đã chọn vào ô input
    dispatch(clearTmdbResults()); // Ẩn gợi ý
  };

  const handleSave = async () => {
    if (!formData.name) return;

    let resultAction;

    if (isEditing && currentId) {
      // --- LOGIC UPDATE ---
      resultAction = await dispatch(
        updateGenreAsync({
          id: currentId,
          data: {
            name: formData.name,
            tmdbId: formData.tmdbId,
          },
        })
      );
    } else {
      // --- LOGIC CREATE ---
      resultAction = await dispatch(
        createGenreAsync({
          name: formData.name,
          tmdbId: formData.tmdbId,
        })
      );
    }

    // Xử lý kết quả chung
    if (
      createGenreAsync.fulfilled.match(resultAction) ||
      updateGenreAsync.fulfilled.match(resultAction)
    ) {
      toast.success(isEditing ? "Genre updated!" : "Genre created!");
      setIsOpen(false);

      // Reset form
      setFormData({ name: "", tmdbId: null });
      setModalSearch("");

      // Nếu là Create thì nên fetch lại để thấy item mới (hoặc sort lại)
      // Nếu là Update thì slice đã tự update UI rồi, nhưng fetch lại cũng an toàn
      if (!isEditing) {
        setCurrentPage(0);
        dispatch(
          fetchGenresAsync({ query: debouncedQuery, page: 0, size: 10 })
        );
      }
    } else {
      toast.error((resultAction.payload as string) || "Failed to save genre");
    }

    // Reset status
    dispatch(resetCreateStatus());
    dispatch(resetUpdateStatus());
  };

  // --- JSX ---
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
          onChange={handleSearch}
        />
      </div>

      {/* ─── Table ─── */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-950">
            <TableRow className="hover:bg-zinc-900">
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Name</TableHead>
              {/* <TableHead>Slug</TableHead> (Tạm ẩn nếu chưa có data) */}
              <TableHead className="text-right">Movies</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto size-6 animate-spin text-zinc-500" />
                </TableCell>
              </TableRow>
            ) : list.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-zinc-500"
                >
                  No genre found.
                </TableCell>
              </TableRow>
            ) : (
              list.map((g) => (
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
                    {g.movieCount} {/* Dữ liệu thật từ Backend */}
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
                  isLoading || currentPage === 0
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-4 text-sm text-zinc-400">
                Page {currentPage + 1} of {listTotalPages || 1}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={handleNext}
                className={
                  isLoading || currentPage >= listTotalPages - 1
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
              {isEditing ? "Edit Genre" : "Add New Genre"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {isEditing
                ? "Update genre details."
                : "Search and select a genre from TMDB."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4 relative">
              <Label htmlFor="name" className="text-right text-zinc-300">
                Name
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="name"
                  className="bg-zinc-950 border-zinc-700 focus-visible:ring-teal-600"
                  // Nếu đang Add: hiển thị modalSearch. Nếu Edit: hiển thị formData.name
                  value={modalSearch}
                  onChange={(e) => {
                    const newVal = e.target.value;
                    setModalSearch(newVal);

                    // 4. Khi người dùng gõ (kể cả đang Edit),
                    // ta reset về Custom (tmdbId: null) và cập nhật name
                    setFormData((prev) => ({
                      ...prev,
                      name: newVal,
                      tmdbId: null,
                    }));
                  }}
                  placeholder="Type to search TMDB or enter custom name..."
                  autoComplete="off"
                />

                {/* Dropdown Gợi ý & Custom Option */}

                {modalSearch && tmdbResults.length > 0 && (
                  <ul className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg max-h-60 overflow-auto">
                    {/* 1. Option tạo Custom Genre (Luôn hiện đầu tiên) */}
                    <li
                      className="px-3 py-2 hover:bg-teal-900/30 cursor-pointer text-sm flex flex-col border-b border-zinc-700/50"
                      onClick={() => {
                        // A. Lưu tên đang gõ vào form, set ID là null
                        setFormData({ name: modalSearch, tmdbId: null });

                        // B. Xóa kết quả tìm kiếm -> Điều này làm ẩn <ul> ngay lập tức
                        dispatch(clearTmdbResults());
                      }}
                    >
                      <span className="font-medium text-teal-400">
                        Create "{modalSearch}"
                      </span>
                      <span className="text-xs text-zinc-500">
                        Custom Genre (No TMDB ID)
                      </span>
                    </li>

                    {/* 2. Các Option từ TMDB */}
                    {tmdbResults.map((g) => (
                      <li
                        key={g.id}
                        onClick={() => pickTmdbGenre(g)}
                        className="px-3 py-2 hover:bg-zinc-700 cursor-pointer text-sm flex justify-between items-center"
                      >
                        <span>{g.name}</span>
                        <span className="text-xs bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-500">
                          TMDB
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Loading Indicator */}
                {tmdbStatus === "loading" && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="size-4 animate-spin text-zinc-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Hiển thị trạng thái ID để người dùng biết đang chọn mode nào */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-zinc-300">Source</Label>
              <div className="col-span-3">
                {formData.tmdbId ? (
                  <Badge className="bg-teal-600 hover:bg-teal-700">
                    Linked to TMDB (ID: {formData.tmdbId})
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-zinc-400 border-zinc-600"
                  >
                    Custom / Manual Entry
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-teal-600 hover:bg-teal-700"
              // Vô hiệu hóa nút Save nếu ô input trống
              disabled={isEditing ? !formData.name : !modalSearch}
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin text-zinc-500" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
