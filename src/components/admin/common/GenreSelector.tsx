import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
      <Label>{label}</Label>
      <div className="mt-2 flex flex-wrap gap-2">
        {loading && <p className="text-xs text-zinc-400">Loading genres...</p>}
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
                    ? "bg-teal-600 hover:bg-teal-700"
                    : "bg-zinc-800 hover:bg-zinc-700/60 text-white-400"
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
