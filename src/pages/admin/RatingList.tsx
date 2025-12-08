import { useState } from "react";
import { format } from "date-fns";
import { Eye, Search, Star, MessageSquareQuote, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSearchReviewsQuery } from "@/features/review/reviewApi";
import type { Review } from "@/types/review";

export default function RatingList() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const size = 10;

  const { data, isLoading, isFetching, error } = useSearchReviewsQuery({
    query: query || undefined,
    page,
    size,
  });
  const reviews: Review[] = data?.content ?? [];

  /* Dialog State */
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;
  const currentPage = page;

  /* Helper: Render Stars */
  const renderStars = (rating: number, size: 3 | 4 = 4) => {
    const sizeClass = size === 3 ? "size-3" : "size-4";
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? "fill-yellow-500 text-yellow-500"
                : "fill-zinc-800 text-zinc-700"
            }`}
          />
        ))}
      </div>
    );
  };

  /* Helper: Handle View Detail */
  const handleView = (review: Review) => {
    setSelectedReview(review);
    setIsDialogOpen(true);
  };

  /* Helper: Username initials */
  const getInitials = (name?: string) =>
    (name || "?")
      .trim()
      .split(" ")
      .map((p) => p.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();

  return (
    <div className="space-y-6 p-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Đánh Giá Người Dùng</h1>
          <p className="text-sm text-zinc-400">
            Theo dõi đánh giá và phản hồi của người dùng
          </p>
        </div>
        {/* Stats Summary (Optional) */}
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{totalElements}</p>
            <p className="text-xs text-zinc-500">Tổng Đánh Giá</p>
          </div>
        </div>
      </div>

      {/* ─── Search ─── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder="Tìm kiếm phim, người dùng hoặc tiêu đề..."
          className="pl-9 bg-zinc-900 border-zinc-700"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* ─── Table ─── */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-950">
            <TableRow className="hover:bg-zinc-900">
              <TableHead className="min-w-[200px] sm:min-w-[250px]">Phim</TableHead>
              <TableHead className="hidden sm:table-cell min-w-[150px]">Người Dùng</TableHead>
              <TableHead className="w-[100px] sm:w-[120px]">Đánh Giá</TableHead>
              <TableHead className="hidden md:table-cell">Tiêu Đề Đánh Giá</TableHead>
              <TableHead className="hidden lg:table-cell text-right min-w-[100px]">
                Ngày
              </TableHead>
              <TableHead className="w-[60px] sm:w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((r) => (
              <TableRow
                key={r.id}
                className="hover:bg-zinc-800/50 border-zinc-800"
              >
                {/* Movie Info - Combined with User on mobile */}
                <TableCell className="min-w-[200px] sm:min-w-[250px]">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <img
                      src={r.moviePosterUrl || ""}
                      alt={r.movieTitle}
                      className="h-10 w-7 sm:h-12 sm:w-8 rounded bg-zinc-800 object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs sm:text-sm font-medium text-white line-clamp-1 block">
                        {r.movieTitle}
                      </span>
                      {/* Show user on mobile */}
                      <div className="flex items-center gap-1.5 sm:hidden mt-1">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={r.userAvatar} />
                          <AvatarFallback className="text-[8px] bg-teal-800 text-teal-200">
                            {getInitials(r.username)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] text-zinc-400 truncate">
                          {r.username}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* User Info - Hidden on mobile */}
                <TableCell className="hidden sm:table-cell min-w-[150px]">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5 sm:h-6 sm:w-6 shrink-0">
                      <AvatarImage src={r.userAvatar} />
                      <AvatarFallback className="text-[9px] sm:text-[10px] bg-teal-800 text-teal-200">
                        {getInitials(r.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm text-zinc-200 truncate">
                        {r.username}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Rating Stars */}
                <TableCell className="w-[100px] sm:w-[120px]">
                  <div className="hidden sm:block">{renderStars(r.rating, 4)}</div>
                  <div className="sm:hidden">{renderStars(r.rating, 3)}</div>
                </TableCell>

                {/* Review Title - Hidden on mobile/tablet */}
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs sm:text-sm font-medium text-white line-clamp-1">
                      {r.title}
                    </span>
                    <span className="text-[10px] sm:text-xs text-zinc-500 line-clamp-1">
                      {r.body}
                    </span>
                  </div>
                </TableCell>

                {/* Date - Hidden on mobile/tablet */}
                <TableCell className="hidden lg:table-cell text-right text-zinc-400 text-xs min-w-[100px]">
                  {new Date(r.createdAt).toLocaleDateString("en-GB")}
                </TableCell>

                {/* Actions */}
                <TableCell className="w-[60px] sm:w-[80px]">
                  <Button
                    variant="ghost"
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-zinc-400 hover:text-teal-400 hover:bg-teal-400/10"
                    onClick={() => handleView(r)}
                  >
                    <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(isLoading || isFetching) && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-20 sm:h-24 text-center text-zinc-500 text-sm"
                >
                  Đang tải đánh giá...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && reviews.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-20 sm:h-24 text-center text-zinc-500 text-sm"
                >
                  Không tìm thấy đánh giá nào.
                </TableCell>
              </TableRow>
            )}
            {!!error && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-20 sm:h-24 text-center text-red-400 text-sm"
                >
                  Không thể tải đánh giá.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ─── Pagination ─── */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={
                    isFetching || currentPage <= 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-4 text-sm text-zinc-400">
                  Trang {currentPage} / {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={
                    isFetching || currentPage >= totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* ─── Detail Dialog ─── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[600px]">
          {selectedReview && (
            <>
              <DialogHeader>
                <DialogTitle>Chi Tiết Đánh Giá</DialogTitle>
                <DialogDescription>
                  ID Đánh Giá:{" "}
                  <span className="font-mono text-xs text-zinc-500">
                    {selectedReview.id}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Top Section: User & Movie Context */}
                <div className="flex flex-col gap-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:flex-row">
                  {/* Movie Poster */}
                  <img
                    src={selectedReview.moviePosterUrl || ""}
                    alt="poster"
                    className="h-32 w-24 shrink-0 rounded object-cover"
                  />

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {selectedReview.movieTitle}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
                        <Film className="size-3" /> Phim
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3 border-t border-zinc-800 pt-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedReview.userAvatar} />
                        <AvatarFallback className="bg-teal-900 text-teal-200">
                          {getInitials(selectedReview.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {selectedReview.username}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Big Rating Badge */}
                  <div className="flex flex-col items-end justify-start">
                    <Badge
                      variant="outline"
                      className="border-yellow-600/50 bg-yellow-900/20 text-yellow-500 text-lg font-bold px-3 py-1"
                    >
                      {selectedReview.rating} / 5
                    </Badge>
                    <span className="mt-2 text-xs text-zinc-500 text-right">
                      {format(new Date(selectedReview.createdAt), "PPP")}
                    </span>
                  </div>
                </div>

                {/* Review Content */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-teal-400">
                    <MessageSquareQuote className="size-5" />
                    <h4 className="font-semibold text-lg text-white">
                      "{selectedReview.title}"
                    </h4>
                  </div>

                  <ScrollArea className="h-[200px] rounded-md border border-zinc-800 bg-zinc-950/50 p-4 text-zinc-300 leading-relaxed">
                    {selectedReview.body}
                  </ScrollArea>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
