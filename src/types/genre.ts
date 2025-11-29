export interface Genre {
  id: number;
  name: string;
  movieCount: number;
}

export interface GenreSearchParams {
  query?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface GenreRequest {
  name: string;
}