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
const MOCK_COUNTRY = [
  {
    id: 3,
    name: "South Korea",
  },
  {
    id: 2,
    name: "United Kingdom",
  },
  {
    id: 1,
    name: "United States of America",
  },
];

export function CountryMenu({ onSelect }) {
  const [country, setCountry] = useState(MOCK_COUNTRY); // Dùng data mock
  const { country: listCountry } = useSelector((state) => state.movie);
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
  let menuItem = country;
  if (listCountry.length > 0) {
    menuItem = listCountry;
  }
  const handleCountryClick = (countryId) => {
    onSelect({ country_id: countryId.toString() });
  };
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          {/* 3. Đây là nút kích hoạt (giống hệt Link của bạn) */}
          <NavigationMenuTrigger
            className={cn(navigationMenuTriggerStyle(), "menu-link gap-1")}
          >
            Quốc gia
          </NavigationMenuTrigger>

          {/* 4. Đây là nội dung menu xổ xuống */}
          <NavigationMenuContent>
            <ul className="grid w-[300px] grid-cols-2 gap-2 p-4 md:w-[400px]">
              {menuItem.map((country) => (
                <li key={country.id}>
                  {/* Bỏ <Link> và 'asChild', dùng 'onClick' */}
                  <NavigationMenuLink
                    onClick={() => handleCountryClick(country.id)}
                    className={cn(
                      "block w-full select-none rounded-md p-3 text-sm cursor-pointer", // Thêm cursor-pointer
                      "leading-none no-underline outline-none transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:bg-accent focus:text-accent-foreground"
                    )}
                  >
                    {country.name}
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
