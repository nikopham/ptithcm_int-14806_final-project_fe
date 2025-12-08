import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import type { FastSearchResponse } from "@/types/search";

// Shadcn UI Command
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useSearchFastQuery } from "@/features/search/searchApi";

// Helper để render text highlight
// Meilisearch trả về: "Harry <em>Pot</em>ter"
// Component này sẽ render HTML đó an toàn
const HighlightText = ({
  text,
  highlight,
}: {
  text: string;
  highlight?: string;
}) => {
  // Nếu có highlight (_formatted) thì dùng, không thì dùng text gốc
  const html = highlight || text;
  return (
    <span
      className="meili-highlight" // Class để CSS (xem bên dưới)
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export function GlobalSearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const navigate = useNavigate();

  // Gọi API Meilisearch
  const { data, isFetching } = useSearchFastQuery(debouncedQuery, {
    // Debounce yêu cầu; skip khi chuỗi quá ngắn
    skip: debouncedQuery.length < 1,
  });

  // Hotkey Ctrl+K (Giữ nguyên)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const shouldShowResults = query.length >= 1 && !!data;
  return (
    <>
      <Button
        variant="outline"
        className="w-full md:w-[260px] justify-between text-muted-foreground bg-black-900 border-black-700"
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-2">
          <Search className="h-4 w-4" /> Quick Search...
        </span>
        {/* <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd> */}
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput
          placeholder="Search movies, actors, directors..."
          value={query}
          onValueChange={setQuery}
        />

        <CommandList>
          {isFetching && query.length >= 1 && (
            <div className="py-6 flex justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...
            </div>
          )}

          {!isFetching &&
            shouldShowResults &&
            data?.movies.length === 0 &&
            data?.people.length === 0 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}

          {/* GROUP MOVIES */}
          {shouldShowResults && data?.movies && data.movies.length > 0 && (
            <CommandGroup heading="Movies">
              {data.movies.map((movie) => (
                <CommandItem
                  key={movie.id}
                  value={movie.id + movie.title}
                  onSelect={() => handleSelect(`/movie/detail/${movie.id}`)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={movie.poster}
                      className="h-10 w-7 object-cover rounded"
                      alt={movie.title}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-200">
                        {/* Render Title có Highlight */}
                        <HighlightText
                          text={movie.title}
                          highlight={movie._formatted?.title}
                        />
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {movie.releaseYear} • {movie.rating} ★
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {data?.movies?.length && data?.people?.length ? (
            <CommandSeparator />
          ) : null}

          {/* GROUP PEOPLE */}
          {shouldShowResults && data?.people && data.people.length > 0 && (
            <CommandGroup heading="People">
              {data.people.map((person) => (
                <CommandItem
                  key={person.id}
                  value={person.id + person.fullName}
                  onSelect={() => handleSelect(`/movie/people/${person.id}`)} // Giả sử bạn có trang people detail
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-800">
                      <img
                        src={person.profilePath}
                        className="h-full w-full object-cover"
                        alt={person.fullName}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-200">
                        <HighlightText
                          text={person.fullName}
                          highlight={person._formatted?.fullName}
                        />
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {person.job.toLowerCase()}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
