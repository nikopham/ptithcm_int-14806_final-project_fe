import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import defaultAvatar from "@/assets/default-avatar.jpg";
import type { Comment } from "@/types/comment";
import { MessageCircle, Reply, Edit, Send, X, Loader2, User } from "lucide-react";
// Simple role -> label + style mapping for compact badges
const roleMap: Record<string, { label: string; className: string }> = {
  super_admin: {
    label: "Super Admin",
    className:
      "text-[10px] px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-700 border border-yellow-300",
  },
  movie_admin: {
    label: "Movie Admin",
    className:
      "text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-300",
  },
  comment_admin: {
    label: "Comment Admin",
    className:
      "text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-300",
  },
  viewer: {
    label: "Viewer",
    className:
      "text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-300",
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
              `rounded-xl p-4 space-y-4 border bg-white shadow-sm ` +
              (isAuth && p.userId === currentUserId
                ? "border-[#C40E61] bg-[#C40E61]/5 relative pl-5"
                : "border-gray-300")
            }
          >
            {isAuth && p.userId === currentUserId && (
              <span className="absolute left-0 top-0 h-full w-1 bg-[#C40E61] rounded-l" />
            )}
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={p.userAvatar || defaultAvatar}
                  alt={p.username}
                  className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                  loading="lazy"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <User className="size-3 text-gray-500" />
                    {p.username}
                    {p.userRole && roleMap[p.userRole] && (
                      <span className={roleMap[p.userRole].className}>
                        {roleMap[p.userRole].label}
                      </span>
                    )}
                    {isAuth && p.userId === currentUserId && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C40E61]/20 text-[#C40E61] border border-[#C40E61]/30">
                        Bạn
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {new Date(p.createdAt).toLocaleString()}{" "}
                    {p.isEdited && <span className="text-gray-400">· đã chỉnh sửa</span>}
                  </p>
                </div>
              </div>
              {typeof p.replyCount === "number" && p.replyCount > 0 && (
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  <MessageCircle className="size-3" />
                  {p.replyCount} trả lời
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {p.body}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[11px] border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setActiveReplyId(activeReplyId === p.id ? null : p.id);
                }}
              >
                <Reply className="mr-1 size-3" />
                {activeReplyId === p.id ? "Hủy" : "Trả lời"}
              </Button>
              {isAuth && p.userId == currentUserId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[11px] border-gray-300 text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setActiveEditId(activeEditId === p.id ? null : p.id);
                    if (!editBodies[p.id])
                      setEditBodies((m) => ({ ...m, [p.id]: p.body }));
                  }}
                >
                  <Edit className="mr-1 size-3" />
                  {activeEditId === p.id ? "Hủy" : "Chỉnh sửa"}
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
                  placeholder="Chỉnh sửa bình luận của bạn..."
                  className="bg-white border-gray-300 text-gray-900 min-h-20 text-xs focus-visible:ring-[#C40E61]"
                  disabled={editingComment}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-[11px] border-gray-300 text-gray-700 hover:bg-gray-100"
                    onClick={() => setActiveEditId(null)}
                  >
                    <X className="mr-1 size-3" />
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#C40E61] hover:bg-[#C40E61]/90 text-white"
                    disabled={!editBodies[p.id]?.trim() || editingComment}
                    onClick={() => onSubmitEdit(p.id)}
                  >
                    {editingComment ? (
                      <>
                        <Loader2 className="mr-1 size-3 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Send className="mr-1 size-3" />
                        Lưu
                      </>
                    )}
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
                  placeholder="Viết trả lời..."
                  className="bg-white border-gray-300 text-gray-900 min-h-20 text-xs focus-visible:ring-[#C40E61]"
                  disabled={submittingReply}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="bg-[#C40E61] hover:bg-[#C40E61]/90 text-white"
                    disabled={!replyBodies[p.id]?.trim() || submittingReply}
                    onClick={() => {
                      if (!isAuth) {
                        requestAuth();
                        return;
                      }
                      onSubmitReply(p.id);
                    }}
                  >
                    {submittingReply ? (
                      <>
                        <Loader2 className="mr-1 size-3 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Send className="mr-1 size-3" />
                        Gửi trả lời
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
          {repliesMap[p.id] && (
            <div className="ml-6 space-y-2 border-l-2 border-gray-300 pl-4">
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
                      `rounded-lg p-3 border bg-white shadow-sm ` +
                      (isAuth && r.userId === currentUserId
                        ? "border-[#C40E61] bg-[#C40E61]/5 relative pl-5"
                        : "border-gray-300")
                    }
                  >
                    {isAuth && r.userId === currentUserId && (
                      <span className="absolute left-0 top-0 h-full w-1 bg-[#C40E61] rounded-l" />
                    )}
                    <div className="mb-1 flex items-start gap-3">
                      <img
                        src={r.userAvatar || defaultAvatar}
                        alt={r.username}
                        className="h-7 w-7 rounded-full object-cover border-2 border-gray-200"
                        loading="lazy"
                      />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-900 flex items-center gap-2">
                          <User className="size-3 text-gray-500" />
                          {r.username}
                          {r.userRole && roleMap[r.userRole] && (
                            <span className={roleMap[r.userRole].className}>
                              {roleMap[r.userRole].label}
                            </span>
                          )}
                          {isAuth && r.userId === currentUserId && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#C40E61]/20 text-[#C40E61] border border-[#C40E61]/30">
                              Bạn
                            </span>
                          )}
                          <span className="ml-1 text-[10px] text-gray-500">
                            {new Date(r.createdAt).toLocaleString()}{" "}
                            {r.isEdited && <span className="text-gray-400">· đã chỉnh sửa</span>}
                          </span>
                        </p>
                        <p className="text-[10px] text-gray-500 italic mt-0.5">
                          Đang trả lời @ {p.username}
                        </p>
                        <p className="mt-1 text-xs text-gray-700 whitespace-pre-wrap">
                          {r.body}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[11px] border-gray-300 text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              setActiveReplyId(
                                activeReplyId === r.id ? null : r.id
                              );
                            }}
                          >
                            <Reply className="mr-1 size-3" />
                            {activeReplyId === r.id ? "Hủy" : "Trả lời"}
                          </Button>
                          {isAuth && r.userId === currentUserId && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-[11px] border-gray-300 text-gray-700 hover:bg-gray-100"
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
                              <Edit className="mr-1 size-3" />
                              {activeEditId === r.id ? "Hủy" : "Chỉnh sửa"}
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
                              placeholder="Viết trả lời..."
                              className="bg-white border-gray-300 text-gray-900 min-h-20 text-xs focus-visible:ring-[#C40E61]"
                              disabled={submittingReply}
                            />
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                className="bg-[#C40E61] hover:bg-[#C40E61]/90 text-white"
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
                                {submittingReply ? (
                                  <>
                                    <Loader2 className="mr-1 size-3 animate-spin" />
                                    Đang gửi...
                                  </>
                                ) : (
                                  <>
                                    <Send className="mr-1 size-3" />
                                    Gửi trả lời
                                  </>
                                )}
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
                              placeholder="Chỉnh sửa trả lời của bạn..."
                              className="bg-white border-gray-300 text-gray-900 min-h-20 text-xs focus-visible:ring-[#C40E61]"
                              disabled={editingComment}
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-[11px] border-gray-300 text-gray-700 hover:bg-gray-100"
                                onClick={() => setActiveEditId(null)}
                              >
                                <X className="mr-1 size-3" />
                                Hủy
                              </Button>
                              <Button
                                size="sm"
                                className="bg-[#C40E61] hover:bg-[#C40E61]/90 text-white"
                                disabled={
                                  !editBodies[r.id]?.trim() || editingComment
                                }
                                onClick={() => onSubmitEdit(r.id)}
                              >
                                {editingComment ? (
                                  <>
                                    <Loader2 className="mr-1 size-3 animate-spin" />
                                    Đang lưu...
                                  </>
                                ) : (
                                  <>
                                    <Send className="mr-1 size-3" />
                                    Lưu
                                  </>
                                )}
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
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
            disabled={loading}
            onClick={onLoadMore}
          >
            {loading ? (
              <>
                <Loader2 className="mr-1 size-3 animate-spin" />
                Đang tải...
              </>
            ) : (
              <>
                <MessageCircle className="mr-1 size-3" />
                Tải thêm
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
