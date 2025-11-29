import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import clsx from "clsx";
import { SeasonsAccordion, type Season } from "./SeasonsAccordion";
import type { MovieDetailResponse } from "@/types/movie";
import { useGetMovieReviewsQuery } from "@/features/movie/movieApi";
import type { Review } from "@/types/review";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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

/* ──────────────────────────────────────────────────────────
   Types & demo data – swap with real API
────────────────────────────────────────────────────────── */
// All placeholder mock data removed – now powered by API detail

/* ──────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────── */
const NavPair = ({
  page,
  total,
  prev,
  next,
}: {
  page: number;
  total: number;
  prev: () => void;
  next: () => void;
}) => (
  <div className="flex items-center gap-3">
    <button
      onClick={prev}
      disabled={page === 0}
      className={clsx(
        "grid h-8 w-8 place-items-center rounded-md bg-zinc-800 text-white",
        page === 0 ? "opacity-40" : "hover:bg-zinc-700"
      )}
    >
      <ArrowLeft className="size-4" />
    </button>
    {Array.from({ length: total }).map((_, i) => (
      <span
        key={i}
        className={clsx(
          "h-1 w-5 rounded-full",
          i === page ? "bg-red-500" : "bg-zinc-600"
        )}
      />
    ))}
    <button
      onClick={next}
      disabled={page === total - 1}
      className={clsx(
        "grid h-8 w-8 place-items-center rounded-md bg-zinc-800 text-white",
        page === total - 1 ? "opacity-40" : "hover:bg-zinc-700"
      )}
    >
      <ArrowRight className="size-4" />
    </button>
  </div>
);

type Props = {
  type: "movie" | "tv";
  seasons?: Season[];
  detail: MovieDetailResponse;
  movieId: string;
};
/* ──────────────────────────────────────────────────────────
   Main component
────────────────────────────────────────────────────────── */
export const MovieDetailInfo = ({ type, seasons, detail, movieId }: Props) => {
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
  const { data: commentsData, isFetching: cmtLoading } =
    useGetMovieCommentsQuery(
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
    } catch {
      toast.error("Failed to create comment");
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
    } catch {
      toast.error("Failed to create reply");
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
    } catch {
      toast.error("Failed to edit comment");
    }
  };

  // Auth + Create Review Dialog
  const isAuth = useSelector((s: RootState) => s.auth.isAuth);
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
      toast.error("Rating must be between 1 and 5");
      return;
    }
    try {
      await createReview({
        movieId,
        rating: crRating,
        title: crTitle,
        body: crBody,
      }).unwrap();
      toast.success("Review created");
      setCreateOpen(false);
      setConfirmOpen(false);
      setCrTitle("");
      setCrBody("");
      setCrRating(5);
      setRevPage(0);
      refetchReviews();
    } catch {
      toast.error("Failed to create review");
    }
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-24 lg:grid-cols-[1fr_280px] mt-8">
      {/* ─────────── LEFT COLUMN ─────────── */}
      <div className="space-y-10">
        {type === "tv" && seasons && <SeasonsAccordion seasons={seasons} />}
        {/* Description */}
        <div className="rounded-lg bg-zinc-900 p-6">
          <h4 className="mb-3 text-sm font-semibold text-zinc-400">
            Description
          </h4>
          <p className="text-sm leading-relaxed text-zinc-300">
            {detail.description || "No description available."}
          </p>
        </div>

        {/* Cast */}
        <div className="rounded-lg bg-zinc-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-zinc-400">Cast</h4>
            <NavPair
              page={castPg}
              total={castTotal}
              prev={() => setCastPg((p) => Math.max(p - 1, 0))}
              next={() => setCastPg((p) => Math.min(p + 1, castTotal - 1))}
            />
          </div>

          <div className="flex gap-8">
            {sliceCast.length === 0 && (
              <span className="text-xs text-zinc-500">No cast data.</span>
            )}
            {sliceCast.map((c) => (
              <div key={c.id} className="flex flex-col items-center w-20">
                <img
                  src={c.profilePath}
                  alt={c.fullName}
                  title={c.fullName}
                  className="h-20 w-20 rounded-full object-cover"
                />
                <span className="mt-1 w-full truncate text-[10px] text-center text-zinc-300">
                  {c.fullName}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Overall Rating Summary */}
        <div className="rounded-lg bg-zinc-900 p-6">
          <h4 className="mb-4 text-sm font-semibold text-zinc-400">
            Rating Summary
          </h4>
          <div className="flex items-center gap-3">
            <Star className="size-6 fill-red-500 stroke-red-500" />
            <div className="text-white text-lg font-semibold">
              {detail.averageRating?.toFixed(1) ?? "0.0"}
            </div>
            <span className="text-xs text-zinc-400">
              {detail.reviewCount} reviews
            </span>
          </div>
        </div>

        {/* Reviews (paged with icon buttons) */}
        <div className="rounded-lg bg-zinc-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-zinc-400">
              User Reviews
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 mr-1">
                Page {revPage + 1} of {Math.max(totalRevPages, 1)}
              </span>
              <button
                type="button"
                onClick={() => setRevPage((p) => Math.max(p - 1, 0))}
                disabled={revPage === 0}
                className={clsx(
                  "grid h-8 w-8 place-items-center rounded-md bg-zinc-800 text-white",
                  revPage === 0 ? "opacity-40" : "hover:bg-zinc-700"
                )}
                aria-label="Previous reviews page"
                title="Previous"
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
                aria-label="Next reviews page"
                title="Next"
              >
                <ArrowRight className="size-4" />
              </button>
              <Button size="sm" className="ml-2" onClick={openCreateFlow}>
                Create Review
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
            <div className="text-xs text-zinc-500">No reviews yet.</div>
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
            <h4 className="text-sm font-semibold text-zinc-400">Comments</h4>
            {commentsData && (
              <span className="text-xs text-zinc-500">
                Total {commentsData.totalElements ?? 0}
              </span>
            )}
          </div>

          {/* New Comment Form */}
          <div className="mb-6 space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                isAuth ? "Add a public comment..." : "Login to comment"
              }
              className="bg-zinc-800 border-zinc-700 min-h-[120px] text-sm"
              disabled={!isAuth || creatingComment}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={!newComment.trim() || creatingComment}
                onClick={handleSubmitNewComment}
              >
                {creatingComment ? "Posting..." : "Post Comment"}
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
            <div className="text-xs text-zinc-500">No comments yet.</div>
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
              <DialogTitle>Create Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <label className="text-sm text-zinc-300">Rating (1-5)</label>
                <div className="sm:col-span-2">
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    step={1}
                    value={crRating}
                    onChange={(e) => setCrRating(Number(e.target.value))}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <label className="text-sm text-zinc-300">Title</label>
                <div className="sm:col-span-2">
                  <Input
                    value={crTitle}
                    onChange={(e) => setCrTitle(e.target.value)}
                    placeholder="Optional title"
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                <label className="text-sm text-zinc-300 mt-2">Review</label>
                <div className="sm:col-span-2">
                  <Textarea
                    value={crBody}
                    onChange={(e) => setCrBody(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="bg-zinc-800 border-zinc-700 min-h-[120px]"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setCreateOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button onClick={() => setConfirmOpen(true)} disabled={creating}>
                {creating ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Alert before creating review */}
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Create Review</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                Are you sure you want to publish this review? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="rounded-md border border-zinc-800 p-4 text-sm space-y-2 max-h-60 overflow-y-auto">
              <p>
                <span className="text-zinc-400">Rating:</span>{" "}
                <span className="font-medium text-red-500">{crRating}</span>
              </p>
              {crTitle && (
                <p>
                  <span className="text-zinc-400">Title:</span> {crTitle}
                </p>
              )}
              {crBody && (
                <p className="whitespace-pre-line">
                  <span className="text-zinc-400">Body:</span> {crBody}
                </p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={creating}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={creating}
                onClick={(e) => {
                  e.preventDefault();
                  submitCreate();
                }}
              >
                {creating ? "Publishing..." : "Confirm"}
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
            <span className="i-lucide-calendar" /> Released Year
          </h4>
          <p className="mt-2 font-medium text-white">{detail.releaseYear}</p>
        </div>

        {/* Basic Stats */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-zinc-400">Stats</h4>
          <div className="space-y-2 text-xs text-zinc-300">
            <div className="flex justify-between rounded bg-zinc-800 px-3 py-1.5">
              <span>Quality</span>
              <span className="font-medium text-white">{detail.quality}</span>
            </div>
            <div className="flex justify-between rounded bg-zinc-800 px-3 py-1.5">
              <span>Duration</span>
              <span className="font-medium text-white">
                {detail.durationMin} min
              </span>
            </div>
            <div className="flex justify-between rounded bg-zinc-800 px-3 py-1.5">
              <span>Average rating</span>
              <span className="font-medium text-white">
                {detail.averageRating?.toFixed(1) ?? "0.0"}
              </span>
            </div>
            <div className="flex justify-between rounded bg-zinc-800 px-3 py-1.5">
              <span>Views</span>
              <span className="font-medium text-white">{detail.viewCount}</span>
            </div>
          </div>
        </div>

        {/* Genres */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-zinc-400">Genres</h4>
          <div className="flex flex-wrap gap-2">
            {detail.genres.map((g) => (
              <span
                key={g.id}
                className="rounded bg-zinc-800 px-3 py-0.5 text-xs text-white"
              >
                {g.name}
              </span>
            ))}
            {detail.genres.length === 0 && (
              <span className="text-[11px] text-zinc-500">No genres</span>
            )}
          </div>
        </div>

        {/* Director */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-zinc-400">Director</h4>
          {detail.directors && detail.directors.length > 0 ? (
            detail.directors.slice(0, 1).map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-3 rounded bg-zinc-800 p-3"
              >
                <img
                  src={d.profilePath}
                  alt={d.fullName}
                  className="h-10 w-10 rounded-md object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-white">{d.fullName}</p>
                  <span className="text-[11px] text-zinc-400">Director</span>
                </div>
              </div>
            ))
          ) : (
            <span className="text-xs text-zinc-500">No director data</span>
          )}
        </div>
      </aside>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   Threaded Comments Component
   (Parent comments with inline nested replies)
────────────────────────────────────────────────────────── */
const ThreadedComments = ({
  comments,
  hasMore,
  loading,
  onLoadMore,
  activeReplyId,
  setActiveReplyId,
  replyBodies,
  setReplyBodies,
  onSubmitReply,
  isAuth,
  requestAuth,
  submittingReply,
  activeEditId,
  setActiveEditId,
  editBodies,
  setEditBodies,
  onSubmitEdit,
  editingComment,
}: {
  comments: Comment[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  activeReplyId: string | null;
  setActiveReplyId: (id: string | null) => void;
  replyBodies: Record<string, string>;
  setReplyBodies: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSubmitReply: (parentId: string) => void;
  isAuth: boolean;
  requestAuth: () => void;
  submittingReply: boolean;
  activeEditId: string | null;
  setActiveEditId: (id: string | null) => void;
  editBodies: Record<string, string>;
  setEditBodies: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSubmitEdit: (id: string) => void;
  editingComment: boolean;
}) => {
  const parents = comments.filter((c) => !c.parentId);
  const repliesMap: Record<string, Comment[]> = {};
  for (const c of comments) {
    if (c.parentId) {
      if (!repliesMap[c.parentId]) repliesMap[c.parentId] = [];
      repliesMap[c.parentId].push(c);
    }
  }

  return (
    <div className="space-y-4">
      {parents.map((p) => (
        <div key={p.id} className="space-y-2">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-4">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    p.userAvatar ||
                    "https://via.placeholder.com/32x32.png?text=?"
                  }
                  alt={p.username}
                  className="h-8 w-8 rounded-full object-cover"
                  loading="lazy"
                />
                <div>
                  <p className="text-sm font-medium text-white">{p.username}</p>
                  <p className="text-[10px] text-zinc-400">
                    {new Date(p.createdAt).toLocaleString()}{" "}
                    {p.isEdited ? "· edited" : ""}
                  </p>
                </div>
              </div>
              {typeof p.replyCount === "number" && p.replyCount > 0 && (
                <span className="text-[10px] text-zinc-400">
                  {p.replyCount} repl{p.replyCount === 1 ? "y" : "ies"}
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-300 whitespace-pre-wrap">
              {p.body}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[11px] border-zinc-700"
                onClick={() => {
                  if (!isAuth) {
                    requestAuth();
                    return;
                  }
                  setActiveReplyId(activeReplyId === p.id ? null : p.id);
                }}
              >
                {activeReplyId === p.id ? "Cancel" : "Reply"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[11px] border-zinc-700"
                onClick={() => {
                  if (!isAuth) {
                    requestAuth();
                    return;
                  }
                  setActiveEditId(activeEditId === p.id ? null : p.id);
                  if (!editBodies[p.id])
                    setEditBodies((m) => ({ ...m, [p.id]: p.body }));
                }}
              >
                {activeEditId === p.id ? "Cancel" : "Edit"}
              </Button>
            </div>
            {activeEditId === p.id && (
              <div className="space-y-2">
                <Textarea
                  value={editBodies[p.id] || ""}
                  onChange={(e) =>
                    setEditBodies((m) => ({ ...m, [p.id]: e.target.value }))
                  }
                  placeholder="Edit your comment..."
                  className="bg-zinc-800 border-zinc-700 min-h-20 text-xs"
                  disabled={editingComment}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-[11px] border-zinc-700"
                    onClick={() => setActiveEditId(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={!editBodies[p.id]?.trim() || editingComment}
                    onClick={() => onSubmitEdit(p.id)}
                  >
                    {editingComment ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            )}
            {activeReplyId === p.id && (
              <div className="space-y-2">
                <Textarea
                  value={replyBodies[p.id] || ""}
                  onChange={(e) =>
                    setReplyBodies((m) => ({ ...m, [p.id]: e.target.value }))
                  }
                  placeholder="Write a reply..."
                  className="bg-zinc-800 border-zinc-700 min-h-20 text-xs"
                  disabled={submittingReply}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    disabled={!replyBodies[p.id]?.trim() || submittingReply}
                    onClick={() => onSubmitReply(p.id)}
                  >
                    {submittingReply ? "Posting..." : "Post Reply"}
                  </Button>
                </div>
              </div>
            )}
          </div>
          {repliesMap[p.id] && (
            <div className="ml-6 space-y-2 border-l border-zinc-800 pl-4">
              {repliesMap[p.id]
                .sort(
                  (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                )
                .map((r) => (
                  <div
                    key={r.id}
                    className="rounded-md border border-zinc-800 bg-zinc-950/80 p-3"
                  >
                    <div className="mb-1 flex items-start gap-3">
                      <img
                        src={
                          r.userAvatar ||
                          "https://via.placeholder.com/28x28.png?text=?"
                        }
                        alt={r.username}
                        className="h-7 w-7 rounded-full object-cover"
                        loading="lazy"
                      />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-white">
                          {r.username}
                          <span className="ml-1 text-[10px] text-zinc-400">
                            {new Date(r.createdAt).toLocaleString()}{" "}
                            {r.isEdited ? "· edited" : ""}
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-zinc-300 whitespace-pre-wrap">
                          {r.body}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[11px] border-zinc-700"
                            onClick={() => {
                              if (!isAuth) {
                                requestAuth();
                                return;
                              }
                              setActiveReplyId(
                                activeReplyId === r.id ? null : r.id
                              );
                            }}
                          >
                            {activeReplyId === r.id ? "Cancel" : "Reply"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[11px] border-zinc-700"
                            onClick={() => {
                              if (!isAuth) {
                                requestAuth();
                                return;
                              }
                              setActiveEditId(
                                activeEditId === r.id ? null : r.id
                              );
                              if (!editBodies[r.id])
                                setEditBodies((m) => ({
                                  ...m,
                                  [r.id]: r.body,
                                }));
                            }}
                          >
                            {activeEditId === r.id ? "Cancel" : "Edit"}
                          </Button>
                        </div>
                        {activeReplyId === r.id && (
                          <div className="mt-2 space-y-2">
                            <Textarea
                              value={replyBodies[r.id] || ""}
                              onChange={(e) =>
                                setReplyBodies((m) => ({
                                  ...m,
                                  [r.id]: e.target.value,
                                }))
                              }
                              placeholder="Write a reply..."
                              className="bg-zinc-800 border-zinc-700 min-h-20 text-xs"
                              disabled={submittingReply}
                            />
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                disabled={
                                  !replyBodies[r.id]?.trim() || submittingReply
                                }
                                onClick={() => onSubmitReply(r.id)}
                              >
                                {submittingReply ? "Posting..." : "Post Reply"}
                              </Button>
                            </div>
                          </div>
                        )}
                        {activeEditId === r.id && (
                          <div className="mt-2 space-y-2">
                            <Textarea
                              value={editBodies[r.id] || ""}
                              onChange={(e) =>
                                setEditBodies((m) => ({
                                  ...m,
                                  [r.id]: e.target.value,
                                }))
                              }
                              placeholder="Edit your reply..."
                              className="bg-zinc-800 border-zinc-700 min-h-20 text-xs"
                              disabled={editingComment}
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-[11px] border-zinc-700"
                                onClick={() => setActiveEditId(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                disabled={
                                  !editBodies[r.id]?.trim() || editingComment
                                }
                                onClick={() => onSubmitEdit(r.id)}
                              >
                                {editingComment ? "Saving..." : "Save"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      ))}
      {hasMore && (
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            className="border-zinc-700 text-zinc-200"
            disabled={loading}
            onClick={onLoadMore}
          >
            {loading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
};
