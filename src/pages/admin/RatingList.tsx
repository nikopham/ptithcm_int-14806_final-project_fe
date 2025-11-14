import { useState, useMemo } from "react";
import { format } from "date-fns"; // Tùy chọn: dùng để format ngày tháng đẹp hơn
import {
  Eye,
  Search,
  Star,
  MessageSquareQuote,
  Calendar,
  Film,
  User as UserIcon,
} from "lucide-react";
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

/* ─── Type Definition ─── */
type Review = {
  id: string;
  rating: number; // 1 - 5
  title: string;
  body: string;
  created_at: string;
  // Các trường Joined từ User và Movie
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  movie: {
    id: string;
    title: string;
    poster: string;
  };
};

/* ─── Mock Data ─── */
const mockReviews: Review[] = [
  {
    id: "rv-1",
    rating: 5,
    title: "Absolute Masterpiece!",
    body: "I was on the edge of my seat the entire time. Christopher Nolan does it again. The visual effects were stunning and the sound design was immersive. Highly recommend watching this in IMAX if you can.",
    created_at: "2023-08-15T10:30:00Z",
    user: {
      id: "u-1",
      name: "John Doe",
      email: "john@example.com",
      avatar: "https://i.pravatar.cc/150?img=33",
    },
    movie: {
      id: "m-1",
      title: "Oppenheimer",
      poster: "https://image.tmdb.org/t/p/w92/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    },
  },
  {
    id: "rv-2",
    rating: 3,
    title: "Good but long",
    body: "The acting was great, but I felt the movie dragged on a bit in the middle. Could have been 30 minutes shorter.",
    created_at: "2023-09-01T14:20:00Z",
    user: {
      id: "u-2",
      name: "Sarah Smith",
      email: "sarah@example.com",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    movie: {
      id: "m-1",
      title: "Oppenheimer",
      poster: "https://image.tmdb.org/t/p/w92/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    },
  },
  {
    id: "rv-3",
    rating: 4,
    title: "Fun ride",
    body: "Really enjoyed the nostalgia. The soundtrack is amazing!",
    created_at: "2023-07-20T09:00:00Z",
    user: {
      id: "u-3",
      name: "Mike Ross",
      email: "mike@example.com",
      avatar: undefined, // No avatar
    },
    movie: {
      id: "m-2",
      title: "Guardians of the Galaxy Vol. 3",
      poster: "https://image.tmdb.org/t/p/w92/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
    },
  },
];

export default function RatingList() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [query, setQuery] = useState("");

  /* Dialog State */
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /* Filter Logic: Search by User Name or Movie Title */
  const filteredData = useMemo(() => {
    const lowerQ = query.toLowerCase();
    return reviews.filter(
      (r) =>
        r.movie.title.toLowerCase().includes(lowerQ) ||
        r.user.name.toLowerCase().includes(lowerQ) ||
        r.title.toLowerCase().includes(lowerQ)
    );
  }, [reviews, query]);

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
            <p className="text-2xl font-bold text-white">{reviews.length}</p>
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
          onChange={(e) => setQuery(e.target.value)}
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
            {filteredData.map((r) => (
              <TableRow
                key={r.id}
                className="hover:bg-zinc-800/50 border-zinc-800"
              >
                {/* Movie Info */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={r.movie.poster}
                      alt={r.movie.title}
                      className="h-12 w-8 rounded bg-zinc-800 object-cover"
                    />
                    <span className="font-medium text-white line-clamp-1">
                      {r.movie.title}
                    </span>
                  </div>
                </TableCell>

                {/* User Info */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={r.user.avatar} />
                      <AvatarFallback className="text-[10px] bg-teal-800 text-teal-200">
                        {r.user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm text-zinc-200">
                        {r.user.name}
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
                  {new Date(r.created_at).toLocaleDateString("en-GB")}
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
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-zinc-500"
                >
                  No reviews found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
                    src={selectedReview.movie.poster}
                    alt="poster"
                    className="h-32 w-24 shrink-0 rounded object-cover"
                  />

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {selectedReview.movie.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
                        <Film className="size-3" /> Movie
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3 border-t border-zinc-800 pt-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedReview.user.avatar} />
                        <AvatarFallback className="bg-teal-900 text-teal-200">
                          {selectedReview.user.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {selectedReview.user.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {selectedReview.user.email}
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
                      {selectedReview.rating}.0 / 5
                    </Badge>
                    <span className="mt-2 text-xs text-zinc-500 text-right">
                      {format(new Date(selectedReview.created_at), "PPP")}
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
