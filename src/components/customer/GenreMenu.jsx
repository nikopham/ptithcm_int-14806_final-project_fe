// src/components/layout/GenreMenu.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink, // Import Link của shadcn
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle, // Helper style
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import { list } from "postcss";
// (Giả sử bạn có 1 client axios đã cấu hình)
// import apiClient from "@/lib/axios";

// 1. Dữ liệu mock (từ yêu cầu của bạn)
const MOCK_GENRES = [
  { id: 7, name: "Action & Adventure" },
  { id: 4, name: "Phim Chính Kịch" },
  { id: 8, name: "Phim Hài" },
  { id: 1, name: "Phim Hành Động" },
  { id: 9, name: "Phim Hoạt Hình" },
  { id: 3, name: "Phim Khoa Học Viễn Tưởng" },
  { id: 5, name: "Phim Lịch Sử" },
  { id: 2, name: "Phim Phiêu Lưu" },
  { id: 6, name: "Sci-Fi & Fantasy" },
];

export function GenreMenu({ onSelect }) {
  const [genres, setGenres] = useState(MOCK_GENRES); // Dùng data mock
  const { genres: listGenres } = useSelector((state) => state.movie);
  // 2. TODO: Thay thế bằng API thật
  // useEffect(() => {
  //   const fetchGenres = async () => {
  //     try {
  //       // Gọi API bạn đã tạo: GET /api/public/genres
  //       const res = await apiClient.get("/public/genres");
  //       setGenres(res.data.data);
  //     } catch (error) {
  //       console.error("Failed to fetch genres", error);
  //     }
  //   };
  //   fetchGenres();
  // }, []);
  const handleGenreClick = (genreId) => {
   
    onSelect({ genre_id: genreId.toString() });
  };
  let menuItem = genres;
  if (listGenres.length > 0) {
    menuItem = listGenres;
  }

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          {/* 3. Đây là nút kích hoạt (giống hệt Link của bạn) */}
          <NavigationMenuTrigger
            className={cn(navigationMenuTriggerStyle(), "menu-link gap-1")}
          >
            Thể loại
          </NavigationMenuTrigger>

          {/* 4. Đây là nội dung menu xổ xuống */}
          <NavigationMenuContent>
            <ul className="grid w-[300px] grid-cols-2 gap-2 p-4 md:w-[400px]">
              {genres.map((genre) => (
                <li key={genre.id}>
                  {/* Bỏ <Link> và 'asChild', dùng 'onClick' */}
                  <NavigationMenuLink
                    onClick={() => handleGenreClick(genre.id)}
                    className={cn(
                      "block w-full select-none rounded-md p-3 text-sm cursor-pointer", // Thêm cursor-pointer
                      "leading-none no-underline outline-none transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:bg-accent focus:text-accent-foreground"
                    )}
                  >
                    {genre.name}
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
