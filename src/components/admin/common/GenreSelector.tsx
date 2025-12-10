import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tag } from "lucide-react";
import type { Genre } from "@/types/genre";

interface GenreSelectorProps {
  label?: string;
  available: Genre[];
  selected: Genre[];
  onChange: (genres: Genre[]) => void;
  loading?: boolean;
}

export function GenreSelector({
  label = "Genres",
  available,
  selected,
  onChange,
  loading,
}: GenreSelectorProps) {
  return (
    <div>
      <Label className="flex items-center gap-2 text-gray-900">
        <Tag className="size-4 text-[#C40E61]" />
        {label}
      </Label>
      <div className="mt-2 flex flex-wrap gap-2">
        {loading && <p className="text-xs text-gray-500">Loading genres...</p>}
        {available.map((g) => {
          const active = selected.some((x) => x.id === g.id);
          return (
            <button
              key={g.id}
              type="button"
              onClick={() =>
                onChange(
                  active
                    ? selected.filter((x) => x.id !== g.id)
                    : [...selected, g]
                )
              }
            >
              <Badge
                className={
                  active
                    ? "bg-[#C40E61] hover:bg-[#C40E61]/90 text-white border-none"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                }
              >
                {g.name}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}
