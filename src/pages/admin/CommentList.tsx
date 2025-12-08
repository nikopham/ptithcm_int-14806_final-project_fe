import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { Eye, Film, CornerDownRight, AlertCircle } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  useSearchCommentsQuery,
  useToggleCommentHiddenMutation,
} from "@/features/comment/commentApi";
import type { AdminComment } from "@/types/comment";
import { toast } from "sonner";
import defaultAvatar from "@/assets/default-avatar.jpg";

/* ─── Type Definition ─── */
type UserRole = "viewer" | "admin" | "moderator";

// Local comment type for display (mapped from API)
type DisplayComment = {
  id: string;
  parent_id: string | null;
  body: string;
  sentiment_score: number; // Default to 0 if not provided
  is_hidden: boolean;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
  };
  movie: {
    id: string;
    title: string;
    poster: string;
  };
};

export default function CommentList() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [isHiddenFilter, setIsHiddenFilter] = useState<
    "all" | "visible" | "hidden"
  >("all");

  /* Dialog State */
  const [selectedComment, setSelectedComment] = useState<DisplayComment | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // API search params
  const searchParams = useMemo(() => {
    // Ensure page is at least 1 (UI uses 1-based pagination)
    const validPage = page > 0 ? page : 1;
    // Map filter to API boolean or undefined (omit when 'all')
    const isHiddenParam =
      isHiddenFilter === "all"
        ? undefined
        : isHiddenFilter === "hidden"
          ? true
          : false;
    return {
      movieTitle: query || undefined,
      page: validPage,
      size,
      sort: "createdAt,desc",
      isHidden: isHiddenParam,
    };
  }, [query, page, size, isHiddenFilter]);

  const { data, isLoading, isError, refetch } =
    useSearchCommentsQuery(searchParams);
  const [toggleHiddenMutation, { isLoading: isToggling }] =
    useToggleCommentHiddenMutation();

  // Ensure page is always at least 1
  useEffect(() => {
    if (page < 1) {
      setPage(1);
    }
  }, [page]);

  // Sync UI page with backend response (backend uses 0-based, UI uses 1-based)
  useEffect(() => {
    if (data && data.number !== undefined) {
      const expectedUIPage = data.number + 1;
      if (page !== expectedUIPage && expectedUIPage > 0) {
        console.log(
          `Syncing page: UI=${page}, Backend=${data.number}, Expected UI=${expectedUIPage}`
        );
        // Only sync if there's a significant mismatch (more than 1 page off)
        if (Math.abs(page - expectedUIPage) > 1) {
          setPage(expectedUIPage);
        }
      }
    }
  }, [data, page]);

  // Debug: Log search params and response
  console.log("Search params:", searchParams);
  console.log("Current page (UI):", page);
  console.log("API Response:", data);
  console.log("Is Loading:", isLoading);
  console.log("Is Error:", isError);

  // Map API response to display format
  const comments: DisplayComment[] = useMemo(() => {
    // Handle case where data might not be loaded yet or is undefined
    if (!data) {
      console.log("No data object found");
      return [];
    }

    // Handle case where content array doesn't exist or is not an array
    if (!Array.isArray(data.content)) {
      console.log("data.content is not an array. Data:", data);
      return [];
    }

    // Debug: Log the data to see what we're getting
    console.log("API Response - Total items:", data.content.length);
    console.log("API Response - Page info:", {
      number: data.number,
      totalPages: data.totalPages,
      totalElements: data.totalElements,
      empty: data.empty,
      first: data.first,
      last: data.last,
    });

    if (data.content.length === 0) {
      console.log("Content array is empty");
      return [];
    }

    console.log("API Response - First comment:", data.content[0]);
    console.log("First comment userRole:", data.content[0]?.userRole);
    console.log(
      "All userRoles:",
      data.content.map((c) => c.userRole)
    );

    // Do not filter by role; show all comments
    console.log("Showing all comments. Count:", data.content.length);

    return data.content.map((c: AdminComment) => ({
      id: c.id,
      parent_id: c.parentId,
      body: c.body,
      sentiment_score: c.sentimentScore ?? 0, // Default to 0 if not provided
      is_hidden: c.isHidden,
      created_at: c.createdAt,
      user: {
        id: c.userId,
        name: c.username,
        email: "", // API doesn't provide email
        role:
          ((c.userRole?.toLowerCase() === "user"
            ? "viewer"
            : c.userRole?.toLowerCase()) as UserRole) || "viewer",
        avatar: c.userAvatar,
      },
      movie: {
        id: c.movie?.id || "",
        title: c.movie?.title || "Unknown Movie",
        poster: c.movie?.posterUrl || "",
      },
    }));
  }, [data]);

  /* Logic Update Status (Toggle Hidden) */
  const toggleHidden = async (commentId: string) => {
    try {
      const result = await toggleHiddenMutation(commentId).unwrap();
      // Update local state
      if (selectedComment?.id === commentId) {
        setSelectedComment({ ...selectedComment, is_hidden: result.isHidden });
      }
      // Refetch to get updated data
      await refetch();
      toast.success(result.isHidden ? "Đã ẩn bình luận" : "Đã hiển thị bình luận");
    } catch (error) {
      toast.error("Không thể thay đổi trạng thái hiển thị bình luận");
      console.error("Toggle hidden error:", error);
    }
  };

  /* Helper: Sentiment Badge */
  const getSentimentBadge = (score: number) => {
    if (score >= 0.3) {
      return (
        <Badge className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border-emerald-600/50">
          Tích Cực ({score})
        </Badge>
      );
    } else if (score <= -0.3) {
      return (
        <Badge className="bg-red-600/20 text-red-400 hover:bg-red-600/30 border-red-600/50">
          Tiêu Cực ({score})
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-zinc-400 border-zinc-600">
          Trung Tính ({score})
        </Badge>
      );
    }
  };

  /* Helper: Handle View Detail */
  const handleView = (comment: DisplayComment) => {
    setSelectedComment(comment);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản Lý Bình Luận</h1>
          <p className="text-sm text-zinc-400">
            Xem xét và quản lý thảo luận của người xem
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <AlertCircle className="size-4" />
          <span>Hiển thị tất cả bình luận (bao gồm ẩn)</span>
          {data && (
            <span className="ml-2 text-xs">
              (Tổng: {data.totalElements || 0}, Đang hiển thị: {comments.length})
            </span>
          )}
        </div>
      </div>

      {/* ─── Search & Filters ─── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative max-w-sm w-full sm:w-auto">
          <Label className="mb-1 block text-xs text-zinc-500">Tìm Kiếm</Label>
          
          <Input
            placeholder="Tìm kiếm nội dung, người dùng hoặc phim..."
            className="pl-9 bg-zinc-900 border-zinc-700"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Label className="mb-1 block text-xs text-zinc-500">Hiển Thị</Label>
          <Select
            value={isHiddenFilter}
            onValueChange={(v) => setIsHiddenFilter(v as any)}
          >
            <SelectTrigger className="bg-zinc-900 border-zinc-700">
              <SelectValue placeholder="Hiển Thị" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              <SelectItem value="all">Tất Cả</SelectItem>
              <SelectItem value="visible">Hiển Thị</SelectItem>
              <SelectItem value="hidden">Ẩn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-900 overflow-hidden">
        {isLoading && (
          <div className="p-8 text-center text-zinc-400">
            Đang tải bình luận...
          </div>
        )}
        {isError && (
          <div className="p-8 text-center text-red-400">
            Không thể tải bình luận.
          </div>
        )}
        {!isLoading && !isError && (
          <Table>
            <TableHeader className="bg-zinc-950">
              <TableRow className="hover:bg-zinc-900">
                <TableHead className="w-[60px] sm:w-[80px]">Trạng Thái</TableHead>
                <TableHead className="min-w-[150px] sm:min-w-[200px]">Người Dùng</TableHead>
                <TableHead className="min-w-[200px]">Bình Luận</TableHead>
                <TableHead className="hidden md:table-cell min-w-[120px]">Cảm Xúc</TableHead>
                <TableHead className="hidden lg:table-cell text-right min-w-[100px]">
                  Ngày Tạo
                </TableHead>
                <TableHead className="w-[60px] sm:w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.map((c) => (
                <TableRow
                  key={c.id}
                  className="hover:bg-zinc-800/50 border-zinc-800"
                >
                  {/* Status Switch (Quick Update) */}
                  <TableCell className="w-[60px] sm:w-[80px]">
                    <Switch
                      checked={!c.is_hidden}
                      onCheckedChange={() => toggleHidden(c.id)}
                      disabled={isToggling}
                      className="data-[state=checked]:bg-teal-600"
                    />
                  </TableCell>

                  {/* User Info */}
                  <TableCell className="min-w-[150px] sm:min-w-[200px]">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0">
                        <AvatarImage src={c.user.avatar || defaultAvatar} />
                        <AvatarFallback className="bg-zinc-800 text-zinc-400 text-[10px] sm:text-xs">
                          {c.user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm font-medium text-white truncate">
                          {c.user.name}
                        </span>
                        {c.user.email && (
                          <span className="text-[10px] sm:text-xs text-zinc-500 truncate hidden sm:block">
                            {c.user.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Comment Body & Movie Context */}
                  <TableCell className="min-w-[200px]">
                    <div className="flex flex-col gap-1 max-w-[400px]">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        {c.parent_id && (
                          <Badge
                            variant="secondary"
                            className="h-4 sm:h-5 px-1 text-[9px] sm:text-[10px] bg-zinc-800 text-zinc-400"
                          >
                            <CornerDownRight className="mr-0.5 sm:mr-1 size-2.5 sm:size-3" /> Trả Lời
                          </Badge>
                        )}
                        <span className="text-[10px] sm:text-xs font-semibold text-teal-400 flex items-center gap-1">
                          <Film className="size-2.5 sm:size-3" /> <span className="truncate">{c.movie.title}</span>
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm line-clamp-2 text-zinc-300">
                        {c.body}
                      </p>
                    </div>
                  </TableCell>

                  {/* Sentiment - Hidden on mobile */}
                  <TableCell className="hidden md:table-cell min-w-[120px]">
                    {getSentimentBadge(c.sentiment_score)}
                  </TableCell>

                  {/* Date - Hidden on mobile/tablet */}
                  <TableCell className="hidden lg:table-cell text-right text-zinc-400 text-xs min-w-[100px]">
                    {format(new Date(c.created_at), "MMM dd, yyyy")}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="w-[60px] sm:w-[80px]">
                    <Button
                      variant="ghost"
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-zinc-400 hover:text-white"
                      onClick={() => handleView(c)}
                    >
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {comments.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-zinc-500"
                  >
                    Không tìm thấy bình luận nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !isError && data && data.totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={
                    page <= 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-4 text-sm text-zinc-400">
                  Trang {page} / {data.totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  className={
                    page >= data.totalPages
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
          {selectedComment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Chi Tiết Bình Luận</span>
                  {selectedComment.is_hidden ? (
                    <Badge
                      variant="destructive"
                      className="bg-red-900/30 text-red-500 border-red-900"
                    >
                      ĐÃ ẨN
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-900/30 text-emerald-500 border-emerald-900">
                      HIỂN THỊ
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
                  {selectedComment.movie.poster ? (
                    <img
                      src={selectedComment.movie.poster}
                      alt={selectedComment.movie.title}
                      className="h-24 w-16 rounded object-cover bg-zinc-800"
                    />
                  ) : (
                    <div className="h-24 w-16 rounded bg-zinc-800 flex items-center justify-center">
                      <Film className="size-6 text-zinc-600" />
                    </div>
                  )}
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-xs text-zinc-500">Phim</p>
                      <p className="font-semibold text-white">
                        {selectedComment.movie.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Tác Giả</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage
                            src={selectedComment.user.avatar || defaultAvatar}
                          />
                          <AvatarFallback className="bg-zinc-800 text-zinc-400 text-[10px]">
                            {selectedComment.user.name
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
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
                  <Label className="text-zinc-400">Nội Dung</Label>
                  <ScrollArea className="h-[150px] w-full rounded-md border border-zinc-800 bg-zinc-950 p-4">
                    <p className="text-sm leading-relaxed text-zinc-200">
                      {selectedComment.body}
                    </p>
                  </ScrollArea>
                </div>

                {/* Status Toggle in Dialog */}
                <div className="flex items-center justify-between rounded-lg border border-zinc-800 p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Hiển Thị</Label>
                    <p className="text-xs text-zinc-500">
                      {selectedComment.is_hidden
                        ? "Bình luận này hiện đang bị ẩn khỏi công khai."
                        : "Bình luận này hiển thị cho mọi người."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${selectedComment.is_hidden ? "text-red-500" : "text-emerald-500"}`}
                    >
                      {selectedComment.is_hidden ? "Ẩn" : "Hiển Thị"}
                    </span>
                    <Switch
                      checked={!selectedComment.is_hidden}
                      onCheckedChange={() => toggleHidden(selectedComment.id)}
                      disabled={isToggling}
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
                  Đóng
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
