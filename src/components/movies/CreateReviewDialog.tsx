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
import { Star, MessageSquare, Send, X } from "lucide-react";

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
      <DialogContent className="bg-white border-gray-300 text-gray-900 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <MessageSquare className="size-5 text-[#C40E61]" />
            {detail.title || "Tạo Đánh Giá"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Star className="size-4 text-[#C40E61] fill-[#C40E61]" />
            <span className="font-medium text-gray-900">
              {detail.averageRating?.toFixed(1) ?? "0.0"}
            </span>
            <span className="text-gray-500">
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
                    "flex flex-col items-center gap-2 rounded-lg px-3 py-3 border transition-all duration-200",
                    active
                      ? "border-[#C40E61] bg-[#C40E61]/10 shadow-sm"
                      : "border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400"
                  )}
                  aria-label={`Chọn ${opt.label}`}
                  onClick={() => setCrRating(opt.value)}
                >
                  <div
                    className={clsx(
                      "grid h-14 w-14 place-items-center rounded-full text-2xl transition-all duration-200",
                      active ? "bg-[#C40E61]/20 scale-110" : "bg-gray-100"
                    )}
                  >
                    {opt.emoji}
                  </div>
                  <span className={clsx(
                    "text-[12px] font-medium",
                    active ? "text-[#C40E61]" : "text-gray-600"
                  )}>{opt.label}</span>
                </button>
              );
            })}
          </div>

          <div>
            <Textarea
              value={crBody}
              onChange={(e) => setCrBody(e.target.value)}
              placeholder="Viết nhận xét về phim (tuỳ chọn)"
              className="bg-white border-gray-300 text-gray-900 min-h-[120px] focus-visible:ring-[#C40E61]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            className="bg-[#C40E61] hover:bg-[#C40E61]/90 text-white"
            onClick={onSubmit}
            disabled={creating}
          >
            <Send className="mr-2 size-4" />
            {creating ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={creating}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <X className="mr-2 size-4" />
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
