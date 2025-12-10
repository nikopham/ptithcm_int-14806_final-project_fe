// src/pages/VerifyFailPage.tsx

import { useSearchParams, Link } from "react-router-dom";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VerifyFailPage() {
  const [searchParams] = useSearchParams();
  const message = searchParams.get("msg") || "An unknown error occurred.";

  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-gray-900">
      <div className="p-8 bg-white rounded-lg shadow-xl text-center border border-gray-300">
        <div className="flex flex-col items-center gap-4">
          <CircleAlert className="size-16" style={{ color: "#C40E61" }} />
          <h1 className="text-3xl font-bold text-gray-900">Xác Minh Thất Bại</h1>
          <p className="text-lg max-w-md" style={{ color: "#C40E61" }}>
            {/* Display error message from backend */}
            {message}
          </p>
          <p className="text-lg mt-2 text-gray-500">
            Vui lòng thử đăng ký lại hoặc liên hệ hỗ trợ.
          </p>
          <Button asChild className="mt-4" variant="outline" style={{ borderColor: "#C40E61", color: "#C40E61" }}>
            <Link to="/">Về Trang Chủ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
