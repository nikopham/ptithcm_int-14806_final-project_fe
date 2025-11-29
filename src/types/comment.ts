export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  isEdited: boolean;
  parentId: string | null; // null if top-level, else id of parent comment

  // User Info
  userId: string;
  username: string;
  userAvatar: string;

  // Stats
  replyCount: number;
}

export interface CommentSearchParams {
  movieId: string;
  page: number; // 1-based index (từ UI)
  size?: number;
}

export interface CreateCommentRequest {
  movieId: string;
  body: string;
  parentId?: string | null; // null or omitted for top-level
}

export interface EditCommentRequest {
  content: string;
}
