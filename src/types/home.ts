// src/types/home.ts

export interface MovieShort {
  id: string;
  title: string;
  originalTitle: string;
  posterUrl: string;
  backdropUrl: string;
  slug: string;
  imdbScore: number;
  releaseYear: number;
}

export interface GenreWithMovies {
  genreId: number;
  genreName: string;
  movies: MovieShort[];
}