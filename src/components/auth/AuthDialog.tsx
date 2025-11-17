import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, Loader2, User } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { loginAsync } from "@/features/auth/authThunks"; // Giả định
import { clearAuthError } from "@/features/auth/authSlice"; // Giả định
import type { ForgotPasswordRequest, LoginRequest, RegisterRequest } from "@/types/auth"; // Giả định
import { authApi } from "@/features/auth/authApi";

/* ─── Props ─── */
interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register" | "forgot";
}

const tabAnimation = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2 },
};

/* ─── Validation Helpers (Theo yêu cầu mới) ─── */

// 4. Validate định dạng email
const validateEmail = (email: string) => {
  if (!email) return "Vui lòng nhập email.";
  // Regex đơn giản kiểm tra @ và .
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Định dạng email không hợp lệ.";
  }
  return "";
};

// 2. Validate password
const validatePassword = (password: string) => {
  if (!password) return "Vui lòng nhập mật khẩu.";
  if (password.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự.";
  if (password.length > 16) return "Mật khẩu không được quá 16 ký tự.";
  if (!/(?=.*[a-z])/.test(password))
    return "Mật khẩu phải chứa ít nhất 1 ký tự thường.";
  if (!/(?=.*[A-Z])/.test(password))
    return "Mật khẩu phải chứa ít nhất 1 ký tự hoa.";
  // Ký tự đặc biệt là bất cứ thứ gì KHÔNG phải chữ/số
  if (!/(?=.*[^a-zA-Z0-9])/.test(password))
    return "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt.";
  if (/\s/.test(password)) return "Mật khẩu không được chứa khoảng trắng.";
  return "";
};

const validateRepassword = (pass: string, repass: string) => {
  if (!repass) return "Vui lòng nhập lại mật khẩu.";
  if (pass !== repass) return "Mật khẩu không khớp.";
  return "";
};

// 3 & 5. Validate username
const validateUsername = (username: string) => {
  if (!username) return "Vui lòng nhập tên hiển thị.";
  if (username.length > 128) return "Tên hiển thị không được quá 128 ký tự.";
  // 5. Chỉ cho phép chữ, số, gạch dưới, gạch ngang và khoảng trắng
  if (!/^[a-zA-Z0-9_ -]+$/.test(username)) {
    return "Tên hiển thị chứa ký tự không hợp lệ.";
  }
  return "";
};

export function AuthDialog({
  isOpen,
  onClose,
  defaultTab = "login",
}: AuthDialogProps) {
  /* ─── State cho Form ─── */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [username, setUsername] = useState("");
  // const [otp, setOtp] = useState(""); // <-- 1. Đã XÓA
  const [localLoading, setLocalLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);

  // STATE MỚI: Dành cho validation
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    username: "",
    repassword: "",
  });

  /* ─── State cho Navigation ─── */
  const [activeTab, setActiveTab] = useState(defaultTab);
  // const [registerStep, setRegisterStep] = useState<"form" | "otp">("form"); // <-- 1. Đã XÓA
  // const [forgotStep, setForgotStep] = useState<"form" | "otp">("form"); // <-- 1. Đã XÓA

  const dispatch = useDispatch<AppDispatch>();
  const { status } = useSelector((state: RootState) => state.auth);
  const isLoginLoading = status === "loading";

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setMessage({ type: "", text: "" });
      setLocalLoading(false);
      setActiveTab(defaultTab);
      // setRegisterStep("form"); // <-- 1. Đã XÓA
      // setForgotStep("form"); // <-- 1. Đã XÓA
      clearForm();
      dispatch(clearAuthError());
      clearForm();
      setErrors({ email: "", password: "", username: "" }); // Dọn dẹp lỗi
    }
  };

  /* ─── Helpers ─── */
  const clearForm = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setRepassword("");
  };

  // 1. LOGIN (Cập nhật: Thêm validate)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // 4. Validate email
    const emailErr = validateEmail(email);
    if (emailErr) {
      setErrors((prev) => ({ ...prev, email: emailErr }));
      return;
    }

    try {
      const credentials: LoginRequest = { email, password };
      await dispatch(loginAsync(credentials)).unwrap();
      onClose(); // Thành công
    } catch (err: any) {
      console.error("Login failed:", err);
      // Lỗi đã được xử lý bởi interceptor (hiện modal)
      // hoặc bạn có thể set lỗi local ở đây nếu cần
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    // 6.1. đổi thành async
    e.preventDefault();

    // Chạy tất cả validation
    const userErr = validateUsername(username);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    // 6.2. Thêm validate repassword
    const repassErr = validateRepassword(password, repassword);

    if (userErr || emailErr || passErr || repassErr) {
      setErrors({
        username: userErr,
        email: emailErr,
        password: passErr,
        repassword: repassErr, // 6.3. Set lỗi
      });
      return; // Dừng lại nếu có lỗi
    }

    setLocalLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const registerData: RegisterRequest = {
        name: username,
        email,
        password,
        repassword,
      };

      // 6.4. Gọi API thật
      await authApi.register(registerData);

      setMessage({
        type: "success",
        text: "Registration successful! Please check your email for verification.",
      });
      clearForm();
    } catch (error: any) {
   
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred.";

      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLocalLoading(false);
    }
  };


  const handleForgot = async (e: React.FormEvent) => {
    // 3.1 Thêm async
    e.preventDefault();

    const emailErr = validateEmail(email);
    if (emailErr) {
      setErrors((prev) => ({ ...prev, email: emailErr }));
      return;
    }

    setLocalLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const req: ForgotPasswordRequest = { email };
      // 3.2 Gọi API thật
      const result = await authApi.forgotPassword(req);

      // 3.3 Hiển thị thông báo thành công từ backend
      // (Backend của bạn luôn trả về success cho API này)
      setMessage({
        type: "success",
        // Dùng tiếng Anh
        text:
          result.message ||
          "If that email is in our system, we've sent instructions.",
      });
      clearForm();
    } catch (error: any) {
      // 3.4 Hiển thị lỗi (ví dụ: 60s cooldown)
      const errorMsg =
        error.response?.data?.message || "An error occurred. Please try again.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLocalLoading(false);
    }
  };

  // Helper để hiển thị thông báo lỗi/thành công chung
  const renderMessage = () => {
    if (!message.text) return null;
    return (
      <div
        className={`p-2 rounded text-sm mb-4 ${
          message.type === "error"
            ? "bg-red-900 text-red-100"
            : "bg-green-900 text-green-100"
        }`}
      >
        {message.text}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800 text-white p-0 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setMessage({ type: "", text: "" }); // Xóa message khi đổi tab
            setErrors({
              email: "",
              password: "",
              username: "",
              repassword: "",
            }); // Xóa lỗi khi đổi tab
            setActiveTab(value as any);
            dispatch(clearAuthError());
            clearForm();
          }}
          className="w-full"
        >
          <TabsList className="grid w-3/4 grid-cols-3 h-10 bg-zinc-950/50">
            {/* ... TabsTrigger (không đổi) ... */}
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-300"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-300"
            >
              Register
            </TabsTrigger>
            <TabsTrigger
              value="forgot"
              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-300"
            >
              Reset
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* ─── 1. Login Tab (Cập nhật: Thêm validate error) ─── */}
              {activeTab === "login" && (
                <TabsContent value="login" forceMount>
                  <motion.div {...tabAnimation}>
                    <DialogHeader className="text-left mb-4">
                      {/* ... Header (không đổi) ... */}
                      <DialogTitle>Welcome Back</DialogTitle>
                      <DialogDescription className="text-zinc-400">
                        Sign in to access your account.
                      </DialogDescription>
                    </DialogHeader>
                    {renderMessage()}
                    <form onSubmit={handleLogin} className="space-y-4">
                      {/* ... Input Email ... */}
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10 bg-zinc-950 border-zinc-700 focus-visible:ring-red-600"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email)
                                setErrors((p) => ({ ...p, email: "" }));
                            }}
                            required
                          />
                        </div>
                        {/* Hiển thị lỗi validation */}
                        {errors.email && (
                          <p className="text-xs text-red-500">{errors.email}</p>
                        )}
                      </div>
                      {/* ... Input Password (Không đổi) ... */}
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10 bg-zinc-950 border-zinc-700 focus-visible:ring-red-600"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          {/* ... Nút ẩn/hiện (không đổi) ... */}
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={
                              showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full text-white bg-red-600 hover:bg-red-700"
                        disabled={isLoginLoading}
                      >
                        {isLoginLoading ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          "Login"
                        )}
                      </Button>
                    </form>
                  </motion.div>
                </TabsContent>
              )}

              {/* ─── 2. Register Tab (Cập nhật: Xóa step 2, thêm validate) ─── */}
              {activeTab === "register" && (
                <TabsContent value="register" forceMount>
                  {/* Bỏ AnimatePresence lồng nhau vì không còn step */}
                  <motion.div {...tabAnimation}>
                    <DialogHeader className="text-left mb-4">
                      {/* ... Header (không đổi) ... */}
                      <DialogTitle>Create Account</DialogTitle>
                      <DialogDescription className="text-zinc-400">
                        Get started by creating a new account.
                      </DialogDescription>
                    </DialogHeader>
                    {renderMessage()}
                    <form onSubmit={handleRegister} className="space-y-4">
                      {/* ... Input Username ... */}
                      <div className="space-y-2">
                        <Label htmlFor="reg-username">Username</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                          <Input
                            id="reg-username"
                            placeholder="your_username"
                            className="pl-10 bg-zinc-950 border-zinc-700 focus-visible:ring-red-600"
                            value={username}
                            onChange={(e) => {
                              setUsername(e.target.value);
                              if (errors.username)
                                setErrors((p) => ({ ...p, username: "" }));
                            }}
                            required
                          />
                        </div>
                        {/* Hiển thị lỗi validation */}
                        {errors.username && (
                          <p className="text-xs text-red-500">
                            {errors.username}
                          </p>
                        )}
                      </div>
                      {/* ... Input Email ... */}
                      <div className="space-y-2">
                        <Label htmlFor="reg-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                          <Input
                            id="reg-email"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10 bg-zinc-950 border-zinc-700 focus-visible:ring-red-600"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email)
                                setErrors((p) => ({ ...p, email: "" }));
                            }}
                            required
                          />
                        </div>
                        {/* Hiển thị lỗi validation */}
                        {errors.email && (
                          <p className="text-xs text-red-500">{errors.email}</p>
                        )}
                      </div>
                      {/* ... Input Password ... */}
                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                          <Input
                            id="reg-password"
                            type="password"
                            placeholder="Min. 8 characters"
                            className="pl-10 bg-zinc-950 border-zinc-700 focus-visible:ring-red-600"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (errors.password)
                                setErrors((p) => ({ ...p, password: "" }));
                            }}
                            required
                          />
                        </div>
                        {/* Hiển thị lỗi validation */}
                        {errors.password && (
                          <p className="text-xs text-red-500">
                            {errors.password}
                          </p>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="reg-repassword">
                            Confirm Password
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                            <Input
                              id="reg-repassword"
                              type="password"
                              placeholder="Repeat your password"
                              className="pl-10 bg-zinc-950 border-zinc-700 focus-visible:ring-red-600"
                              value={repassword}
                              onChange={(e) => {
                                setRepassword(e.target.value);
                                if (errors.repassword)
                                  setErrors((p) => ({ ...p, repassword: "" }));
                              }}
                              required
                            />
                          </div>
                          {/* Hiển thị lỗi validation */}
                          {errors.repassword && (
                            <p className="text-xs text-red-500">
                              {errors.repassword}
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                        disabled={localLoading}
                      >
                        {localLoading ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          "Continue"
                        )}
                      </Button>
                    </form>
                  </motion.div>
                </TabsContent>
              )}

              {/* ─── 3. Forgot Tab (Cập nhật: Xóa step 2, thêm validate) ─── */}
              {activeTab === "forgot" && (
                <TabsContent value="forgot" forceMount>
                  {/* Bỏ AnimatePresence lồng nhau vì không còn step */}
                  <motion.div {...tabAnimation}>
                    <DialogHeader className="text-left mb-4">
                      {/* ... Header (không đổi) ... */}
                      <DialogTitle>Reset Password</DialogTitle>
                      <DialogDescription className="text-zinc-400">
                        We'll send a password reset code to your email.
                      </DialogDescription>
                    </DialogHeader>
                    {renderMessage()}
                    <form onSubmit={handleForgot} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder="Enter your registered email"
                            className="pl-10 bg-zinc-950 border-zinc-700 focus-visible:ring-red-600"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email)
                                setErrors((p) => ({ ...p, email: "" }));
                            }}
                            required
                          />
                        </div>
                        {/* Hiển thị lỗi validation */}
                        {errors.email && (
                          <p className="text-xs text-red-500">{errors.email}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                        disabled={localLoading}
                      >
                        {localLoading ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          "Send Reset Code"
                        )}
                      </Button>
                    </form>
                  </motion.div>
                </TabsContent>
              )}
            </AnimatePresence>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
