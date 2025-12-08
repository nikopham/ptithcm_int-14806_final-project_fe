// src/pages/VerifySuccessPage.tsx

import { useSearchParams, Link } from "react-router-dom";
import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VerifySuccessPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-900 text-black dark:text-white">
      <div className="p-8 bg-white dark:bg-zinc-800 rounded-lg shadow-xl text-center">
        <div className="flex flex-col items-center gap-4">
          <CircleCheck className="size-16 text-green-500" />
          <h1 className="text-3xl font-bold">Xác Minh Thành Công!</h1>
          {email && (
            <p className="text-lg text-zinc-600 dark:text-zinc-300">
              Email <strong>{email}</strong> của bạn đã được xác minh.
            </p>
          )}
          <p className="text-lg">Bạn có thể đăng nhập vào tài khoản của mình ngay bây giờ.</p>
          <Button asChild className="mt-4">
            {/* You can open the Login Dialog from here, or go to home */}
            <Link to="/">Về Trang Chủ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
