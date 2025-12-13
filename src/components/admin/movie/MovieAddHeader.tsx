// src/components/admin/MovieAddHeader.tsx

import { Button } from "@/components/ui/button";
import { RotateCcw, Plus, Film, Tv } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MovieAddHeaderProps {
  searchType: "movie" | "tv";
  onSearchTypeChange: (type: "movie" | "tv") => void;
  onReset: () => void;
}

export function MovieAddHeader({
  searchType,
  onSearchTypeChange,
  onReset,
}: MovieAddHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Plus className="size-6 text-[#C40E61]" />
          Thêm phim/bộ phim mới
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={onReset}
          className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          title="Đặt lại form"
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
      <div className="flex gap-2">
        <Select
          value={searchType}
          onValueChange={(v: "movie" | "tv") => onSearchTypeChange(v)}
        >
          <SelectTrigger className="w-[120px] bg-white border-gray-300 text-gray-700 hover:bg-gray-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-300 text-gray-900">
            <SelectItem value="movie">
              <div className="flex items-center gap-2">
                <Film className="size-4 text-[#C40E61]" />
                Phim
              </div>
            </SelectItem>
            <SelectItem value="tv">
              <div className="flex items-center gap-2">
                <Tv className="size-4 text-[#C40E61]" />
                Phim Bộ
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
