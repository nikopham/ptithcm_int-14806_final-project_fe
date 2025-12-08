import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import type { Country } from "@/types/country";

interface CountrySelectorProps {
  label?: string;
  available: Country[];
  selected: Country[];
  onChange: (countries: Country[]) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  setSearch: (val: string) => void;
}

export function CountrySelector({
  label = "Countries",
  available,
  selected,
  onChange,
  isOpen,
  onOpenChange,
  search,
  setSearch,
}: CountrySelectorProps) {
  const filtered = (available || []).filter((c) =>
    search ? c.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex flex-wrap gap-2">
        {selected.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-2 rounded-md border border-zinc-700 px-2 py-1"
          >
            <span className="text-xs">{c.name}</span>
            <button
              type="button"
              className="text-zinc-400 hover:text-red-400"
              onClick={() => onChange(selected.filter((x) => x.id !== c.id))}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <Input
          placeholder="Type to search countries..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) onOpenChange(true);
          }}
        />
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          onOpenChange(open);
          if (!open) setSearch("");
        }}
      >
        <DialogContent
          className="bg-zinc-900 border-zinc-800 text-white max-w-md"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Search Countries</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter country name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="max-h-72 overflow-y-auto rounded-md border border-zinc-700">
              {filtered.map((c) => {
                const isSelected = selected.some((x) => x.id === c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      onChange(
                        isSelected
                          ? selected.filter((x) => x.id !== c.id)
                          : [...selected, c]
                      )
                    }
                    className="flex w-full items-center justify-between gap-3 border-b border-zinc-800 p-3 text-left hover:bg-zinc-800/60"
                  >
                    <span className="text-sm font-medium">{c.name}</span>
                    {isSelected && (
                      <span className="text-[10px] text-teal-400">Added</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <DialogFooter></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
