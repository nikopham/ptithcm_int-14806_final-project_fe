import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, Film, Users, Star } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

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
      className="meili-highlight [&_em]:font-semibold [&_em]:text-[#C40E61] [&_em]:not-italic [&_em]:bg-[#C40E61]/10 [&_em]:px-0.5 [&_em]:rounded"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const mapJobToVietnamese = (job: string): string => {
  const jobMap: Record<string, string> = {
    ACTOR: "Diễn viên",
    DIRECTOR: "Đạo diễn",
  };
  return jobMap[job] || job;
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
        className="w-full md:w-[260px] justify-between text-gray-500 bg-white border-gray-300 hover:bg-gray-50 hover:text-gray-900"
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-2">
          <Search className="h-4 w-4 text-[#C40E61]" /> Tìm Kiếm...
        </span>
        {/* <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-[10px] font-medium opacity-100 text-gray-600">
          <span className="text-xs">⌘</span>K
        </kbd> */}
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Tìm kiếm phim, diễn viên, đạo diễn..."
          value={query}
          onValueChange={setQuery}
        />

        <CommandList>
          {isFetching && query.length >= 1 && (
            <div className="py-6 flex justify-center items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin text-[#C40E61]" /> Đang tìm kiếm...
            </div>
          )}

          {!isFetching &&
            shouldShowResults &&
            data?.movies.length === 0 &&
            data?.people.length === 0 && (
              <CommandEmpty className="text-gray-500">Không tìm thấy kết quả nào.</CommandEmpty>
            )}

          {/* GROUP MOVIES */}
          {shouldShowResults && data?.movies && data.movies.length > 0 && (
            <CommandGroup heading={
              <div className="flex items-center gap-2 text-gray-900">
                <Film className="size-4 text-[#C40E61]" />
                Phim
              </div>
            }>
              {data.movies.map((movie) => (
                <CommandItem
                  key={movie.id}
                  value={movie.id + movie.title}
                  onSelect={() => handleSelect(`/movie/detail/${movie.id}`)}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={movie.poster}
                      className="h-10 w-7 object-cover rounded border border-gray-300 shadow-sm"
                      alt={movie.title}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {/* Render Title có Highlight */}
                        <HighlightText
                          text={movie.title}
                          highlight={movie._formatted?.title}
                        />
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        {movie.releaseYear} • 
                        <Star className="size-3 fill-yellow-500 text-yellow-500" />
                        {movie.rating}
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
            <CommandGroup heading={
              <div className="flex items-center gap-2 text-gray-900">
                <Users className="size-4 text-[#C40E61]" />
                Người
              </div>
            }>
              {data.people.map((person) => (
                <CommandItem
                  key={person.id}
                  value={person.id + person.fullName}
                  onSelect={() => handleSelect(`/movie/people/${person.id}`)} // Giả sử bạn có trang people detail
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 border border-gray-300 shadow-sm">
                      <img
                        src={person.profilePath}
                        className="h-full w-full object-cover"
                        alt={person.fullName}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        <HighlightText
                          text={person.fullName}
                          highlight={person._formatted?.fullName}
                        />
                      </span>
                      <span className="text-xs text-gray-500">
                        {(Array.isArray(person.job)
                          ? person.job
                          : typeof person.job === "string"
                          ? person.job.split(",").map((j) => j.trim()).filter(Boolean)
                          : [person.job]
                        )
                          .map(mapJobToVietnamese)
                          .join(", ")}
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
