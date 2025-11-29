import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useGetAllGenresQuery } from "@/features/genre/genreApi";
import { useGetAllCountriesQuery } from "@/features/country/countryApi";
import { AgeRating } from "@/types/movie";

/* ▸ tiny helpers -------------------------------------------------- */
const Section = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="border-b border-zinc-800 py-3 text-sm">
    <span className="inline-block w-28 shrink-0 text-zinc-400">{label}</span>
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
      "rounded  px-2 py-0.5 text-xs transition",
      active
        ? "bg-red-600 text-white"
        : " bg-zinc-800 text-zinc-300 hover:bg-zinc-700/60 hover:text-white"
    )}
  >
    {children}
  </button>
);

/* ▸ main filter panel -------------------------------------------- */
export default function MovieFilter({
  open,
  onClose,
  onApply,
  initialGenreIds,
}: {
  open: boolean;
  onClose: () => void;
  onApply?: (filters: {
    countryIds?: number[];
    genreIds?: number[];
    isSeries?: boolean;
    ageRating?: AgeRating;
    sort?: string;
  }) => void;
  initialGenreIds?: number[];
}) {
  // options
  const { data: genres } = useGetAllGenresQuery();
  const { data: countries } = useGetAllCountriesQuery();

  // local selections
  const [countryId, setCountryId] = useState<number | "all">("all");
  const [genreIds, setGenreIds] = useState<number[]>(initialGenreIds || []);
  const [type, setType] = useState<"movie" | "series">("movie");
  const [rating, setRating] = useState<"all" | AgeRating>("all");
  // sort string matches backend values (no UI redesign)
  const [sort, setSort] = useState<
    "createdAt,desc" | "viewCount,desc" | "averageRating,desc" | "title,asc"
  >("createdAt,desc");

  useEffect(() => {
    setGenreIds(initialGenreIds || []);
  }, [initialGenreIds]);

  const ageRatingChips = useMemo(
    () => ["Tất cả", ...Object.values(AgeRating)],
    []
  );

  const toggleGenre = (id: number) => {
    setGenreIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const applyAndClose = () => {
    onApply?.({
      countryIds: countryId === "all" ? undefined : [countryId as number],
      genreIds: genreIds.length ? genreIds : undefined,
      isSeries: type === "series" ? true : type === "movie" ? false : undefined,
      ageRating: rating === "all" ? undefined : rating,
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
          className="overflow-hidden rounded-xl border border-dashed border-zinc-600 bg-zinc-900/60 backdrop-blur"
        >
          {/* close btn */}
          <div className="flex justify-between border-b border-zinc-800 px-4 py-3">
            <span className="text-sm font-semibold text-yellow-400"></span>
            <button
              onClick={onClose}
              className="text-zinc-400 transition hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* sections */}
          <div className="divide-y divide-zinc-800 px-4">
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

            {/* Loại phim */}
            <Section label="Loại phim:">
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
                onClick={onClose}
                className="rounded border border-zinc-600 px-4 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700/40"
              >
                Đóng
              </button>
              <button
                onClick={applyAndClose}
                className="rounded bg-red-500 px-4 py-1.5 text-sm font-medium text-black hover:bg-red-600"
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
