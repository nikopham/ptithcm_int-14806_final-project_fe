// src/pages/VerifyFailPage.tsx

import { useSearchParams, Link } from "react-router-dom";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VerifyFailPage() {
  const [searchParams] = useSearchParams();
  const message = searchParams.get("msg") || "An unknown error occurred.";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-900 text-black dark:text-white">
      <div className="p-8 bg-white dark:bg-zinc-800 rounded-lg shadow-xl text-center">
        <div className="flex flex-col items-center gap-4">
          <CircleAlert className="size-16 text-red-500" />
          <h1 className="text-3xl font-bold">Xác Minh Thất Bại</h1>
          <p className="text-lg text-red-500 dark:text-red-400 max-w-md">
            {/* Display error message from backend */}
            {message}
          </p>
          <p className="text-lg mt-2">
            Vui lòng thử đăng ký lại hoặc liên hệ hỗ trợ.
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link to="/">Về Trang Chủ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
