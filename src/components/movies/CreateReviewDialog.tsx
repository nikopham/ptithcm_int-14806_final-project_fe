import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import clsx from "clsx";
import type { MovieDetailResponse } from "@/types/movie";

export type CreateReviewDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  detail: MovieDetailResponse;
  crRating: number;
  setCrRating: (v: number) => void;
  crBody: string;
  setCrBody: (v: string) => void;
  creating: boolean;
  onSubmit: () => void;
  onClose: () => void;
};

export const CreateReviewDialog = ({
  open,
  onOpenChange,
  detail,
  crRating,
  setCrRating,
  crBody,
  setCrBody,
  creating,
  onSubmit,
  onClose,
}: CreateReviewDialogProps) => {
  const options = [
    { value: 5, label: "Tuyệt vời", emoji: "😍" },
    { value: 4, label: "Phim hay", emoji: "😊" },
    { value: 3, label: "Khá ổn", emoji: "🙂" },
    { value: 2, label: "Phim chán", emoji: "🙁" },
    { value: 1, label: "Dở tệ", emoji: "😱" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">
            {detail.title || "Create Review"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <span className="i-lucide-crown" />
            <span>{detail.averageRating?.toFixed(1) ?? "0.0"}</span>
            <span className="text-zinc-500">
              / {detail.reviewCount ?? 0} lượt đánh giá
            </span>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {options.map((opt) => {
              const active = crRating === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={clsx(
                    "flex flex-col items-center gap-2 rounded-lg px-3 py-3 border transition",
                    active
                      ? "border-teal-500 bg-teal-500/10"
                      : "border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800"
                  )}
                  aria-label={`Chọn ${opt.label}`}
                  onClick={() => setCrRating(opt.value)}
                >
                  <div
                    className={clsx(
                      "grid h-14 w-14 place-items-center rounded-full text-2xl",
                      active ? "bg-teal-500/20" : "bg-zinc-700/40"
                    )}
                  >
                    {opt.emoji}
                  </div>
                  <span className="text-[12px] text-zinc-200">{opt.label}</span>
                </button>
              );
            })}
          </div>

          <div>
            <Textarea
              value={crBody}
              onChange={(e) => setCrBody(e.target.value)}
              placeholder="Viết nhận xét về phim (tuỳ chọn)"
              className="bg-zinc-800 border-zinc-700 min-h-[120px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-black"
            onClick={onSubmit}
            disabled={creating}
          >
            {creating ? "Gửi..." : "Gửi đánh giá"}
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={creating}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
