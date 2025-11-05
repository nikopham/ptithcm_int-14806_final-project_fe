import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
// (Các import khác của bạn)

// Cấu hình các năm
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) =>
  (currentYear - i).toString()
);

export const MovieFilters = ({ currentFilters, onApply, onReset }) => {
  const [localFilters, setLocalFilters] = useState(currentFilters);

  const {
    country: listCountry,
    genres: listGenres,
    loading,
  } = useSelector((state) => state.movie);

  // Cập nhật state local khi filter từ URL thay đổi
  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  // (Các hàm handleValueChange, handleApplyClick, handleResetClick
  // và renderButtons của bạn đều đã chính xác)
  const handleValueChange = (key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  };

  const handleApplyClick = () => {
    onApply(localFilters); // Gửi state local về trang cha
  };

  const handleResetClick = () => {
    // Reset state local và gọi hàm reset của cha
    setLocalFilters({});
    onReset();
  };

  const renderButtons = (items, key, useScroll = false) => {
    const currentValue = localFilters[key]; // Giá trị đang được chọn
    const content = (
      <div className="flex flex-wrap gap-2 p-1">
        <Button
          variant={!currentValue ? "default" : "outline"}
          size="sm"
          className="h-8"
          onClick={() => handleValueChange(key, undefined)}
        >
          Tất cả
        </Button>
        {items.map((item) => {
          const value = item.id ? item.id.toString() : item;
          const isActive = currentValue === value;
          return (
            <Button
              key={value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="h-8"
              onClick={() => handleValueChange(key, value)}
            >
              {item.name || item}
            </Button>
          );
        })}
      </div>
    );
    if (useScroll) {
      return (
        <ScrollArea className="h-24 md:h-32 border rounded-md">
          {content}
        </ScrollArea>
      );
    }
    return content;
  };

  return (
    <div className=" p-4 border rounded-lg mb-4">
      <h3 className="text-xl font-semibold text-white">Bộ lọc</h3>

      <div className="space-y-2">
        {/* 1. Loại phim (type) */}
        <FilterSection label="Loại phim">
          {renderButtons(
            [
              { id: "movie", name: "Phim lẻ" },
              { id: "tv", name: "Phim bộ" },
            ],
            "type",
            false
          )}
        </FilterSection>

        {/* 2. Quốc gia (country_id) */}
        <FilterSection label="Quốc gia">
          {renderButtons(listCountry, "country_id", true)}
        </FilterSection>

        {/* 3. Thể loại (genre_id) */}
        <FilterSection label="Thể loại">
          {renderButtons(listGenres, "genre_id", true)}
        </FilterSection>

        {/* 4. Năm sản xuất (release_year) */}
        <FilterSection label="Năm sản xuất">
          {renderButtons(YEARS, "release_year", true)}
        </FilterSection>
      </div>

      <div className="flex justify-end gap-3 mt-2">
        <Button variant="outline" onClick={handleResetClick} disabled={loading}>
          Reset
        </Button>
        <Button onClick={handleApplyClick} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Lọc kết quả
        </Button>
      </div>
    </div>
  );
};

// Component phụ
const FilterSection = ({ label, children }) => (
  <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] items-start gap-4">
    <Label className="font-semibold text-muted-foreground mt-2">{label}</Label>
    {children}
  </div>
);
