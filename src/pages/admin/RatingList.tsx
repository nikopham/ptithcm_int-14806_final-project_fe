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
  const renderStars = (rating: number, size = 4) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`size-${size} ${
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
          <h1 className="text-2xl font-bold text-white">User Reviews</h1>
          <p className="text-sm text-zinc-400">
            Monitor user ratings and feedback
          </p>
        </div>
        {/* Stats Summary (Optional) */}
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{totalElements}</p>
            <p className="text-xs text-zinc-500">Total Reviews</p>
          </div>
        </div>
      </div>

      {/* ─── Search ─── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder="Search movie, user or title..."
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
              <TableHead className="w-[250px]">Movie</TableHead>
              <TableHead className="w-[200px]">User</TableHead>
              <TableHead className="w-[120px]">Rating</TableHead>
              <TableHead>Review Title</TableHead>
              <TableHead className="hidden md:table-cell text-right">
                Date
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((r) => (
              <TableRow
                key={r.id}
                className="hover:bg-zinc-800/50 border-zinc-800"
              >
                {/* Movie Info */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={r.moviePosterUrl || ""}
                      alt={r.movieTitle}
                      className="h-12 w-8 rounded bg-zinc-800 object-cover"
                    />
                    <span className="font-medium text-white line-clamp-1">
                      {r.movieTitle}
                    </span>
                  </div>
                </TableCell>

                {/* User Info */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={r.userAvatar} />
                      <AvatarFallback className="text-[10px] bg-teal-800 text-teal-200">
                        {getInitials(r.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm text-zinc-200">
                        {r.username}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Rating Stars */}
                <TableCell>{renderStars(r.rating)}</TableCell>

                {/* Review Title (Truncated Content) */}
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-white">
                      {r.title}
                    </span>
                    <span className="text-xs text-zinc-500 line-clamp-1">
                      {r.body}
                    </span>
                  </div>
                </TableCell>

                {/* Date */}
                <TableCell className="hidden md:table-cell text-right text-zinc-400 text-xs">
                  {new Date(r.createdAt).toLocaleDateString("en-GB")}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 text-zinc-400 hover:text-teal-400 hover:bg-teal-400/10"
                    onClick={() => handleView(r)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(isLoading || isFetching) && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-zinc-500"
                >
                  Loading reviews...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && reviews.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-zinc-500"
                >
                  No reviews found.
                </TableCell>
              </TableRow>
            )}
            {!!error && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-red-400"
                >
                  Failed to load reviews.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ─── Pagination ─── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <div className="text-xs text-zinc-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-300"
              disabled={currentPage <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-300"
              disabled={currentPage >= totalPages || isFetching}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* ─── Detail Dialog ─── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[600px]">
          {selectedReview && (
            <>
              <DialogHeader>
                <DialogTitle>Review Details</DialogTitle>
                <DialogDescription>
                  Review ID:{" "}
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
                        <Film className="size-3" /> Movie
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
