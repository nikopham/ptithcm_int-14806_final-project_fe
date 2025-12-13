import type { PageResponse } from "./common";
import type { Movie } from "./movie";

export enum PersonJob {
  ACTOR = "ACTOR",
  DIRECTOR = "DIRECTOR",
}

export interface Person {
  id: string; // UUID
  fullName: string;
  job: string[];
  profilePath?: string;
  movieCount?: number;
}

export interface PersonSearchParams {
  query?: string;
  job?: PersonJob;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PersonDetail {
  id: string;
  fullName: string;
  biography: string;
  birthDate: string;
  placeOfBirth: string;
  profilePath: string;
  job: string[];

  // Danh sách phim có phân trang
  movies: PageResponse<Movie>;
}