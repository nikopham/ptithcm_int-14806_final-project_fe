import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import type { ResetPasswordRequest } from "@/types/auth";
import {
  Loader2,
  CircleCheck,
  CircleAlert,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/features/auth/authApi";

// Copy 2 hàm validate này từ AuthDialog.tsx
const validatePassword = (password: string) => {
  if (!password) return "Mật khẩu là bắt buộc.";
  if (password.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự.";
  if (password.length > 16)
    return "Mật khẩu không được quá 16 ký tự.";
  if (!/(?=.*[a-z])/.test(password))
    return "Phải chứa ít nhất một chữ cái thường.";
  if (!/(?=.*[A-Z])/.test(password))
    return "Phải chứa ít nhất một chữ cái hoa.";
  if (!/(?=.*\d)/.test(password)) return "Phải chứa ít nhất một số.";
  if (!/(?=.*[^a-zA-Z0-9])/.test(password))
    return "Phải chứa ít nhất một ký tự đặc biệt.";
  if (/\s/.test(password)) return "Mật khẩu không được chứa khoảng trắng.";
  return "";
};
const validateRepassword = (pass: string, repass: string) => {
  if (!repass) return "Vui lòng xác nhận mật khẩu của bạn.";
  if (pass !== repass) return "Mật khẩu không khớp.";
  return "";
};

// State của trang
type PageStatus = "loading" | "invalid" | "form" | "success";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // State điều hướng
  const [status, setStatus] = useState<PageStatus>("loading");
  const [message, setMessage] = useState("");

  // State cho form
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepassword, setShowRepassword] = useState(false);
  const [errors, setErrors] = useState({ password: "", repassword: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Xác minh token khi trang tải
  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setMessage("Token không hợp lệ hoặc thiếu.");
      return;
    }

    const verifyToken = async () => {
      try {
        await authApi.verifyResetToken(token);
        // Token hợp lệ, hiển thị form
        setStatus("form");
      } catch (error: unknown) {
        // Token không hợp lệ
        setStatus("invalid");
        let msg = "Token không hợp lệ hoặc đã hết hạn.";
        if (typeof error === "object" && error !== null) {
          const e = error as { response?: { data?: { message?: string } } };
          msg = e.response?.data?.message || msg;
        }
        setMessage(msg);
      }
    };

    verifyToken();
  }, [token]);

  // 2. Gửi mật khẩu mới
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Validate
    const passErr = validatePassword(password);
    const repassErr = validateRepassword(password, repassword);
    if (passErr || repassErr) {
      setErrors({ password: passErr, repassword: repassErr });
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setErrors({ password: "", repassword: "" });

    try {
      const req: ResetPasswordRequest = {
        token,
        password,
        repassword,
      };

      const result = await authApi.resetPassword(req);
      // Thành công!
      setStatus("success");
      setMessage(result.message || "Mật khẩu đã được đặt lại thành công!");
    } catch (error: unknown) {
      // Lỗi (ví dụ: mismatch, token hết hạn lần 2)
      let msg = "Đã xảy ra lỗi.";
      if (typeof error === "object" && error !== null) {
        const e = error as { response?: { data?: { message?: string } } };
        msg = e.response?.data?.message || msg;
      }
      setMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Render nội dung
  const renderContent = () => {
    switch (status) {
      // 3.1 Đang tải (xác minh token)
      case "loading":
        return (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="size-12 animate-spin text-blue-500" />
            <p className="text-lg">Đang xác minh yêu cầu của bạn...</p>
          </div>
        );

      // 3.2 Token không hợp lệ
      case "invalid":
        return (
          <div className="flex flex-col items-center gap-4 text-center">
            <CircleAlert className="size-16 text-red-500" />
            <h1 className="text-3xl font-bold">Yêu Cầu Thất Bại</h1>
            <p className="text-lg text-red-400 max-w-md">{message}</p>
            <Button asChild className="mt-4" variant="outline">
              <Link to="/">Về Trang Chủ</Link>
            </Button>
          </div>
        );

      // 3.3 Token hợp lệ, hiển thị form
      case "form":
        return (
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
            <h1 className="text-3xl font-bold text-center">Đặt Mật Khẩu Mới</h1>
            <p className="text-zinc-400 text-center">
              Vui lòng nhập mật khẩu mới của bạn.
            </p>

            {/* ... Form ... */}
            <div className="space-y-2">
              <Label htmlFor="password">Mật Khẩu Mới</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tối thiểu 8 ký tự"
                  className="pl-10 pr-10 bg-zinc-950 border-zinc-700 focus-visible:ring-red-600"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors((p) => ({ ...p, password: "" }));
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="repassword">Xác Nhận Mật Khẩu Mới</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                <Input
                  id="repassword"
                  type={showRepassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu mới"
                  className="pl-10 pr-10 bg-zinc-950 border-zinc-700 focus-visible:ring-red-600"
                  value={repassword}
                  onChange={(e) => {
                    setRepassword(e.target.value);
                    if (errors.repassword)
                      setErrors((p) => ({ ...p, repassword: "" }));
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300"
                  onClick={() => setShowRepassword(!showRepassword)}
                >
                  {showRepassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.repassword && (
                <p className="text-xs text-red-500">{errors.repassword}</p>
              )}
            </div>

            {message && (
              <p className="text-sm text-red-500 text-center">{message}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Lưu Mật Khẩu Mới"
              )}
            </Button>
          </form>
        );

      // 3.4 Đổi mật khẩu thành công
      case "success":
        return (
          <div className="flex flex-col items-center gap-4 text-center">
            <CircleCheck className="size-16 text-green-500" />
            <h1 className="text-3xl font-bold">Đã Đặt Lại Mật Khẩu!</h1>
            <p className="text-lg">{message}</p>
            <Button asChild className="mt-4">
              {/* Bạn có thể mở Dialog đăng nhập từ đây */}
              <Link to="/">Về Trang Chủ</Link>
            </Button>
          </div>
        );
    }
  };

  // JSX chính của trang
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900 text-white p-4">
      <div className="p-8 bg-zinc-800 rounded-lg shadow-xl w-full max-w-md">
        {renderContent()}
      </div>
    </div>
  );
}
