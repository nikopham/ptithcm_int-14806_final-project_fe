import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-900 text-black dark:text-white">
      <div className="p-10 bg-white dark:bg-zinc-800 rounded-lg shadow-xl text-center">
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle className="size-16 text-yellow-500" />
          <h1 className="text-4xl font-bold text-yellow-500">404</h1>
          <h2 className="text-2xl font-semibold">Không Tìm Thấy Trang</h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-md">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
          </p>
          <Button asChild className="mt-4">
            <Link to="/">Về Trang Chủ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
