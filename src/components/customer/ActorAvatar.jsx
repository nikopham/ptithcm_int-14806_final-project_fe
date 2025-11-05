// src/components/ActorAvatar.jsx

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const ActorAvatar = ({ actor }) => {
  // Lấy 2 chữ cái đầu làm fallback
  const fallback = actor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2);

  return (
    // Đặt chiều rộng cố định để các item cách đều
    <div className="flex flex-col items-center w-28">
      <Avatar className="h-24 w-24 border-2 border-transparent hover:border-gray-300 transition-all duration-300">
        <AvatarImage
          src={actor.imageUrl}
          alt={actor.name}
          className="object-cover"
        />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <h4 className="mt-2 text-sm font-medium text-black text-center truncate w-full">
        {actor.name}
      </h4>
    </div>
  );
};
