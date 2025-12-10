import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import clsx from "clsx";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  useGetPublishedGenresQuery,
  useGetPublishedCountriesQuery,
  useGetReleaseYearsQuery,
} from "@/features/common/commonApi";
import { AgeRating } from "@/types/movie";

/* ▸ tiny helpers -------------------------------------------------- */
const Section = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="border-b border-gray-300 py-3 text-sm">
    <span className="inline-block w-28 shrink-0 text-gray-900 font-medium">{label}</span>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

const Chip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={clsx(
      "rounded px-2 py-0.5 text-xs transition",
      active
        ? "text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    )}
    style={active ? { backgroundColor: "#C40E61" } : undefined}
  >
    {children}
  </button>
);

/* ▸ main filter panel -------------------------------------------- */
export default function MovieFilter({
  open,
  onClose,
  onApply,
  initialReleaseYear,
  initialGenreIds,
}: {
  open: boolean;
  onClose: () => void;
  onApply?: (filters: {
    countryIds?: number[];
    genreIds?: number[];
    isSeries?: boolean;
    ageRating?: AgeRating;
    releaseYear?: number;
    sort?: string;
  }) => void;
  initialGenreIds?: number[];
  initialReleaseYear?: number;
}) {
  // options
  const { data: genres } = useGetPublishedGenresQuery();
  const { data: countries } = useGetPublishedCountriesQuery();
  const { data: years } = useGetReleaseYearsQuery();

  // local selections
  const [countryId, setCountryId] = useState<number | "all">("all");
  const [genreIds, setGenreIds] = useState<number[]>(initialGenreIds || []);
  const [type, setType] = useState<"movie" | "series" | "all">("all");
  const [rating, setRating] = useState<"all" | AgeRating>("all");
  const [year, setYear] = useState<number | "all">("all");
  const [yearInput, setYearInput] = useState<string>("");
  // sort string matches backend values (no UI redesign)
  const [sort, setSort] = useState<
    "createdAt,desc" | "viewCount,desc" | "averageRating,desc" | "title,asc"
  >("createdAt,desc");

  // Track initial values when filter panel opens to detect changes
  const initialValuesRef = useRef<{
    countryId: number | "all";
    genreIds: number[];
    type: "movie" | "series" | "all";
    rating: "all" | AgeRating;
    year: number | "all";
    sort: string;
  } | null>(null);
  const prevOpenRef = useRef(false);
  const hasCapturedRef = useRef(false);

  useEffect(() => {
    setGenreIds(initialGenreIds || []);
  }, [initialGenreIds]);

  useEffect(() => {
    setYear(initialReleaseYear ?? "all");
  }, [initialReleaseYear]);

  // Capture initial values when filter panel opens (only when transitioning from closed to open)
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      // Panel just opened - reset capture flag
      hasCapturedRef.current = false;
    } else if (!open) {
      // Panel closed - reset
      initialValuesRef.current = null;
      hasCapturedRef.current = false;
    }
    prevOpenRef.current = open;
  }, [open]);

  // Capture initial values after state has been updated from props (only once when panel opens)
  useEffect(() => {
    if (open && !hasCapturedRef.current) {
      // Capture current values when panel is open and we haven't captured yet
      initialValuesRef.current = {
        countryId,
        genreIds: [...genreIds],
        type,
        rating,
        year,
        sort,
      };
      hasCapturedRef.current = true;
    }
  }, [open, countryId, genreIds, type, rating, year, sort]);

  const ageRatingChips = useMemo(
    () => ["Tất cả", ...Object.values(AgeRating)],
    []
  );

  const toggleGenre = (id: number) => {
    setGenreIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const resetFilters = () => {
    setCountryId("all");
    setGenreIds([]);
    setType("all");
    setRating("all");
    setYear("all");
    setYearInput("");
    setSort("createdAt,desc");
  };

  // Check if filters have changed from initial values
  const hasChanges = useMemo(() => {
    if (!initialValuesRef.current) return false;
    
    const initial = initialValuesRef.current;
    
    // Compare arrays by sorting and stringifying
    const genreIdsChanged = 
      JSON.stringify([...genreIds].sort()) !== 
      JSON.stringify([...initial.genreIds].sort());
    
    return (
      countryId !== initial.countryId ||
      genreIdsChanged ||
      type !== initial.type ||
      rating !== initial.rating ||
      year !== initial.year ||
      sort !== initial.sort
    );
  }, [countryId, genreIds, type, rating, year, sort]);

  const applyAndClose = () => {
    onApply?.({
      countryIds: countryId === "all" ? undefined : [countryId as number],
      genreIds: genreIds.length ? genreIds : undefined,
      isSeries: type === "series" ? true : type === "movie" ? false : type === "all" ? undefined : undefined,
      ageRating: rating === "all" ? undefined : rating,
      releaseYear: year === "all" ? undefined : (year as number),
      sort,
    });
    onClose();
  };

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="filter"
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{ height: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-lg"
        >
          {/* close btn */}
          <div className="flex justify-between border-b border-gray-300 px-4 py-3">
            <span className="text-sm font-semibold text-gray-900">Bộ Lọc</span>
            <button
              onClick={onClose}
              className="text-gray-500 transition hover:text-gray-900"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* sections */}
          <div className="divide-y divide-gray-300 px-4">
            {/* Thể loại (đa chọn) */}
            <Section label="Thể loại:">
              <Chip
                active={genreIds.length === 0}
                onClick={() => setGenreIds([])}
              >
                Tất cả
              </Chip>
              {(genres || []).map((g) => (
                <Chip
                  key={g.id}
                  active={genreIds.includes(g.id)}
                  onClick={() => toggleGenre(g.id)}
                >
                  {g.name}
                </Chip>
              ))}
            </Section>

            {/* Quốc gia */}
            <Section label="Quốc gia:">
              <Chip
                active={countryId === "all"}
                onClick={() => setCountryId("all")}
              >
                Tất cả
              </Chip>
              {(countries || []).map((c) => (
                <Chip
                  key={c.id}
                  active={countryId === c.id}
                  onClick={() => setCountryId(c.id)}
                >
                  {c.name}
                </Chip>
              ))}
            </Section>

            {/* Năm phát hành */}
            <Section label="Năm phát hành:">
              <Chip
                active={year === "all"}
                onClick={() => {
                  setYear("all");
                  setYearInput("");
                }}
              >
                Tất cả
              </Chip>
              {(years || [])
                .slice()
                .sort((a, b) => b - a)
                .slice(0, 10)
                .map((y) => (
                  <Chip
                    key={y}
                    active={year === y}
                    onClick={() => {
                      setYear(y);
                      setYearInput(String(y));
                    }}
                  >
                    {y}
                  </Chip>
                ))}
              <div className="ml-2 inline-flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Năm..."
                  className="w-24 rounded bg-white border border-gray-300 px-2 py-1 text-xs text-gray-900 outline-none focus:ring-2"
                  style={{ "--tw-ring-color": "#C40E61" } as React.CSSProperties}
                  value={yearInput}
                  onChange={(e) => {
                    const v = e.target.value;
                    setYearInput(v);
                    if (v === "") {
                      setYear("all");
                    } else {
                      const n = Number(v);
                      if (!Number.isNaN(n)) setYear(n);
                    }
                  }}
                />
              </div>
            </Section>

            {/* Loại phim */}
            <Section label="Loại phim:">
              <Chip
                active={type === "all"}
                onClick={() => setType("all")}
              >
                Tất cả
              </Chip>
              {[
                { id: "movie", label: "Phim lẻ" },
                { id: "series", label: "Phim bộ" },
              ].map((t) => (
                <Chip
                  key={t.id}
                  active={type === t.id}
                  onClick={() => setType(t.id as "movie" | "series")}
                >
                  {t.label}
                </Chip>
              ))}
            </Section>

            {/* Xếp hạng độ tuổi */}
            <Section label="Xếp hạng:">
              {ageRatingChips.map((r) => (
                <Chip
                  key={r}
                  active={
                    rating === (r === "Tất cả" ? "all" : (r as AgeRating))
                  }
                  onClick={() =>
                    setRating(r === "Tất cả" ? "all" : (r as AgeRating))
                  }
                >
                  {r}
                </Chip>
              ))}
            </Section>

            {/* Sắp xếp */}
            <Section label="Sắp xếp:">
              {[
                { id: "createdAt,desc" as const, label: "Mới nhất" },
                { id: "viewCount,desc" as const, label: "Lượt xem ↓" },
                {
                  id: "averageRating,desc" as const,
                  label: "Điểm trung bình ↓",
                },
                { id: "title,asc" as const, label: "Tên (A-Z)" },
              ].map((s) => (
                <Chip
                  key={s.id}
                  active={sort === s.id}
                  onClick={() => setSort(s.id)}
                >
                  {s.label}
                </Chip>
              ))}
            </Section>

            {/* action bar */}
            <div className="flex items-center justify-end gap-3 py-4">
              <button
                onClick={resetFilters}
                className="rounded border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                Đặt Lại
              </button>
              <button
                onClick={onClose}
                className="rounded border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                Đóng
              </button>
              <button
                onClick={applyAndClose}
                disabled={!hasChanges}
                className={clsx(
                  "rounded px-4 py-1.5 text-sm font-medium transition text-white",
                  hasChanges
                    ? "hover:opacity-90"
                    : "bg-gray-300 cursor-not-allowed"
                )}
                style={hasChanges ? { backgroundColor: "#C40E61" } : undefined}
              >
                Lọc kết quả →
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
