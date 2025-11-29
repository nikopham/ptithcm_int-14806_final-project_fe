// src/components/admin/MovieAddHeader.tsx

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
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
        <h1 className="text-2xl font-bold text-white">Add new content</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={onReset}
          className="text-zinc-400 hover:text-white"
          title="Reset form"
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
      <div className="flex gap-2">
        <Select
          value={searchType}
          onValueChange={(v: "movie" | "tv") => onSearchTypeChange(v)}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="movie">Movie</SelectItem>
            <SelectItem value="tv">TV</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
