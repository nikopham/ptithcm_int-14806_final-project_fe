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
  userRole: string;
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
  episodeId?: string | null; // null for movies, episodeId for TV series
}

export interface EditCommentRequest {
  content: string;
}

// Admin comment search request
export interface AdminCommentSearchParams {
  userId?: string;
  movieId?: string;
  isHidden?: boolean;
  movieTitle?: string;
  from?: string; // ISO date string
  to?: string; // ISO date string
  page?: number;
  size?: number;
  sort?: string;
}

// Movie info in comment response
export interface CommentMovieInfo {
  id: string;
  title: string;
  originalTitle?: string;
  slug?: string;
  posterUrl?: string;
  backdropUrl?: string;
  releaseYear?: number;
  isSeries?: boolean;
}

// Admin comment response (matches backend CommentSearchResponse)
export interface AdminComment {
  id: string;
  body: string;
  createdAt: string;
  isEdited: boolean;
  parentId: string | null;
  isHidden: boolean;
  sentimentScore?: number; // Optional, may not be in API response
  
  // User Info
  userId: string;
  username: string;
  userAvatar?: string;
  userRole: string;
  
  // Movie Info (nested object)
  movie?: CommentMovieInfo;
  
  // Stats
  replyCount: number;
}

// Toggle hidden response
export interface ToggleHiddenResponse {
  id: string;
  isHidden: boolean;
}