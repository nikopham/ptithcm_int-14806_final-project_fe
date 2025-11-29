export enum PersonJob {
  ACTOR = "ACTOR",
  DIRECTOR = "DIRECTOR",
}

export interface Person {
  id: string; // UUID
  fullName: string;
  job: PersonJob;
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
