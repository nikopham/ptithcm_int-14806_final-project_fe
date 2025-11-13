import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

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
}: {
  open: boolean;
  onClose: () => void;
}) {
  /* local state demo */
  const [country, setCountry] = useState<string>("all");
  const [type, setType] = useState<string>("movie");
  const [rating, setRating] = useState<string>("all");
  const [sort, setSort] = useState<string>("new");

  const clearAndClose = () => {
    /* do search with selected chips here */
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
            {/* Quốc gia */}
            <Section label="Quốc gia:">
              {["Tất cả", "Việt Nam", "Anh", "Mỹ", "Nhật"].map((c) => (
                <Chip
                  key={c}
                  active={country === c}
                  onClick={() => setCountry(c)}
                >
                  {c}
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
                  onClick={() => setType(t.id)}
                >
                  {t.label}
                </Chip>
              ))}
            </Section>

            {/* Xếp hạng độ tuổi */}
            <Section label="Xếp hạng:">
              {["Tất cả", "P (Mọi lứa tuổi)", "T18 (18+)"].map((r) => (
                <Chip
                  key={r}
                  active={rating === r}
                  onClick={() => setRating(r)}
                >
                  {r}
                </Chip>
              ))}
            </Section>

            {/* Sắp xếp */}
            <Section label="Sắp xếp:">
              {[
                { id: "new", label: "Mới nhất" },
                { id: "imdb", label: "Điểm IMDb" },
                { id: "view", label: "Lượt xem" },
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
                onClick={clearAndClose}
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
