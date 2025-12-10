import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ForbiddenPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-gray-900">
      <div className="p-10 bg-white rounded-lg shadow-xl text-center border border-gray-300">
        <div className="flex flex-col items-center gap-4">
          <ShieldAlert className="size-16" style={{ color: "#C40E61" }} />
          <h1 className="text-4xl font-bold" style={{ color: "#C40E61" }}>403</h1>
          <h2 className="text-2xl font-semibold text-gray-900">Truy Cập Bị Từ Chối</h2>
          <p className="text-lg text-gray-500 max-w-md">
            Trang web chưa phát triển hoặc bạn không có quyền truy cập vào đây.
          </p>
          <Button asChild className="mt-4" style={{ backgroundColor: "#C40E61", color: "white" }}>
            <Link to="/">Về Trang Chủ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
