// src/constants/movieConstants.ts
import type { Person } from "@/types/person";

export interface Option {
  value: string;
  label: string;
}

// Cho Select Age Rating
export const ageRatings: Option[] = [
  { value: "P", label: "P (Tất cả độ tuổi)" },
  { value: "K", label: "K (Dưới 13 tuổi)" },
  { value: "T13", label: "T13 (Trên 13 tuổi)" },
  { value: "T16", label: "T16 (Trên 16 tuổi)" },
  { value: "T18", label: "T18 (Trên 18 tuổi)" },
];

// Cho Select Status
export const statusOptions = [
  { value: "DRAFT", label: "Bản nháp", color: "bg-zinc-500" },
  // { value: "PUBLISHED", label: "Đã xuất bản", color: "bg-green-500" },
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
