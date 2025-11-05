// src/components/ActorList.jsx

import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ActorAvatar } from "./ActorAvatar";

export const ActorList = ({ title, actors }) => {
  if (!actors || actors.length === 0) {
    return null; // Không render gì nếu không có diễn viên
  }

  return (
    <section className="py-6">
      {/* 1. Header: Tiêu đề */}
      <div className="mb-4 px-4 md:px-8">
        <h2 className="text-2xl font-bold text-black">{title}</h2>
      </div>

      {/* 2. Vùng cuộn ngang */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 p-4 md:px-8">
          {actors.map((actor) => (
            <ActorAvatar key={actor.id} actor={actor} />
          ))}
        </div>
        {/* Thanh cuộn (chỉ xuất hiện khi cần) */}
        <ScrollBar orientation="horizontal" className="p-2" />
      </ScrollArea>
    </section>
  );
};
