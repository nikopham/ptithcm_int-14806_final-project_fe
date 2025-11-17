
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
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password.length > 16)
    return "Password must be no more than 16 characters.";
  if (!/(?=.*[a-z])/.test(password))
    return "Must contain one lowercase letter.";
  if (!/(?=.*[A-Z])/.test(password))
    return "Must contain one uppercase letter.";
  if (!/(?=.*[^a-zA-Z0-9])/.test(password))
    return "Must contain one special character.";
  if (/\s/.test(password)) return "Password cannot contain spaces.";
  return "";
};
const validateRepassword = (pass: string, repass: string) => {
  if (!repass) return "Please confirm your password.";
  if (pass !== repass) return "Passwords do not match.";
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
  const [errors, setErrors] = useState({ password: "", repassword: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Xác minh token khi trang tải
  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setMessage("Invalid or missing token.");
      return;
    }

    const verifyToken = async () => {
      try {
        await authApi.verifyResetToken(token);
        // Token hợp lệ, hiển thị form
        setStatus("form");
      } catch (error: any) {
        // Token không hợp lệ
        setStatus("invalid");
        setMessage(
          error.response?.data?.message || "Invalid or expired token."
        );
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
      setMessage(result.message || "Password has been reset successfully!");
    } catch (error: any) {
      // Lỗi (ví dụ: mismatch, token hết hạn lần 2)
      setMessage(error.response?.data?.message || "An error occurred.");
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
            <p className="text-lg">Verifying your request...</p>
          </div>
        );

      // 3.2 Token không hợp lệ
      case "invalid":
        return (
          <div className="flex flex-col items-center gap-4 text-center">
            <CircleAlert className="size-16 text-red-500" />
            <h1 className="text-3xl font-bold">Request Failed</h1>
            <p className="text-lg text-red-400 max-w-md">{message}</p>
            <Button asChild className="mt-4" variant="outline">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        );

      // 3.3 Token hợp lệ, hiển thị form
      case "form":
        return (
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
            <h1 className="text-3xl font-bold text-center">Set New Password</h1>
            <p className="text-zinc-400 text-center">
              Please enter your new password.
            </p>

            {/* ... Form ... */}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
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
              <Label htmlFor="repassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                <Input
                  id="repassword"
                  type="password"
                  placeholder="Repeat new password"
                  className="pl-10 bg-zinc-950 border-zinc-700 focus-visible:ring-red-600"
                  value={repassword}
                  onChange={(e) => {
                    setRepassword(e.target.value);
                    if (errors.repassword)
                      setErrors((p) => ({ ...p, repassword: "" }));
                  }}
                />
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
                "Save New Password"
              )}
            </Button>
          </form>
        );

      // 3.4 Đổi mật khẩu thành công
      case "success":
        return (
          <div className="flex flex-col items-center gap-4 text-center">
            <CircleCheck className="size-16 text-green-500" />
            <h1 className="text-3xl font-bold">Password Reset!</h1>
            <p className="text-lg">{message}</p>
            <Button asChild className="mt-4">
              {/* Bạn có thể mở Dialog đăng nhập từ đây */}
              <Link to="/">Back to Home</Link>
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
