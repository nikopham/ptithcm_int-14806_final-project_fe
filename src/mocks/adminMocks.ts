// Shared admin mock data for local-only components (MovieList, GenreList, MovieEdit)
// Keeping shapes aligned with existing type definitions.

import type { MovieListItem } from "@/types/movie";
import type { GenreListItem } from "@/types/genre";

// Mock movie list items (id as string UUID-like, poster simple placeholder URLs)
export const mockMovieList: MovieListItem[] = [
  {
    id: "m-1",
    title: "Edge of Tomorrow",
    poster: "https://via.placeholder.com/80x120.png?text=Edge",
    release: "2014",
    duration: 113,
    age: "T13",
    status: "PUBLISHED",
    view: 1250000,
    series: false,
  },
  {
    id: "m-2",
    title: "Mock Action Saga",
    poster: "https://via.placeholder.com/80x120.png?text=Action",
    release: "2022",
    duration: 130,
    age: "T16",
    status: "DRAFT",
    view: 5400,
    series: false,
  },
  {
    id: "m-3",
    title: "Silent Night",
    poster: "https://via.placeholder.com/80x120.png?text=Night",
    release: "2019",
    duration: 100,
    age: "K",
    status: "HIDDEN",
    view: 23000,
    series: false,
  },
  {
    id: "s-1",
    title: "Galactic Quest Season 1",
    poster: "https://via.placeholder.com/80x120.png?text=Series1",
    release: "2021",
    duration: 50, // avg episode length
    age: "T13",
    status: "PUBLISHED",
    view: 450000,
    series: true,
  },
  {
    id: "s-2",
    title: "Galactic Quest Season 2",
    poster: "https://via.placeholder.com/80x120.png?text=Series2",
    release: "2022",
    duration: 52,
    age: "T13",
    status: "PUBLISHED",
    view: 610000,
    series: true,
  },
  {
    id: "m-4",
    title: "Romance in Paris",
    poster: "https://via.placeholder.com/80x120.png?text=Paris",
    release: "2018",
    duration: 95,
    age: "P",
    status: "PUBLISHED",
    view: 88000,
    series: false,
  },
  {
    id: "m-5",
    title: "Mystery of the Lake",
    poster: "https://via.placeholder.com/80x120.png?text=Lake",
    release: "2020",
    duration: 108,
    age: "T16",
    status: "DRAFT",
    view: 10200,
    series: false,
  },
  {
    id: "m-6",
    title: "Comedy Hour",
    poster: "https://via.placeholder.com/80x120.png?text=Comedy",
    release: "2017",
    duration: 60,
    age: "K",
    status: "PUBLISHED",
    view: 300000,
    series: false,
  },
  {
    id: "s-3",
    title: "Detective Files Season 1",
    poster: "https://via.placeholder.com/80x120.png?text=Detective1",
    release: "2019",
    duration: 48,
    age: "T13",
    status: "HIDDEN",
    view: 120000,
    series: true,
  },
  {
    id: "m-7",
    title: "Forgotten Kingdom",
    poster: "https://via.placeholder.com/80x120.png?text=Kingdom",
    release: "2015",
    duration: 140,
    age: "T16",
    status: "PUBLISHED",
    view: 220000,
    series: false,
  },
];

// Base genre list (pretend fetched from DB)
export const mockGenreList: GenreListItem[] = [
  { id: 1, name: "Action", tmdbId: 28, movieCount: 120 },
  { id: 2, name: "Adventure", tmdbId: 12, movieCount: 85 },
  { id: 3, name: "Comedy", tmdbId: 35, movieCount: 210 },
  { id: 4, name: "Drama", tmdbId: 18, movieCount: 160 },
  { id: 5, name: "Sci-Fi", tmdbId: 878, movieCount: 70 },
  { id: 6, name: "Fantasy", tmdbId: 14, movieCount: 55 },
  { id: 7, name: "Horror", tmdbId: 27, movieCount: 95 },
  { id: 8, name: "Thriller", tmdbId: 53, movieCount: 110 },
  { id: 9, name: "Romance", tmdbId: 10749, movieCount: 90 },
  { id: 10, name: "Animation", tmdbId: 16, movieCount: 65 },
  { id: 11, name: "Family", tmdbId: 10751, movieCount: 40 },
  { id: 12, name: "Mystery", tmdbId: 9648, movieCount: 50 },
];

// TMDB genre suggestions mock (for modal search)
export const tmdbGenreSuggestions = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 53, name: "Thriller" },
];

// Utility to generate next numeric ID for genres
export const getNextGenreId = (genres: GenreListItem[]) => {
  return genres.length === 0 ? 1 : Math.max(...genres.map((g) => g.id)) + 1;
};
