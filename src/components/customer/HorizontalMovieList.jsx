// src/components/HorizontalMovieList.jsx

import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
// Import MovieCard (bản light theme)
import { MovieCard } from "./MovieCard";

export const HorizontalMovieList = ({ title, movies }) => {
  if (!movies || movies.length === 0) {
    // Không hiển thị gì nếu không có phim
  }
  console.log(movies);

  return (
    <div className="space-y-4">
      {/* 1. Tiêu đề */}
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      {/* 2. Vùng cuộn */}

      {movies && movies.length > 0 ? (
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex w-max space-x-4 p-1">
            {movies.map((movie) => (
              // 3. Sử dụng MovieCard cho mỗi item
              <MovieCard
                key={movie.id}
                movie={movie}
                isLiked={movie?.isLiked}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <p className="text-muted-foreground">
          Hiện hệ thống chưa có phim phù hợp để đề xuất cho bạn.
        </p>
      )}
    </div>
  );
};
