import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import clsx from "clsx";
import { SeasonsAccordion, type Season } from "./SeasonsAccordion";
import type { MovieDetailResponse } from "@/types/movie";
import { useGetMovieReviewsQuery } from "@/features/movie/movieApi";
import type { Review } from "@/types/review";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import defaultAvatar from "@/assets/default-avatar.jpg";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useCreateReviewMutation } from "@/features/review/reviewApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { toast } from "sonner";
import { AuthDialog } from "../auth/AuthDialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../ui/alert-dialog";
import {
  useGetMovieCommentsQuery,
  useCreateCommentMutation,
  useEditCommentMutation,
} from "@/features/comment/commentApi";
import type { Comment } from "@/types/comment";
import { ThreadedComments } from "./ThreadedComments";
import { NavPair } from "./NavPair";
import { useGetMeQuery } from "@/features/user/userApi";
import { Role } from "@/router/role";
import { Link } from "react-router-dom";

type Props = {
  type: "movie" | "tv";
  seasons?: Season[];
  detail: MovieDetailResponse;
  movieId: string;
  onEpisodePlay?: (episodeId: string, videoUrl: string) => void;
  currentEpisodeId?: string;
};
/* ──────────────────────────────────────────────────────────
   Main component
────────────────────────────────────────────────────────── */
export const MovieDetailInfo = ({ type, seasons, detail, movieId, onEpisodePlay, currentEpisodeId }: Props) => {
  // Cast pagination (actors from API)
  const [castPg, setCastPg] = useState(0);
  const CAST_PER = 8;
  const actors = detail.actors || [];
  const castTotal = Math.ceil(actors.length / CAST_PER) || 1;
  const sliceCast = actors.slice(
    castPg * CAST_PER,
    castPg * CAST_PER + CAST_PER
  );

  // Reviews: page-based (like Cast), size = 6
  const [revPage, setRevPage] = useState(0);
  const REV_SIZE = 3;
  const {
    data: reviewsData,
    isLoading: revLoading,
    refetch: refetchReviews,
  } = useGetMovieReviewsQuery(
    { movieId, page: revPage, size: REV_SIZE },
    { skip: !movieId }
  );
  const reviews: Review[] = reviewsData?.content ?? [];
  const totalRevPages = reviewsData?.totalPages ?? 1;

  // Comments (load more pagination)
  const [cmtPage, setCmtPage] = useState(1); // 1-based for API wrapper
  const CMT_SIZE = 10;
  const {
    data: commentsData,
    isFetching: cmtLoading,
    refetch: refetchComments,
  } = useGetMovieCommentsQuery(
    { movieId, page: cmtPage, size: CMT_SIZE },
    { skip: !movieId }
  );
  const comments: Comment[] = commentsData?.content ?? [];
  const [newComment, setNewComment] = useState("");
  const [createComment, { isLoading: creatingComment }] =
    useCreateCommentMutation();
  const [editComment, { isLoading: editingComment }] = useEditCommentMutation();
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyBodies, setReplyBodies] = useState<Record<string, string>>({});
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [editBodies, setEditBodies] = useState<Record<string, string>>({});

  const handleSubmitNewComment = async () => {
    if (!movieId) return;
    if (!isAuth) {
      setPendingCreate(true);
      setAuthOpen(true);
      return;
    }
    const body = newComment.trim();
    if (!body) return;
    try {
      await createComment({ movieId, body }).unwrap();
      setNewComment("");
      setCmtPage(1);
      // Immediately refresh comments so the new one appears
      refetchComments();
    } catch {
      toast.error("Không thể tạo bình luận");
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!movieId) return;
    if (!isAuth) {
      setPendingCreate(true);
      setAuthOpen(true);
      return;
    }
    const body = replyBodies[parentId]?.trim();
    if (!body) return;
    try {
      await createComment({ movieId, body, parentId }).unwrap();
      setReplyBodies((m) => ({ ...m, [parentId]: "" }));
      setActiveReplyId(null);
      setCmtPage(1);
      // Refresh comments list to show the new reply immediately
      refetchComments();
    } catch {
      toast.error("Không thể tạo phản hồi");
    }
  };

  const handleSubmitEdit = async (id: string) => {
    const content = editBodies[id]?.trim();
    if (!content) return;
    try {
      await editComment({ id, body: { content } }).unwrap();
      setActiveEditId(null);
      setEditBodies((m) => ({ ...m, [id]: "" }));
      setCmtPage(1);
      // Refresh comments list to show the edited content immediately
      refetchComments();
    } catch {
      toast.error("Không thể chỉnh sửa bình luận");
    }
  };

  // Auth + Create Review Dialog
  const isAuth = useSelector((s: RootState) => s.auth.isAuth);
  const skipVerify = useSelector((s: RootState) => s.auth.skipVerify);
  const currentUserId = useSelector((s: RootState) => s.auth.id);
  const currentUserRoles: Role[] = useSelector((s: RootState) => s.auth.roles);
  // If auth id is null, try to fetch from getMe API (when logged in)
  const { data: me } = useGetMeQuery(undefined, {
    skip: !isAuth || skipVerify || !!currentUserId,
  });
  const effectiveUserId = currentUserId ?? me?.id ?? null;
  const [authOpen, setAuthOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingCreate, setPendingCreate] = useState(false);
  const [crRating, setCrRating] = useState<number>(5);
  const [crTitle, setCrTitle] = useState("");
  const [crBody, setCrBody] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [createReview, { isLoading: creating }] = useCreateReviewMutation();

  useEffect(() => {
    if (isAuth && pendingCreate) {
      setCreateOpen(true);
      setAuthOpen(false);
      setPendingCreate(false);
    }
  }, [isAuth, pendingCreate]);

  const openCreateFlow = () => {
    if (!isAuth) {
      setPendingCreate(true);
      setAuthOpen(true);
    } else {
      setCreateOpen(true);
    }
  };

  const submitCreate = async () => {
    if (!movieId) return;
    if (crRating < 1 || crRating > 5) {
      toast.error("Điểm đánh giá phải từ 1 đến 5");
      return;
    }
    try {
      await createReview({
        movieId,
        rating: crRating,
        title: crTitle,
        body: crBody,
      }).unwrap();
      toast.success("Đã tạo đánh giá");
      setCreateOpen(false);
      setConfirmOpen(false);
      setCrTitle("");
      setCrBody("");
      setCrRating(5);
      setRevPage(0);
      refetchReviews();
    } catch {
      toast.error("Không thể tạo đánh giá");
    }
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-24 lg:grid-cols-[1fr_280px] mt-8">
      {/* ─────────── LEFT COLUMN ─────────── */}
      <div className="space-y-10">
        {type === "tv" && seasons && <SeasonsAccordion seasons={seasons} onEpisodePlay={onEpisodePlay} currentEpisodeId={currentEpisodeId} />}
        {/* Description */}
        <div className="rounded-lg bg-zinc-900 p-6">
          <h4 className="mb-3 text-sm font-semibold text-zinc-400">
            Mô Tả
          </h4>
          <p className="text-sm leading-relaxed text-zinc-300">
            {detail.description || "Không có mô tả."}
          </p>
        </div>

        {/* Cast */}
        <div className="rounded-lg bg-zinc-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-zinc-400">Diễn Viên</h4>
            <NavPair
              page={castPg}
              total={castTotal}
              prev={() => setCastPg((p) => Math.max(p - 1, 0))}
              next={() => setCastPg((p) => Math.min(p + 1, castTotal - 1))}
            />
          </div>

          <div className="flex gap-8">
            {sliceCast.length === 0 && (
              <span className="text-xs text-zinc-500">Không có dữ liệu diễn viên.</span>
            )}
            {sliceCast.map((c) => (
              <Link
                key={c.id}
                to={`/movie/people/${c.id}`}
                className="flex flex-col items-center w-20 hover:opacity-90"
                title={c.fullName}
              >
                <img
                  src={c.profilePath}
                  alt={c.fullName}
                  className="h-20 w-20 rounded-full object-cover"
                />
                <span className="mt-1 w-full truncate text-[10px] text-center text-zinc-300">
                  {c.fullName}
                </span>
              </Link>
            ))}
          </div>
        </div>
        {/* Overall Rating Summary */}
        <div className="rounded-lg bg-zinc-900 p-6">
          <h4 className="mb-4 text-sm font-semibold text-zinc-400">
            Tổng Quan Đánh Giá
          </h4>
          <div className="flex items-center gap-3">
            <Star className="size-6 fill-red-500 stroke-red-500" />
            <div className="text-white text-lg font-semibold">
              {detail.averageRating?.toFixed(1) ?? "0.0"}
            </div>
            <span className="text-xs text-zinc-400">
              {detail.reviewCount} đánh giá
            </span>
          </div>
        </div>

        {/* Reviews (paged with icon buttons) */}
        <div className="rounded-lg bg-zinc-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-zinc-400">
              Đánh Giá Người Dùng
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 mr-1">
                Trang {revPage + 1} / {Math.max(totalRevPages, 1)}
              </span>
              <button
                type="button"
                onClick={() => setRevPage((p) => Math.max(p - 1, 0))}
                disabled={revPage === 0}
                className={clsx(
                  "grid h-8 w-8 place-items-center rounded-md bg-zinc-800 text-white",
                  revPage === 0 ? "opacity-40" : "hover:bg-zinc-700"
                )}
                aria-label="Trang đánh giá trước"
                title="Trước"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setRevPage((p) =>
                    Math.min(p + 1, Math.max(totalRevPages, 1) - 1)
                  )
                }
                disabled={revPage === Math.max(totalRevPages, 1) - 1}
                className={clsx(
                  "grid h-8 w-8 place-items-center rounded-md bg-zinc-800 text-white",
                  revPage === Math.max(totalRevPages, 1) - 1
                    ? "opacity-40"
                    : "hover:bg-zinc-700"
                )}
                aria-label="Trang đánh giá sau"
                title="Sau"
              >
                <ArrowRight className="size-4" />
              </button>
              <Button size="sm" className="ml-2" onClick={openCreateFlow}>
                Tạo Đánh Giá
              </Button>
            </div>
          </div>

          {revLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-zinc-950 p-4 border border-zinc-800"
                >
                  <div className="h-4 w-24 bg-zinc-800 animate-pulse rounded mb-2" />
                  <div className="h-3 w-40 bg-zinc-800 animate-pulse rounded mb-4" />
                  <div className="h-3 w-full bg-zinc-800 animate-pulse rounded mb-2" />
                  <div className="h-3 w-5/6 bg-zinc-800 animate-pulse rounded" />
                </div>
              ))}
            </div>
          )}

          {!revLoading && reviews.length === 0 && (
            <div className="text-xs text-zinc-500">Chưa có đánh giá nào.</div>
          )}

          {!revLoading && reviews.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-md"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={r.userAvatar || "https://placehold.co/32x32"}
                        alt={r.username}
                      />
                      <AvatarFallback>
                        {r.username?.charAt(0)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {r.username}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="ml-auto inline-flex items-center gap-1 text-sm text-zinc-200">
                      <Star className="size-4 fill-red-500 stroke-red-500" />
                      <span className="font-medium">{r.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  {r.title && (
                    <div className="mb-2 text-base font-medium text-zinc-200">
                      {r.title}
                    </div>
                  )}
                  {r.body && (
                    <p className="text-sm leading-relaxed text-zinc-300">
                      {r.body}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comments (threaded with reply) */}
        <div className="rounded-lg bg-zinc-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-zinc-400">Bình Luận</h4>
            {commentsData && (
              <span className="text-xs text-zinc-500">
                Tổng {commentsData.totalElements ?? 0}
              </span>
            )}
          </div>

          {/* New Comment Form */}
          <div className="mb-6 space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                isAuth ? "Thêm bình luận công khai..." : "Đăng nhập để bình luận"
              }
              className="bg-zinc-800 border-zinc-700 min-h-[120px] text-sm"
              disabled={creatingComment}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={!newComment.trim() || creatingComment}
                onClick={handleSubmitNewComment}
              >
                {creatingComment ? "Đang đăng..." : "Đăng Bình Luận"}
              </Button>
            </div>
          </div>

          {cmtLoading && comments.length === 0 && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-zinc-950 p-4 border border-zinc-800"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded-full bg-zinc-800 animate-pulse" />
                    <div className="h-3 w-28 bg-zinc-800 animate-pulse rounded" />
                  </div>
                  <div className="h-3 w-full bg-zinc-800 animate-pulse rounded mb-2" />
                  <div className="h-3 w-5/6 bg-zinc-800 animate-pulse rounded" />
                </div>
              ))}
            </div>
          )}

          {!cmtLoading && comments.length === 0 && (
            <div className="text-xs text-zinc-500">Chưa có bình luận nào.</div>
          )}

          {comments.length > 0 && (
            <ThreadedComments
              comments={comments}
              hasMore={!commentsData?.last}
              loading={cmtLoading}
              onLoadMore={() => setCmtPage((p) => p + 1)}
              activeReplyId={activeReplyId}
              setActiveReplyId={setActiveReplyId}
              replyBodies={replyBodies}
              setReplyBodies={setReplyBodies}
              onSubmitReply={handleSubmitReply}
              isAuth={isAuth}
              currentUserId={effectiveUserId}
              currentUserRoles={currentUserRoles}
              requestAuth={() => {
                setPendingCreate(true);
                setAuthOpen(true);
              }}
              submittingReply={creatingComment}
              activeEditId={activeEditId}
              setActiveEditId={setActiveEditId}
              editBodies={editBodies}
              setEditBodies={setEditBodies}
              onSubmitEdit={handleSubmitEdit}
              editingComment={editingComment}
            />
          )}
        </div>

        {/* Create Review Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white">
                {detail.title || "Tạo Đánh Giá"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="i-lucide-crown" />
                <span>{detail.averageRating?.toFixed(1) ?? "0.0"}</span>
                <span className="text-zinc-500">
                  / {detail.reviewCount ?? 0} lượt đánh giá
                </span>
              </div>

              {/* Emoticon rating options */}
              <div className="grid grid-cols-5 gap-3">
                {[
                  { value: 5, label: "Tuyệt vời", emoji: "😍" },
                  { value: 4, label: "Phim hay", emoji: "😊" },
                  { value: 3, label: "Khá ổn", emoji: "🙂" },
                  { value: 2, label: "Phim chán", emoji: "🙁" },
                  { value: 1, label: "Dở tệ", emoji: "😱" },
                ].map((opt) => {
                  const active = crRating === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={clsx(
                        "flex flex-col items-center gap-2 rounded-lg px-3 py-3 border transition",
                        active
                          ? "border-teal-500 bg-teal-500/10"
                          : "border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800"
                      )}
                      aria-label={`Chọn ${opt.label}`}
                      onClick={() => setCrRating(opt.value)}
                    >
                      <div
                        className={clsx(
                          "grid h-14 w-14 place-items-center rounded-full text-2xl",
                          active ? "bg-teal-500/20" : "bg-zinc-700/40"
                        )}
                      >
                        {opt.emoji}
                      </div>
                      <span className="text-[12px] text-zinc-200">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Review textarea */}
              <div>
                <Textarea
                  value={crBody}
                  onChange={(e) => setCrBody(e.target.value)}
                  placeholder="Viết nhận xét về phim (tuỳ chọn)"
                  className="bg-zinc-800 border-zinc-700 min-h-[120px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-black"
                onClick={() => setConfirmOpen(true)}
                disabled={creating}
              >
                {creating ? "Gửi..." : "Gửi đánh giá"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setCreateOpen(false)}
                disabled={creating}
              >
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Alert before creating review */}
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Xác Nhận Tạo Đánh Giá</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                Bạn có chắc muốn xuất bản đánh giá này? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="rounded-md border border-zinc-800 p-4 text-sm space-y-2 max-h-60 overflow-y-auto">
              <p>
                <span className="text-zinc-400">Điểm:</span>{" "}
                <span className="font-medium text-red-500">{crRating}</span>
              </p>
              {crTitle && (
                <p>
                  <span className="text-zinc-400">Tiêu đề:</span> {crTitle}
                </p>
              )}
              {crBody && (
                <p className="whitespace-pre-line">
                  <span className="text-zinc-400">Nội dung:</span> {crBody}
                </p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={creating}>Hủy</AlertDialogCancel>
              <AlertDialogAction
                disabled={creating}
                onClick={(e) => {
                  e.preventDefault();
                  submitCreate();
                }}
              >
                {creating ? "Đang xuất bản..." : "Xác Nhận"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Auth Dialog for gating create review */}
        <AuthDialog
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          defaultTab="login"
        />
      </div>

      {/* ─────────── RIGHT SIDEBAR ─────────── */}
      <aside className="space-y-8 rounded-lg bg-zinc-900 p-6">
        {/* Year */}
        <div>
          <h4 className="flex items-center gap-1 text-sm font-semibold text-zinc-400">
            <span className="i-lucide-calendar" /> Năm Phát Hành
          </h4>
          <Link
            to={`/filter?releaseYear=${detail.releaseYear}`}
            className="mt-2 font-medium text-white"
          >
            {detail.releaseYear}
          </Link>
        </div>

        {/* Basic Stats */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-zinc-400">Thống Kê</h4>
          <div className="space-y-2 text-xs text-zinc-300">
            <div className="flex justify-between rounded bg-zinc-800 px-3 py-1.5">
              <span>Chất Lượng</span>
              <span className="font-medium text-white">{detail.quality}</span>
            </div>
            <div className="flex justify-between rounded bg-zinc-800 px-3 py-1.5">
              <span>Thời Lượng</span>
              <span className="font-medium text-white">
                {detail.durationMin} phút
              </span>
            </div>
            <div className="flex justify-between rounded bg-zinc-800 px-3 py-1.5">
              <span>Điểm trung bình</span>
              <span className="font-medium text-white">
                {detail.averageRating?.toFixed(1) ?? "0.0"}
              </span>
            </div>
            <div className="flex justify-between rounded bg-zinc-800 px-3 py-1.5">
              <span>Lượt xem</span>
              <span className="font-medium text-white">{detail.viewCount}</span>
            </div>
          </div>
        </div>

        {/* Genres */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-zinc-400">Thể Loại</h4>
          <div className="flex flex-wrap gap-2">
            {detail.genres.map((g) => (
              <Link
                to={`/filter?genre=${g.id}`}
                key={g.id}
                className="rounded bg-zinc-800 px-3 py-0.5 text-xs text-white cursor-pointer hover:opacity-90"
              >
                {g.name}
              </Link>
            ))}
            {detail.genres.length === 0 && (
              <span className="text-[11px] text-zinc-500">Không có thể loại</span>
            )}
          </div>
        </div>

        {/* Director */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-zinc-400">Đạo Diễn</h4>
          {detail.directors && detail.directors.length > 0 ? (
            detail.directors.slice(0, 1).map((d) => (
              <Link
                key={d.id}
                to={`/movie/people/${d.id}`}
                className="flex items-center gap-3 rounded bg-zinc-800 p-3 cursor-pointer hover:opacity-90"
              >
                <img
                  src={d.profilePath || defaultAvatar}
                  alt={d.fullName}
                  className="h-10 w-10 rounded-md object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-white">{d.fullName}</p>
                  <span className="text-[11px] text-zinc-400">Đạo Diễn</span>
                </div>
              </Link>
            ))
          ) : (
            <span className="text-xs text-zinc-500">Không có dữ liệu đạo diễn</span>
          )}
        </div>
      </aside>
    </div>
  );
};
