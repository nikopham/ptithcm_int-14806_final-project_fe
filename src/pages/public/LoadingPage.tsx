import { Play } from "lucide-react";

/**
 * Một trang loading toàn màn hình, hiển thị logo của ứng dụng
 * với hiệu ứng "pulse" (nhịp đập) tinh tế.
 */
export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen dark:bg-zinc-900">
      {/* Thêm 'animate-pulse' vào group này để
        cả logo và chữ cùng nhấp nháy nhẹ nhàng
      */}
      <div className="flex items-center gap-2 animate-pulse">
        {/* Logo của bạn */}
        <Play className="size-6 -rotate-90 text-red-600" />
        <span className="font-heading text-lg font-semibold text-white">
          Stream<span className="text-red-500">ify</span>
        </span>
      </div>
    </div>
  );
}
