// src/pages/VerifySuccessPage.tsx

import { useSearchParams, Link } from "react-router-dom";
import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VerifySuccessPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-gray-900">
      <div className="p-8 bg-white rounded-lg shadow-xl text-center border border-gray-300">
        <div className="flex flex-col items-center gap-4">
          <CircleCheck className="size-16 text-green-500" />
          <h1 className="text-3xl font-bold text-gray-900">Xác Minh Thành Công!</h1>
          {email && (
            <p className="text-lg text-gray-500">
              Email <strong className="text-gray-900">{email}</strong> của bạn đã được xác minh.
            </p>
          )}
          <p className="text-lg text-gray-500">Bạn có thể đăng nhập vào tài khoản của mình ngay bây giờ.</p>
          <Button asChild className="mt-4" style={{ backgroundColor: "#C40E61", color: "white" }}>
            {/* You can open the Login Dialog from here, or go to home */}
            <Link to="/">Về Trang Chủ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
