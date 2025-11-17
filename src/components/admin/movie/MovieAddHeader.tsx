// src/components/admin/MovieAddHeader.tsx

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { searchMediaAsync } from "@/features/movie/movieThunks";
import { clearSearchResults } from "@/features/movie/movieSlice";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TmdbSearchItem } from "@/types/movie";
import { fetchDetailsAsync } from "@/features/movie/movieThunks"; // Import

const getPosterUrl = (path: string | null, size = "w92") => {
  if (!path) {
    return "https://via.placeholder.com/92x138.png?text=No+Image";
  }
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

interface MovieAddHeaderProps {
  searchType: "movie" | "tv";
  onSearchTypeChange: (type: "movie" | "tv") => void;
}

export function MovieAddHeader({
  searchType,
  onSearchTypeChange,
}: MovieAddHeaderProps) {
  const dispatch = useAppDispatch();

  // 1. State local
  const [query, setQuery] = useState("");
  // const [searchType, setSearchType] = useState<"movie" | "tv">("movie");
  const [sheetOpen, setSheetOpen] = useState(false);

  // 2. State từ Redux
  const { results, currentPage, totalPages, searchStatus } = useAppSelector(
    (state) => state.movie
  );
  const isLoading = searchStatus === "loading";
  const isSearching = isLoading && currentPage === 0;

  // 3. Logic
  const doSearch = () => {
    dispatch(searchMediaAsync({ query, page: 1, type: searchType }));
    setSheetOpen(true);
  };

  const handleLoadMore = () => {
    dispatch(
      searchMediaAsync({ query, page: currentPage + 1, type: searchType })
    );
  };

  const pick = (item: TmdbSearchItem) => {
    dispatch(fetchDetailsAsync({ tmdbId: item.id, type: item.media_type }));
    setSheetOpen(false);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);
    if (!open) {
      dispatch(clearSearchResults());
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Add new content</h1>
        <div className="flex gap-2">
          {/* Select Type */}
          <Select
            value={searchType}
            onValueChange={(v: "movie" | "tv") => {
              onSearchTypeChange(v); // 1. Báo cho component cha
              setQuery(""); // 2. (MỚI) Xóa query tìm kiếm
              dispatch(clearSearchResults()); // 3. (MỚI) Xóa kết quả cũ
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="movie">Movie</SelectItem>
              <SelectItem value="tv">TV</SelectItem>
            </SelectContent>
          </Select>

          <Input
            className="w-[250px]"
            placeholder={`Search TMDB ${searchType}s...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button
            onClick={doSearch}
            disabled={!query || isSearching}
            variant="secondary"
          >
            {isSearching ? (
              <Loader2 className="mr-1 size-4 animate-spin" />
            ) : (
              <Search className="mr-1 size-4" />
            )}
            Search
          </Button>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent side="right" className="overflow-y-auto">
          <h3 className="mb-4 font-semibold">
            Select {searchType === "movie" ? "Movie" : "TV Show"}
          </h3>
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => pick(r)}
              className="flex w-full items-start gap-3 rounded-md p-3 text-left hover:bg-zinc-800/50"
            >
              <img
                src={getPosterUrl(r.poster_path, "w92")}
                alt={r.title}
                className="h-16 w-10 flex-shrink-0 rounded object-cover bg-zinc-800"
              />
              <div>
                <p className="font-medium text-white">{r.title}</p>
                <p className="text-xs text-zinc-400">
                  {r.release_date ? r.release_date.split("-")[0] : "N/A"}
                </p>
              </div>
            </button>
          ))}

          {/* Load More Button */}
          {currentPage < totalPages && (
            <div className="mt-4 flex justify-center">
              <Button
                onClick={handleLoadMore}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                Load More
              </Button>
            </div>
          )}
          {searchStatus === "succeeded" && results.length === 0 && (
            <p className="text-zinc-400">No results found for "{query}".</p>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
