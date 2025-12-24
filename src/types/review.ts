export interface Review {
  id: string;
  // Movie Info
  movieId: string;
  movieTitle: string;
  moviePosterUrl?: string;

  // User Info
  userId: string;
  username: string;
  userAvatar?: string;
  isHidden?: boolean;

  // Content
  rating: number; // 1.0 - 5.0
  title?: string;
  body?: string;
  createdAt: string;
  hidden?: boolean; // Whether the review is hidden
}

export interface ReviewSearchParams {
  query?: string;
  movieTitle?: string; // Filter by movie title
  rating?: number; // 1, 2, 3, 4, 5
  page?: number;
  size?: number;
  sort?: string;
}

export interface ReviewRequest {
  movieId?: string; 
  rating: number;
  title?: string;
  body?: string;
}

// Toggle hidden response
export interface ToggleHiddenResponse {
  id: string;
  isHidden: boolean;
}