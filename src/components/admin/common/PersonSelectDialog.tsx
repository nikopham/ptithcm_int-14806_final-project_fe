import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
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
          className="bg-zinc-900 border-zinc-800 text-white max-w-md"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
            <div className="max-h-72 overflow-y-auto rounded-md border border-zinc-700">
              {isFetching && (
                <div className="p-4 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-zinc-500" />
                </div>
              )}
              {!isFetching && results.length === 0 && (
                <p className="p-3 text-sm text-zinc-400">No results.</p>
              )}
              {!isFetching &&
                results.map((p) => {
                  const added = isAdded(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onSelect(p)}
                      className="flex w-full items-center gap-3 border-b border-zinc-800 p-3 text-left hover:bg-zinc-800/60 disabled:opacity-40"
                      disabled={!singleSelect && added}
                    >
                      <img
                        src={getProfileUrl(p)}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {p.fullName}
                        </span>
                        {added && !singleSelect && (
                          <span className="text-[10px] text-teal-400">
                            Added
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <Button
                variant="outline"
                disabled={page === 0 || isFetching}
                onClick={() => setPage(Math.max(0, page - 1))}
                className="h-7 px-2"
              >
                Prev
              </Button>
              <span>
                Page {page + 1} of {totalPages || 0}
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
                className="h-7 px-2"
              >
                Next
              </Button>
            </div>
          </div>
          <DialogFooter></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
