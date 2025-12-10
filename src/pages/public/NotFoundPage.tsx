import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-gray-900">
      <div className="p-10 bg-white rounded-lg shadow-xl text-center border border-gray-300">
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle className="size-16" style={{ color: "#C40E61" }} />
          <h1 className="text-4xl font-bold" style={{ color: "#C40E61" }}>404</h1>
          <h2 className="text-2xl font-semibold text-gray-900">Không Tìm Thấy Trang</h2>
          <p className="text-lg text-gray-500 max-w-md">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
          </p>
          <Button asChild className="mt-4" style={{ backgroundColor: "#C40E61", color: "white" }}>
            <Link to="/">Về Trang Chủ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
