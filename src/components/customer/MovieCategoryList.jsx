// src/components/MovieCategoryList.jsx

import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MovieCard } from "./MovieCard";
import { FiChevronRight } from "react-icons/fi"; // Icon mũi tên

export const MovieCategoryList = ({ title, movies }) => {
  return (
    <section className="py-6">
      {/* 1. Header: Tiêu đề và nút "View All" */}
      <div className="flex justify-between items-center mb-4 px-4 md:px-8">
        <h2 className="text-xl md:text-2xl font-bold text-black uppercase tracking-wide">
          {title}
        </h2>
        <Button
          variant="link"
          className="text-sm text-gray-600 hover:text-black"
        >
          Xem tất cả
          <FiChevronRight className="h-4 w-4 ml-0.5" />
        </Button>
      </div>

      {/* 2. Vùng cuộn ngang */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 p-4 md:px-8">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} isLiked={movie?.isLiked} />
          ))}
        </div>
        {/* Thanh cuộn (chỉ xuất hiện khi cần) */}
        <ScrollBar orientation="horizontal" className="p-2" />
      </ScrollArea>
    </section>
  );
};
