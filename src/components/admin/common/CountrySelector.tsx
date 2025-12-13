import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Globe, Search } from "lucide-react";
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
  label = "Quốc gia",
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
      <Label className="flex items-center gap-2 text-gray-900">
        <Globe className="size-4 text-[#C40E61]" />
        {label}
      </Label>
      <div className="mt-2 flex flex-wrap gap-2">
        {selected.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-2 py-1 shadow-sm"
          >
            <span className="text-xs text-gray-700">{c.name}</span>
            <button
              type="button"
              className="text-gray-500 hover:text-red-600 hover:bg-red-50 rounded p-0.5 transition"
              onClick={() => onChange(selected.filter((x) => x.id !== c.id))}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-2 relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Nhập để tìm quốc gia..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) onOpenChange(true);
          }}
          className="pl-9 bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C40E61]"
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
          className="bg-white border-gray-300 text-gray-900 max-w-md"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <Globe className="size-5 text-[#C40E61]" />
              Tìm Quốc Gia
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Nhập tên quốc gia..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C40E61]"
              />
            </div>
            <div className="max-h-72 overflow-y-auto rounded-md border border-gray-300 bg-white">
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
                    className="flex w-full items-center justify-between gap-3 border-b border-gray-200 p-3 text-left hover:bg-gray-50 transition"
                  >
                    <span className="text-sm font-medium text-gray-900">{c.name}</span>
                    {isSelected && (
                      <span className="text-[10px] text-[#C40E61] font-medium">Đã chọn</span>
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
