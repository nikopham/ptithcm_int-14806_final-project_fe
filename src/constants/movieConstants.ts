// src/constants/movieConstants.ts
import type { Person } from "@/types/person";

export interface Option {
  value: string;
  label: string;
}

// Cho Select Age Rating
export const ageRatings: Option[] = [
  { value: "P", label: "P (Mọi lứa tuổi)" },
  { value: "K", label: "K (Dưới 13 tuổi)" },
  { value: "T13", label: "T13 (13 tuổi trở lên)" },
  { value: "T16", label: "T16 (16 tuổi trở lên)" },
  { value: "T18", label: "T18 (18 tuổi trở lên)" },
];

// Cho Select Status
export const statusOptions = [
  { value: "DRAFT", label: "Draft", color: "bg-zinc-500" },
  { value: "PUBLISHED", label: "Published", color: "bg-green-500" },
  { value: "COMING_SOON", label: "Coming Soon", color: "bg-blue-500" },
  { value: "ARCHIVED", label: "Archived", color: "bg-red-500" },
];

// Dữ liệu Mock cho tìm kiếm Director/Actor
export const directorsMock: Person[] = [
  { id: 999, name: "Christopher Nolan", img: "..." },
  { id: 998, name: "Denis Villeneuve", img: "..." },
];

export const actorsMock: Person[] = [
  { id: 1001, name: "Tom Hanks", img: "..." },
  { id: 1002, name: "Leonardo DiCaprio", img: "..." },
];
