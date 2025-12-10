import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Search, Users, Check } from "lucide-react";
import type { Person } from "@/types/person";

interface PersonSelectDialogProps {
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  setSearch: (s: string) => void;
  page: number; // 0-based UI
  setPage: (p: number) => void;
  isFetching: boolean;
  totalPages?: number;
  results: Person[];
  singleSelect?: boolean; // director true, actors false
  selected: Person | Person[];
  onSelect: (p: Person) => void;
  onRemove?: (id: string) => void; // reserved for future use
}

export function PersonSelectDialog({
  label,
  open,
  onOpenChange,
  search,
  setSearch,
  page,
  setPage,
  isFetching,
  totalPages = 0,
  results,
  singleSelect = false,
  selected,
  onSelect,
  onRemove,
}: PersonSelectDialogProps) {
  const getProfileUrl = (p: Person) =>
    p.profilePath || "https://via.placeholder.com/48x48.png?text=?";
  const isAdded = (id: string) =>
    Array.isArray(selected)
      ? selected.some((a) => a.id === id)
      : (selected as Person | null)?.id === id;

  return (
    <div>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          onOpenChange(o);
          if (!o) {
            setSearch("");
            setPage(0);
          }
        }}
      >
        <DialogContent
          className="bg-white border-gray-300 text-gray-900 max-w-md"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <Users className="size-5 text-[#C40E61]" />
              {label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Nhập tên để tìm..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="pl-9 bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C40E61]"
              />
            </div>
            <div className="max-h-72 overflow-y-auto rounded-md border border-gray-300 bg-white">
              {isFetching && (
                <div className="p-4 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#C40E61]" />
                </div>
              )}
              {!isFetching && results.length === 0 && (
                <p className="p-3 text-sm text-gray-500">Không tìm thấy kết quả.</p>
              )}
              {!isFetching &&
                results.map((p) => {
                  const added = isAdded(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onSelect(p)}
                      className="flex w-full items-center gap-3 border-b border-gray-200 p-3 text-left hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={!singleSelect && added}
                    >
                      <img
                        src={getProfileUrl(p)}
                        className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-medium text-gray-900">
                          {p.fullName}
                        </span>
                        {added && !singleSelect && (
                          <span className="text-[10px] text-[#C40E61] font-medium flex items-center gap-1">
                            <Check className="size-3" />
                            Đã chọn
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <Button
                variant="outline"
                disabled={page === 0 || isFetching}
                onClick={() => setPage(Math.max(0, page - 1))}
                className="h-7 px-2 border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Trước
              </Button>
              <span>
                Trang {page + 1} / {totalPages || 0}
              </span>
              <Button
                variant="outline"
                disabled={
                  isFetching ||
                  totalPages === 0 ||
                  page + 1 >= (totalPages || 0)
                }
                onClick={() =>
                  setPage(page + 1 < (totalPages || 0) ? page + 1 : page)
                }
                className="h-7 px-2 border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Sau
              </Button>
            </div>
          </div>
          <DialogFooter></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
