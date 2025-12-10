import { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  Star, 
  FileText, 
  Users, 
  Award, 
  MessageSquare, 
  MessageCircle, 
  Calendar, 
  BarChart3, 
  Tag, 
  Film,
  Edit
} from "lucide-react";
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
import { useCreateReviewMutation, useUpdateReviewMutation } from "@/features/review/reviewApi";
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
      await createComment({ 
        movieId, 
        body,
        episodeId: type === "tv" && currentEpisodeId ? currentEpisodeId : null
      }).unwrap();
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
      await createComment({ 
        movieId, 
        body, 
        parentId,
        episodeId: type === "tv" && currentEpisodeId ? currentEpisodeId : null
      }).unwrap();
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
  
  // Edit Review state
  const [editOpen, setEditOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [updateReview, { isLoading: updating }] = useUpdateReviewMutation();

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

  const openEditReview = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditTitle(review.title || "");
    setEditBody(review.body || "");
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editingReview) return;
    if (editRating < 1 || editRating > 5) {
      toast.error("Điểm đánh giá phải từ 1 đến 5");
      return;
    }
    try {
      await updateReview({
        id: editingReview.id,
        body: {
          movieId: editingReview.movieId,
          rating: editRating,
          title: editTitle,
          body: editBody,
        },
      }).unwrap();
      toast.success("Đã cập nhật đánh giá");
      setEditOpen(false);
      setEditConfirmOpen(false);
      setEditingReview(null);
      setEditTitle("");
      setEditBody("");
      setEditRating(5);
      refetchReviews();
    } catch {
      toast.error("Không thể cập nhật đánh giá");
    }
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-24 lg:grid-cols-[1fr_280px] mt-8">
      {/* ─────────── LEFT COLUMN ─────────── */}
      <div className="space-y-10">
        {type === "tv" && seasons && <SeasonsAccordion seasons={seasons} onEpisodePlay={onEpisodePlay} currentEpisodeId={currentEpisodeId} />}
        {/* Description */}
        <div className="rounded-xl bg-white border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: "#C40E61" }}>
              <FileText className="size-5 text-white" />
            </div>
            <h4 className="text-base font-bold text-gray-900">
              Mô Tả
            </h4>
          </div>
          <p className="text-sm leading-relaxed text-gray-600 pl-14">
            {detail.description || "Không có mô tả."}
          </p>
        </div>

        {/* Cast */}
        <div className="rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: "#C40E61" }}>
                <Users className="size-5 text-white" />
              </div>
              <h4 className="text-base font-bold text-gray-900">Diễn Viên</h4>
            </div>
            <NavPair
              page={castPg}
              total={castTotal}
              prev={() => setCastPg((p) => Math.max(p - 1, 0))}
              next={() => setCastPg((p) => Math.min(p + 1, castTotal - 1))}
            />
          </div>

          <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
            {sliceCast.length === 0 && (
              <span className="text-xs text-gray-500">Không có dữ liệu diễn viên.</span>
            )}
            {sliceCast.map((c) => (
              <Link
                key={c.id}
                to={`/movie/people/${c.id}`}
                className="flex flex-col items-center w-20 group transition-transform duration-200 hover:scale-105"
                title={c.fullName}
              >
                <div className="relative">
                  <img
                    src={c.profilePath}
                    alt={c.fullName}
                    className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 group-hover:border-[#C40E61] transition-colors duration-200 shadow-md"
                  />
                  <div className="absolute inset-0 rounded-full bg-[#C40E61]/0 group-hover:bg-[#C40E61]/10 transition-colors duration-200" />
                </div>
                <span className="mt-2 w-full truncate text-xs text-center text-gray-600 font-medium group-hover:text-[#C40E61] transition-colors duration-200">
                  {c.fullName}
                </span>
              </Link>
            ))}
          </div>
        </div>
        {/* Overall Rating Summary */}
        <div className="rounded-xl bg-gradient-to-br from-[#C40E61]/5 via-white to-gray-50 border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg" style={{ backgroundColor: "#C40E61" }}>
              <Award className="size-5 text-white" />
            </div>
            <h4 className="text-base font-bold text-gray-900">
              Tổng Quan Đánh Giá
            </h4>
          </div>
          <div className="flex items-center gap-4 pl-10">
            <div className="p-3 rounded-full bg-white shadow-md border border-gray-200">
              <Star className="size-7" style={{ fill: "#C40E61", stroke: "#C40E61" }} />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {detail.averageRating?.toFixed(1) ?? "0.0"}
              </div>
              <span className="text-sm text-gray-600 font-medium">
                / 5.0 • {detail.reviewCount} đánh giá
              </span>
            </div>
          </div>
        </div>

        {/* Reviews (paged with icon buttons) */}
        <div className="rounded-xl bg-white border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: "#C40E61" }}>
                <MessageSquare className="size-5 text-white" />
              </div>
              <h4 className="text-base font-bold text-gray-900">
                Đánh Giá Người Dùng
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 mr-1">
                Trang {revPage + 1} / {Math.max(totalRevPages, 1)}
              </span>
              <button
                type="button"
                onClick={() => setRevPage((p) => Math.max(p - 1, 0))}
                disabled={revPage === 0}
                className={clsx(
                  "grid h-8 w-8 place-items-center rounded-md text-white transition",
                  revPage === 0 ? "opacity-40 cursor-not-allowed bg-gray-300" : "hover:opacity-90"
                )}
                style={revPage !== 0 ? { backgroundColor: "#C40E61" } : undefined}
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
                  "grid h-8 w-8 place-items-center rounded-md text-white transition",
                  revPage === Math.max(totalRevPages, 1) - 1
                    ? "opacity-40 cursor-not-allowed bg-gray-300"
                    : "hover:opacity-90"
                )}
                style={revPage !== Math.max(totalRevPages, 1) - 1 ? { backgroundColor: "#C40E61" } : undefined}
                aria-label="Trang đánh giá sau"
                title="Sau"
              >
                <ArrowRight className="size-4" />
              </button>
              <Button size="sm" className="ml-2 text-white" style={{ backgroundColor: "#C40E61" }} onClick={openCreateFlow}>
                Tạo Đánh Giá
              </Button>
            </div>
          </div>

          {revLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-white p-4 border border-gray-300"
                >
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-2" />
                  <div className="h-3 w-40 bg-gray-200 animate-pulse rounded mb-4" />
                  <div className="h-3 w-full bg-gray-200 animate-pulse rounded mb-2" />
                  <div className="h-3 w-5/6 bg-gray-200 animate-pulse rounded" />
                </div>
              ))}
            </div>
          )}

          {!revLoading && reviews.length === 0 && (
            <div className="text-xs text-gray-500">Chưa có đánh giá nào.</div>
          )}

          {!revLoading && reviews.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-gray-200 shadow-md">
                      <AvatarImage
                        src={r.userAvatar || "https://placehold.co/32x32"}
                        alt={r.username}
                      />
                      <AvatarFallback className="bg-gray-100 text-gray-600">
                        {r.username?.charAt(0)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-900 truncate">
                        {r.username}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#C40E61]/10">
                        <Star className="size-4" style={{ fill: "#C40E61", stroke: "#C40E61" }} />
                        <span className="text-sm font-bold" style={{ color: "#C40E61" }}>{r.rating.toFixed(1)}</span>
                      </div>
                      {effectiveUserId && r.userId === effectiveUserId && (
                        <button
                          type="button"
                          onClick={() => openEditReview(r)}
                          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                          title="Sửa đánh giá"
                          aria-label="Sửa đánh giá"
                        >
                          <Edit className="size-4 text-gray-600 hover:text-[#C40E61] transition-colors" />
                        </button>
                      )}
                    </div>
                  </div>
                  {r.title && (
                    <div className="mb-3 text-base font-bold" style={{ color: "#C40E61" }}>
                      {r.title}
                    </div>
                  )}
                  {r.body && (
                    <p className="text-sm leading-relaxed text-gray-600 line-clamp-4">
                      {r.body}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comments (threaded with reply) */}
        <div className="rounded-xl bg-white border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: "#C40E61" }}>
                <MessageCircle className="size-5 text-white" />
              </div>
              <h4 className="text-base font-bold text-gray-900">Bình Luận</h4>
            </div>
            {commentsData && (
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                Tổng {commentsData.totalElements ?? 0}
              </span>
            )}
          </div>

          {/* New Comment Form */}
          <div className="mb-6 space-y-4 p-4 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-200">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                isAuth ? "Thêm bình luận công khai..." : "Đăng nhập để bình luận"
              }
              className="bg-white border-gray-300 min-h-[120px] text-sm text-gray-900 focus:border-[#C40E61] focus:ring-[#C40E61]"
              disabled={creatingComment}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={!newComment.trim() || creatingComment}
                onClick={handleSubmitNewComment}
                className="text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                style={{ backgroundColor: "#C40E61" }}
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
                  className="rounded-lg bg-white p-4 border border-gray-300"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-3 w-28 bg-gray-200 animate-pulse rounded" />
                  </div>
                  <div className="h-3 w-full bg-gray-200 animate-pulse rounded mb-2" />
                  <div className="h-3 w-5/6 bg-gray-200 animate-pulse rounded" />
                </div>
              ))}
            </div>
          )}

          {!cmtLoading && comments.length === 0 && (
            <div className="text-xs text-gray-500">Chưa có bình luận nào.</div>
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
          <DialogContent className="bg-white border-gray-300 text-gray-900 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                {detail.title || "Tạo Đánh Giá"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="i-lucide-crown" />
                <span>{detail.averageRating?.toFixed(1) ?? "0.0"}</span>
                <span className="text-gray-500">
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
                          ? "border-[#C40E61] bg-[#C40E61]/10"
                          : "border-gray-300 bg-gray-100 hover:bg-gray-200"
                      )}
                      aria-label={`Chọn ${opt.label}`}
                      onClick={() => setCrRating(opt.value)}
                    >
                      <div
                        className={clsx(
                          "grid h-14 w-14 place-items-center rounded-full text-2xl",
                          active ? "bg-[#C40E61]/20" : "bg-gray-200"
                        )}
                      >
                        {opt.emoji}
                      </div>
                      <span className="text-[12px] text-gray-700">
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
                  className="bg-white border-gray-300 min-h-[120px] text-gray-900"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                className="text-white hover:opacity-90"
                style={{ backgroundColor: "#C40E61" }}
                onClick={() => setConfirmOpen(true)}
                disabled={creating}
              >
                {creating ? "Gửi..." : "Gửi đánh giá"}
              </Button>
              <Button
                variant="secondary"
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
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
          <AlertDialogContent className="bg-white border-gray-300 text-gray-900">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900">Xác Nhận Tạo Đánh Giá</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Bạn có chắc muốn xuất bản đánh giá này? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="rounded-md border border-gray-300 p-4 text-sm space-y-2 max-h-60 overflow-y-auto">
              <p>
                <span className="text-gray-500">Điểm:</span>{" "}
                <span className="font-medium" style={{ color: "#C40E61" }}>{crRating}</span>
              </p>
              {crTitle && (
                <p>
                  <span className="text-gray-500">Tiêu đề:</span> {crTitle}
                </p>
              )}
              {crBody && (
                <p className="whitespace-pre-line">
                  <span className="text-gray-500">Nội dung:</span> {crBody}
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

        {/* Edit Review Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="bg-white border-gray-300 text-gray-900 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                Sửa Đánh Giá
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="i-lucide-crown" />
                <span>{detail.averageRating?.toFixed(1) ?? "0.0"}</span>
                <span className="text-gray-500">
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
                  const active = editRating === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={clsx(
                        "flex flex-col items-center gap-2 rounded-lg px-3 py-3 border transition",
                        active
                          ? "border-[#C40E61] bg-[#C40E61]/10"
                          : "border-gray-300 bg-gray-100 hover:bg-gray-200"
                      )}
                      aria-label={`Chọn ${opt.label}`}
                      onClick={() => setEditRating(opt.value)}
                    >
                      <div
                        className={clsx(
                          "grid h-14 w-14 place-items-center rounded-full text-2xl",
                          active ? "bg-[#C40E61]/20" : "bg-gray-200"
                        )}
                      >
                        {opt.emoji}
                      </div>
                      <span className="text-[12px] text-gray-700">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Review textarea */}
              <div>
                <Textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  placeholder="Viết nhận xét về phim (tuỳ chọn)"
                  className="bg-white border-gray-300 min-h-[120px] text-gray-900"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                className="text-white hover:opacity-90"
                style={{ backgroundColor: "#C40E61" }}
                onClick={() => setEditConfirmOpen(true)}
                disabled={updating}
              >
                {updating ? "Đang cập nhật..." : "Cập nhật đánh giá"}
              </Button>
              <Button
                variant="secondary"
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => setEditOpen(false)}
                disabled={updating}
              >
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Alert before updating review */}
        <AlertDialog open={editConfirmOpen} onOpenChange={setEditConfirmOpen}>
          <AlertDialogContent className="bg-white border-gray-300 text-gray-900">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900">Xác Nhận Cập Nhật Đánh Giá</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                Bạn có chắc muốn cập nhật đánh giá này? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="rounded-md border border-gray-300 p-4 text-sm space-y-2 max-h-60 overflow-y-auto">
              <p>
                <span className="text-gray-500">Điểm:</span>{" "}
                <span className="font-medium" style={{ color: "#C40E61" }}>{editRating}</span>
              </p>
              {editTitle && (
                <p>
                  <span className="text-gray-500">Tiêu đề:</span> {editTitle}
                </p>
              )}
              {editBody && (
                <p className="whitespace-pre-line">
                  <span className="text-gray-500">Nội dung:</span> {editBody}
                </p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={updating}>Hủy</AlertDialogCancel>
              <AlertDialogAction
                disabled={updating}
                onClick={(e) => {
                  e.preventDefault();
                  submitEdit();
                }}
              >
                {updating ? "Đang cập nhật..." : "Xác Nhận"}
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
      <aside className="space-y-6 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 p-6 shadow-sm sticky top-4">
        {/* Year */}
        <div className="pb-4 border-b border-gray-200">
          <h4 className="flex items-center gap-3 text-sm font-bold text-gray-900 mb-3">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: "#C40E61" }}>
              <Calendar className="size-4 text-white" />
            </div>
            Năm Phát Hành
          </h4>
          <Link
            to={`/filter?releaseYear=${detail.releaseYear}`}
            className="inline-block mt-2 px-4 py-2 rounded-lg bg-white border border-gray-200 font-bold text-lg hover:border-[#C40E61] hover:text-[#C40E61] transition-all duration-200 shadow-sm hover:shadow-md"
            style={{ color: "#C40E61" }}
          >
            {detail.releaseYear}
          </Link>
        </div>

        {/* Basic Stats */}
        <div className="pb-4 border-b border-gray-200">
          <h4 className="mb-4 flex items-center gap-3 text-sm font-bold text-gray-900">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: "#C40E61" }}>
              <BarChart3 className="size-4 text-white" />
            </div>
            Thống Kê
          </h4>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center rounded-lg bg-white border border-gray-200 px-4 py-3 shadow-sm hover:shadow-md transition-shadow duration-200">
              <span className="text-xs font-medium text-gray-600">Chất Lượng</span>
              <span className="font-bold text-gray-900">{detail.quality}</span>
            </div>
            <div className="flex justify-between items-center rounded-lg bg-white border border-gray-200 px-4 py-3 shadow-sm hover:shadow-md transition-shadow duration-200">
              <span className="text-xs font-medium text-gray-600">Thời Lượng</span>
              <span className="font-bold text-gray-900">
                {detail.durationMin} phút
              </span>
            </div>
            <div className="flex justify-between items-center rounded-lg bg-white border border-gray-200 px-4 py-3 shadow-sm hover:shadow-md transition-shadow duration-200">
              <span className="text-xs font-medium text-gray-600">Điểm trung bình</span>
              <span className="font-bold text-gray-900">
                {detail.averageRating?.toFixed(1) ?? "0.0"}
              </span>
            </div>
            <div className="flex justify-between items-center rounded-lg bg-white border border-gray-200 px-4 py-3 shadow-sm hover:shadow-md transition-shadow duration-200">
              <span className="text-xs font-medium text-gray-600">Lượt xem</span>
              <span className="font-bold text-gray-900">{detail.viewCount}</span>
            </div>
          </div>
        </div>

        {/* Genres */}
        <div className="pb-4 border-b border-gray-200">
          <h4 className="mb-4 flex items-center gap-3 text-sm font-bold text-gray-900">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: "#C40E61" }}>
              <Tag className="size-4 text-white" />
            </div>
            Thể Loại
          </h4>
          <div className="flex flex-wrap gap-2">
            {detail.genres.map((g) => (
              <Link
                to={`/filter?genre=${g.id}`}
                key={g.id}
                className="rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 cursor-pointer hover:border-[#C40E61] hover:text-[#C40E61] hover:bg-[#C40E61]/5 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {g.name}
              </Link>
            ))}
            {detail.genres.length === 0 && (
              <span className="text-xs text-gray-500">Không có thể loại</span>
            )}
          </div>
        </div>

        {/* Director */}
        <div>
          <h4 className="mb-4 flex items-center gap-3 text-sm font-bold text-gray-900">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: "#C40E61" }}>
              <Film className="size-4 text-white" />
            </div>
            Đạo Diễn
          </h4>
          {detail.directors && detail.directors.length > 0 ? (
            detail.directors.slice(0, 1).map((d) => (
              <Link
                key={d.id}
                to={`/movie/people/${d.id}`}
                className="flex items-center gap-3 rounded-lg bg-white border border-gray-200 p-4 cursor-pointer hover:border-[#C40E61] hover:shadow-md transition-all duration-200 shadow-sm group"
              >
                <img
                  src={d.profilePath || defaultAvatar}
                  alt={d.fullName}
                  className="h-12 w-12 rounded-lg object-cover border-2 border-gray-200 group-hover:border-[#C40E61] transition-colors duration-200"
                />
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-[#C40E61] transition-colors duration-200">{d.fullName}</p>
                  <span className="text-xs text-gray-500">Đạo Diễn</span>
                </div>
              </Link>
            ))
          ) : (
            <span className="text-xs text-gray-500">Không có dữ liệu đạo diễn</span>
          )}
        </div>
      </aside>
    </div>
  );
};
