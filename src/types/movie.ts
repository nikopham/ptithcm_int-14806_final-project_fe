export enum AgeRating {
  P = "P",
  K = "K",
  T13 = "T13",
  T16 = "T16",
  T18 = "T18",
}

export interface Movie {
  id: string;
  title: string;
  originalTitle: string;
  posterUrl: string;
  ageRating: AgeRating;
  isSeries: boolean;
  createdAt: string;
}

export enum MovieStatus {
  PUBLISHED = "PUBLISHED",
  DRAFT = "DRAFT",
  HIDDEN = "HIDDEN",
}

// Request Params
export interface MovieSearchParams {
  query?: string;
  isSeries?: boolean;
  ageRating?: AgeRating;
  status?: string;
  page?: number;
  size?: number;
  sort?: string;
  genreIds?: number[];
  countryIds?: number[];
}

export interface MovieFormValues {
  title: string;
  originalTitle: string;
  description: string;
  releaseYear: number;
  durationMin: number;
  ageRating: string; // Enum AgeRating
  status: string; // Enum MovieStatus

  // Relations (List IDs)
  countryIds: number[];
  genreIds: number[];
  directorId: string; // UUID
  actorIds: string[]; // UUIDs

  posterImage: File | null;
  backdropImage: File | null;
}

export interface MoviePerson {
  id: string;
  name: string;
  avatar?: string;
}
export interface MovieDetail {
  id: string;
  title: string;
  originalTitle: string;
  description: string;

  release: string;
  duration: number;
  age: string;
  status: string;

  countries: { id: number; isoCode: string; name: string }[];
  genres: { id: number; name: string; movieCount: number }[];

  director: MoviePerson | null;
  actors: MoviePerson[];

  poster: string;
  backdrop: string;

  averageRating: number;
  viewCount: number;
  trailerUrl?: string;
  isSeries: boolean;
}

export interface MovieUpdateRequest {
  title?: string;
  originalTitle?: string;
  description?: string;
  releaseYear?: number;
  durationMin?: number;
  ageRating?: string;
  status?: string;
  videoUrl?: string;

  countryIds?: number[];
  genreIds?: number[];
  directorId?: string;
  actorIds?: string[];

  // File (nếu không chọn file mới thì null)
  posterImage?: File;
  backdropImage?: File;
}

export interface PersonResponse {
  id: string;
  fullName: string;
  job: string;
  profilePath: string;
  movieCount: number;
}

export interface EpisodeDto {
  id: string;
  episodeNumber: number;
  title: string;
  duration: number;
  synopsis: string;
  stillPath: string;
  airDate: string;
}

export interface SeasonDto {
  id: string;
  seasonNumber: number;
  title: string;
  episodes: EpisodeDto[];
}

// 2. Type chính: MovieDetailResponse
export interface MovieDetailResponse {
  id: string;
  title: string;
  originalTitle: string;
  description: string;
  slug: string;

  posterUrl: string; // JSON key: posterUrl
  backdropUrl: string;
  trailerUrl: string;

  releaseYear: number;
  releaseDate: string;
  durationMin: number;
  ageRating: string;
  quality: string;
  status: string;
  isSeries: boolean;
  isLiked: boolean;

  averageRating: number;
  viewCount: number;
  reviewCount: number;

  genres: { id: number; name: string }[];
  countries: { id: number; name: string; isoCode: string }[];

  directors: PersonResponse[];
  actors: PersonResponse[];

  seasons: SeasonDto[]; // Null nếu phim lẻ
}

export interface VideoStatusResponse {
  uid: string;
  state: "inprogress" | "ready" | "queued" | "error";
  pctComplete: number | string;
  readyToStream: boolean;
  streamUrl?: string; 
}