import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Eye,
  Search,
  MessageSquare,
  Film,
  CornerDownRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch"; // Cần component Switch của Shadcn
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";

/* ─── Type Definition ─── */
type UserRole = "viewer" | "admin" | "moderator";

type Comment = {
  id: string;
  parent_id: string | null; // UUID or null
  body: string;
  sentiment_score: number; // -1.0 to 1.0
  is_hidden: boolean;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole; // Để lọc viewer
    avatar?: string;
  };
  movie: {
    id: string;
    title: string;
    poster: string;
  };
};

/* ─── Mock Data ─── */
const mockComments: Comment[] = [
  {
    id: "c-1",
    parent_id: null,
    body: "This movie blew my mind! The ending was totally unexpected.",
    sentiment_score: 0.85, // Rất tích cực
    is_hidden: false,
    created_at: "2023-10-01T10:00:00Z",
    user: {
      id: "u-1",
      name: "Alice Viewer",
      email: "alice@gmail.com",
      role: "viewer",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    movie: {
      id: "m-1",
      title: "Inception",
      poster: "https://image.tmdb.org/t/p/w92/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    },
  },
  {
    id: "c-2",
    parent_id: null,
    body: "Terrible pacing, I fell asleep halfway through.",
    sentiment_score: -0.65, // Tiêu cực
    is_hidden: false,
    created_at: "2023-10-02T14:30:00Z",
    user: {
      id: "u-2",
      name: "Bob Hater",
      email: "bob@yahoo.com",
      role: "viewer",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    movie: {
      id: "m-1",
      title: "Inception",
      poster: "https://image.tmdb.org/t/p/w92/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    },
  },
  {
    id: "c-3",
    parent_id: "c-1", // Reply to comment 1
    body: "I agree! Nolan is a genius.",
    sentiment_score: 0.45, // Tích cực nhẹ
    is_hidden: true, // Đang bị ẩn
    created_at: "2023-10-01T12:00:00Z",
    user: {
      id: "u-3",
      name: "Charlie Fan",
      email: "charlie@outlook.com",
      role: "viewer",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    movie: {
      id: "m-1",
      title: "Inception",
      poster: "https://image.tmdb.org/t/p/w92/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    },
  },
  {
    id: "c-4",
    parent_id: null,
    body: "Admin testing comment.",
    sentiment_score: 0.0,
    is_hidden: false,
    created_at: "2023-10-05T09:00:00Z",
    user: {
      id: "u-99",
      name: "Admin User",
      email: "admin@web.com",
      role: "admin",
    }, // Sẽ bị lọc bỏ
    movie: {
      id: "m-2",
      title: "Barbie",
      poster: "https://image.tmdb.org/t/p/w92/iuFNMS8U5cb6xf8gc2484GyOTmor.jpg",
    },
  },
];

export default function CommentList() {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [query, setQuery] = useState("");

  /* Dialog State */
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /* Filter Logic: Only 'viewer' role & Search text */
  const filteredData = useMemo(() => {
    const lowerQ = query.toLowerCase();
    return comments.filter((c) => {
      const isViewer = c.user.role === "viewer";
      const matchSearch =
        c.body.toLowerCase().includes(lowerQ) ||
        c.user.name.toLowerCase().includes(lowerQ) ||
        c.movie.title.toLowerCase().includes(lowerQ);

      return isViewer && matchSearch;
    });
  }, [comments, query]);

  /* Logic Update Status (Toggle Hidden) */
  const toggleHidden = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const newStatus = !c.is_hidden;
          // Nếu đang mở dialog của chính comment này, cập nhật luôn state dialog
          if (selectedComment?.id === commentId) {
            setSelectedComment({ ...c, is_hidden: newStatus });
          }
          return { ...c, is_hidden: newStatus };
        }
        return c;
      })
    );
  };

  /* Helper: Sentiment Badge */
  const getSentimentBadge = (score: number) => {
    if (score >= 0.3) {
      return (
        <Badge className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border-emerald-600/50">
          Positive ({score})
        </Badge>
      );
    } else if (score <= -0.3) {
      return (
        <Badge className="bg-red-600/20 text-red-400 hover:bg-red-600/30 border-red-600/50">
          Negative ({score})
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-zinc-400 border-zinc-600">
          Neutral ({score})
        </Badge>
      );
    }
  };

  /* Helper: Handle View Detail */
  const handleView = (comment: Comment) => {
    setSelectedComment(comment);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Comments Moderation</h1>
          <p className="text-sm text-zinc-400">
            Review and manage viewer discussions
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <AlertCircle className="size-4" />
          <span>Only showing "Viewer" role</span>
        </div>
      </div>

      {/* ─── Search ─── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder="Search content, user or movie..."
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
              <TableHead className="w-[60px]">Status</TableHead>
              <TableHead className="w-[250px]">User</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead className="w-[180px]">Sentiment</TableHead>
              <TableHead className="hidden md:table-cell text-right">
                Created
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((c) => (
              <TableRow
                key={c.id}
                className="hover:bg-zinc-800/50 border-zinc-800"
              >
                {/* Status Switch (Quick Update) */}
                <TableCell>
                  <Switch
                    checked={!c.is_hidden}
                    onCheckedChange={() => toggleHidden(c.id)}
                    className="data-[state=checked]:bg-teal-600"
                  />
                </TableCell>

                {/* User Info */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={c.user.avatar} />
                      <AvatarFallback className="bg-zinc-800 text-zinc-400">
                        {c.user.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">
                        {c.user.name}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {c.user.email}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Comment Body & Movie Context */}
                <TableCell>
                  <div className="flex flex-col gap-1 max-w-[400px]">
                    <div className="flex items-center gap-2">
                      {c.parent_id && (
                        <Badge
                          variant="secondary"
                          className="h-5 px-1 text-[10px] bg-zinc-800 text-zinc-400"
                        >
                          <CornerDownRight className="mr-1 size-3" /> Reply
                        </Badge>
                      )}
                      <span className="text-xs font-semibold text-teal-400 flex items-center gap-1">
                        <Film className="size-3" /> {c.movie.title}
                      </span>
                    </div>
                    <p
                      className={`text-sm line-clamp-2 ${c.is_hidden ? "text-zinc-600 italic line-through" : "text-zinc-300"}`}
                    >
                      {c.body}
                    </p>
                  </div>
                </TableCell>

                {/* Sentiment */}
                <TableCell>{getSentimentBadge(c.sentiment_score)}</TableCell>

                {/* Date */}
                <TableCell className="hidden md:table-cell text-right text-zinc-400 text-xs">
                  {format(new Date(c.created_at), "MMM dd, yyyy")}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
                    onClick={() => handleView(c)}
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
                  No comments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ─── Detail Dialog ─── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[600px]">
          {selectedComment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Comment Details</span>
                  {selectedComment.is_hidden ? (
                    <Badge
                      variant="destructive"
                      className="bg-red-900/30 text-red-500 border-red-900"
                    >
                      HIDDEN
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-900/30 text-emerald-500 border-emerald-900">
                      VISIBLE
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="text-zinc-500">
                  ID: {selectedComment.id}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* User & Movie Info Block */}
                <div className="flex gap-4 rounded-lg bg-zinc-950/50 border border-zinc-800 p-4">
                  <img
                    src={selectedComment.movie.poster}
                    className="h-24 w-16 rounded object-cover bg-zinc-800"
                  />
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-xs text-zinc-500">Movie</p>
                      <p className="font-semibold text-white">
                        {selectedComment.movie.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Author</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={selectedComment.user.avatar} />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {selectedComment.user.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs text-zinc-500">Sentiment</p>
                    <div>
                      {getSentimentBadge(selectedComment.sentiment_score)}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label className="text-zinc-400">Content</Label>
                  <ScrollArea className="h-[150px] w-full rounded-md border border-zinc-800 bg-zinc-950 p-4">
                    <p className="text-sm leading-relaxed text-zinc-200">
                      {selectedComment.body}
                    </p>
                  </ScrollArea>
                </div>

                {/* Status Toggle in Dialog */}
                <div className="flex items-center justify-between rounded-lg border border-zinc-800 p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Visibility</Label>
                    <p className="text-xs text-zinc-500">
                      {selectedComment.is_hidden
                        ? "This comment is currently hidden from public view."
                        : "This comment is visible to everyone."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${selectedComment.is_hidden ? "text-red-500" : "text-emerald-500"}`}
                    >
                      {selectedComment.is_hidden ? "Hidden" : "Visible"}
                    </span>
                    <Switch
                      checked={!selectedComment.is_hidden}
                      onCheckedChange={() => toggleHidden(selectedComment.id)}
                      className="data-[state=checked]:bg-teal-600"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
