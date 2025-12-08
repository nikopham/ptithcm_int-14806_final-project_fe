import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MovieEditHeaderProps {
  contentType: "movie" | "tv";
  onContentTypeChange?: (type: "movie" | "tv") => void;
  onReset: () => void;
  disabled?: boolean;
}

export function MovieEditHeader({
  contentType,
  onContentTypeChange,
  onReset,
  disabled = true,
}: MovieEditHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-white">Edit content</h1>
        {/* <Button
          variant="ghost"
          size="icon"
          onClick={onReset}
          className="text-zinc-400 hover:text-white"
          title="Reset form"
        >
          <RotateCcw className="size-4" />
        </Button> */}
      </div>
      <div className="flex gap-2">
        <Select
          value={contentType}
          onValueChange={(v: "movie" | "tv") => {
            if (!disabled && onContentTypeChange) onContentTypeChange(v);
          }}
          disabled={disabled}
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
