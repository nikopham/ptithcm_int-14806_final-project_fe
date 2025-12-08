import clsx from "clsx";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const NavPair = ({
  page,
  total,
  prev,
  next,
}: {
  page: number;
  total: number;
  prev: () => void;
  next: () => void;
}) => (
  <div className="flex items-center gap-3">
    <button
      onClick={prev}
      disabled={page === 0}
      className={clsx(
        "grid h-8 w-8 place-items-center rounded-md bg-zinc-800 text-white",
        page === 0 ? "opacity-40" : "hover:bg-zinc-700"
      )}
    >
      <ArrowLeft className="size-4" />
    </button>
    {Array.from({ length: total }).map((_, i) => (
      <span
        key={i}
        className={clsx(
          "h-1 w-5 rounded-full",
          i === page ? "bg-red-500" : "bg-zinc-600"
        )}
      />
    ))}
    <button
      onClick={next}
      disabled={page === total - 1}
      className={clsx(
        "grid h-8 w-8 place-items-center rounded-md bg-zinc-800 text-white",
        page === total - 1 ? "opacity-40" : "hover:bg-zinc-700"
      )}
    >
      <ArrowRight className="size-4" />
    </button>
  </div>
);
