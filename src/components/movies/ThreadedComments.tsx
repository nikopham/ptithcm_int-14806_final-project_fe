import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import defaultAvatar from "@/assets/default-avatar.jpg";
import type { Comment } from "@/types/comment";
// Simple role -> label + style mapping for compact badges
const roleMap: Record<string, { label: string; className: string }> = {
  super_admin: {
    label: "Super Admin",
    className:
      "text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
  },
  movie_admin: {
    label: "Movie Admin",
    className:
      "text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30",
  },
  comment_admin: {
    label: "Comment Admin",
    className:
      "text-[10px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30",
  },
  viewer: {
    label: "Viewer",
    className:
      "text-[10px] px-1.5 py-0.5 rounded bg-zinc-700/30 text-zinc-300 border border-zinc-600/40",
  },
};

export type ThreadedCommentsProps = {
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
  currentUserId: string | null;
  requestAuth: () => void;
  submittingReply: boolean;
  activeEditId: string | null;
  setActiveEditId: (id: string | null) => void;
  editBodies: Record<string, string>;
  setEditBodies: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSubmitEdit: (id: string) => void;
  editingComment: boolean;
};

export const ThreadedComments = ({
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
  currentUserId,
  requestAuth,
  submittingReply,
  activeEditId,
  setActiveEditId,
  editBodies,
  setEditBodies,
  onSubmitEdit,
  editingComment,
}: ThreadedCommentsProps) => {
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
          <div
            className={
              `rounded-lg p-4 space-y-4 border bg-zinc-950 ` +
              (isAuth && p.userId === currentUserId
                ? "border-zinc-700 bg-red-500/5 relative pl-5"
                : "border-zinc-800")
            }
          >
            {isAuth && p.userId === currentUserId && (
              <span className="absolute left-0 top-0 h-full w-1 bg-red-500/60 rounded-l" />
            )}
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={p.userAvatar || defaultAvatar}
                  alt={p.username}
                  className="h-8 w-8 rounded-full object-cover"
                  loading="lazy"
                />
                <div>
                  <p className="text-sm font-medium text-white flex items-center gap-2">
                    {p.username}
                    {p.userRole && roleMap[p.userRole] && (
                      <span className={roleMap[p.userRole].className}>
                        {roleMap[p.userRole].label}
                      </span>
                    )}
                    {isAuth && p.userId === currentUserId && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                        You
                      </span>
                    )}
                  </p>
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
                  setActiveReplyId(activeReplyId === p.id ? null : p.id);
                }}
              >
                {activeReplyId === p.id ? "Cancel" : "Reply"}
              </Button>
              {isAuth && p.userId == currentUserId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[11px] border-zinc-700"
                  onClick={() => {
                    setActiveEditId(activeEditId === p.id ? null : p.id);
                    if (!editBodies[p.id])
                      setEditBodies((m) => ({ ...m, [p.id]: p.body }));
                  }}
                >
                  {activeEditId === p.id ? "Cancel" : "Edit"}
                </Button>
              )}
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
                    onClick={() => {
                      if (!isAuth) {
                        requestAuth();
                        return;
                      }
                      onSubmitReply(p.id);
                    }}
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
                    className={
                      `rounded-md p-3 border bg-zinc-950/80 ` +
                      (isAuth && r.userId === currentUserId
                        ? "border-zinc-700 bg-red-500/5 relative pl-5"
                        : "border-zinc-800")
                    }
                  >
                    {isAuth && r.userId === currentUserId && (
                      <span className="absolute left-0 top-0 h-full w-1 bg-red-500/60 rounded-l" />
                    )}
                    <div className="mb-1 flex items-start gap-3">
                      <img
                        src={r.userAvatar || defaultAvatar}
                        alt={r.username}
                        className="h-7 w-7 rounded-full object-cover"
                        loading="lazy"
                      />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-white flex items-center gap-2">
                          {r.username}
                          {r.userRole && roleMap[r.userRole] && (
                            <span className={roleMap[r.userRole].className}>
                              {roleMap[r.userRole].label}
                            </span>
                          )}
                          {isAuth && r.userId === currentUserId && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                              You
                            </span>
                          )}
                          <span className="ml-1 text-[10px] text-zinc-400">
                            {new Date(r.createdAt).toLocaleString()}{" "}
                            {r.isEdited ? "· edited" : ""}
                          </span>
                        </p>
                        <p className="text-[10px] text-zinc-400 italic">
                          Đang trả lời @ {p.username}
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
                              setActiveReplyId(
                                activeReplyId === r.id ? null : r.id
                              );
                            }}
                          >
                            {activeReplyId === r.id ? "Cancel" : "Reply"}
                          </Button>
                          {isAuth && r.userId === currentUserId && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-[11px] border-zinc-700"
                              onClick={() => {
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
                          )}
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
                                onClick={() => {
                                  if (!isAuth) {
                                    requestAuth();
                                    return;
                                  }
                                  onSubmitReply(r.id);
                                }}
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
