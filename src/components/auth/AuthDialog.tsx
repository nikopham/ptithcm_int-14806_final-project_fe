import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, Loader2, User, LogIn, UserPlus, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";

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
import { useGoogleLogin } from "@react-oauth/google";
import { loginAsync, loginByGoogleAsync } from "@/features/auth/authThunks"; // Giả định
import { clearAuthError } from "@/features/auth/authSlice"; // Giả định
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
} from "@/types/auth"; // Giả định
import { authApi } from "@/features/auth/authApi";

import { toast } from "sonner";

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
  if (!/(?=.*\d)/.test(password)) return "Mật khẩu phải chứa ít nhất 1 chữ số.";
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
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegRepassword, setShowRegRepassword] = useState(false);

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
  const { status, isAuth } = useSelector((state: RootState) => state.auth);
  const isLoginLoading = status === "loading";

  // Tự động đóng dialog khi login thành công
  useEffect(() => {
    if (isAuth && isOpen) {
      onClose();
    }
  }, [isAuth, isOpen, onClose]);

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      // Gọi Thunk và unwrap để xử lý chuyển trang
      try {
        await dispatch(loginByGoogleAsync(codeResponse.code)).unwrap();
        // Không cần navigate ở đây nếu bạn dùng useEffect theo dõi isAuth
        // Hoặc navigate("/") nếu cần
        onClose();
      } catch (err) {
        console.error("Google login failed", err);
      }
    },
    onError: () => toast.error("Đăng nhập thất bại"),
  });

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
      setErrors({ email: "", password: "", username: "", repassword: "" }); // Dọn dẹp lỗi
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
      // onClose() sẽ được gọi tự động bởi useEffect khi isAuth = true
      // Không cần gọi onClose() ở đây nữa
    } catch (err: unknown) {
      console.error("Login failed:", err);
      // Hiển thị lỗi cụ thể cho user
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again.";
      setMessage({ type: "error", text: errorMessage });
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
    } catch (error: unknown) {
      let errorMsg = "An unknown error occurred.";
      if (typeof error === "object" && error !== null) {
        const anyErr = error as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        errorMsg = anyErr.response?.data?.message || anyErr.message || errorMsg;
      }
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
    } catch (error: unknown) {
      // 3.4 Hiển thị lỗi (ví dụ: 60s cooldown)
      let errorMsg = "An error occurred. Please try again.";
      if (typeof error === "object" && error !== null) {
        const anyErr = error as { response?: { data?: { message?: string } } };
        errorMsg = anyErr.response?.data?.message || errorMsg;
      }
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
        className={`flex items-center gap-2 p-3 rounded-lg text-sm mb-4 border ${
          message.type === "error"
            ? "bg-red-50 text-red-700 border-red-200"
            : "bg-green-50 text-green-700 border-green-200"
        }`}
      >
        {message.type === "error" ? (
          <AlertCircle className="size-4 flex-shrink-0" style={{ color: "#C40E61" }} />
        ) : (
          <CheckCircle2 className="size-4 flex-shrink-0" style={{ color: "#C40E61" }} />
        )}
        <span>{message.text}</span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-white border-gray-200 text-gray-900 p-0 overflow-hidden shadow-xl">
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
            setActiveTab(value as "login" | "register" | "forgot");
            dispatch(clearAuthError());
            clearForm();
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 h-12 bg-gray-50 border-b border-gray-200 rounded-none">
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-white data-[state=active]:text-[#C40E61] data-[state=active]:border-b-2 data-[state=active]:border-[#C40E61] text-gray-600 font-medium transition-all duration-200"
            >
              <LogIn className="size-4 mr-2" />
              Đăng Nhập
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="data-[state=active]:bg-white data-[state=active]:text-[#C40E61] data-[state=active]:border-b-2 data-[state=active]:border-[#C40E61] text-gray-600 font-medium transition-all duration-200"
            >
              <UserPlus className="size-4 mr-2" />
              Đăng Ký
            </TabsTrigger>
            <TabsTrigger
              value="forgot"
              className="data-[state=active]:bg-white data-[state=active]:text-[#C40E61] data-[state=active]:border-b-2 data-[state=active]:border-[#C40E61] text-gray-600 font-medium transition-all duration-200"
            >
              <KeyRound className="size-4 mr-2" />
              Đặt Lại
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* ─── 1. Login Tab (Cập nhật: Thêm validate error) ─── */}
              {activeTab === "login" && (
                <TabsContent value="login" forceMount>
                  <motion.div {...tabAnimation}>
                    <DialogHeader className="text-left mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: "#C40E61" }}>
                          <LogIn className="size-5 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-gray-900">Chào Mừng Trở Lại</DialogTitle>
                      </div>
                      <DialogDescription className="text-gray-600">
                        Đăng nhập để truy cập tài khoản của bạn.
                      </DialogDescription>
                    </DialogHeader>
                    {renderMessage()}
                    <form onSubmit={handleLogin} className="space-y-4">
                      {/* ... Input Email ... */}
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10 bg-white border-gray-300 text-gray-900 focus:border-[#C40E61] focus:ring-[#C40E61]"
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
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="size-3" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                      {/* ... Input Password (Không đổi) ... */}
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">Mật Khẩu</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10 bg-white border-gray-300 text-gray-900 focus:border-[#C40E61] focus:ring-[#C40E61]"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
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
                        className="w-full text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                        style={{ backgroundColor: "#C40E61" }}
                        disabled={isLoginLoading}
                      >
                        {isLoginLoading ? (
                          <>
                            <Loader2 className="animate-spin mr-2 size-4" />
                            Đang đăng nhập...
                          </>
                        ) : (
                          <>
                            <LogIn className="mr-2 size-4" />
                            Đăng Nhập
                          </>
                        )}
                      </Button>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-3 text-gray-500 font-medium">
                            Hoặc tiếp tục với
                          </span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                        disabled={status === "loading"}
                        onClick={() => googleLogin()}
                      >
                        <svg className="mr-2 size-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Đăng nhập với Google
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
                    <DialogHeader className="text-left mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: "#C40E61" }}>
                          <UserPlus className="size-5 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-gray-900">Tạo Tài Khoản</DialogTitle>
                      </div>
                      <DialogDescription className="text-gray-600">
                        Bắt đầu bằng cách tạo tài khoản mới.
                      </DialogDescription>
                    </DialogHeader>
                    {renderMessage()}
                    <form onSubmit={handleRegister} className="space-y-4">
                      {/* ... Input Username ... */}
                      <div className="space-y-2">
                        <Label htmlFor="reg-username" className="text-sm font-medium text-gray-700">Tên Hiển Thị</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                          <Input
                            id="reg-username"
                            placeholder="your_username"
                            className="pl-10 bg-white border-gray-300 text-gray-900 focus:border-[#C40E61] focus:ring-[#C40E61]"
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
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="size-3" />
                            {errors.username}
                          </p>
                        )}
                      </div>
                      {/* ... Input Email ... */}
                      <div className="space-y-2">
                        <Label htmlFor="reg-email" className="text-sm font-medium text-gray-700">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                          <Input
                            id="reg-email"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10 bg-white border-gray-300 text-gray-900 focus:border-[#C40E61] focus:ring-[#C40E61]"
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
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="size-3" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                      {/* ... Input Password ... */}
                      <div className="space-y-2">
                        <Label htmlFor="reg-password" className="text-sm font-medium text-gray-700">Mật Khẩu</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                          <Input
                            id="reg-password"
                            type={showRegPassword ? "text" : "password"}
                            placeholder="Tối thiểu 8 ký tự"
                            className="pl-10 pr-10 bg-white border-gray-300 text-gray-900 focus:border-[#C40E61] focus:ring-[#C40E61]"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (errors.password)
                                setErrors((p) => ({ ...p, password: "" }));
                            }}
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            aria-label={
                              showRegPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                            }
                          >
                            {showRegPassword ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                        </div>
                        {/* Hiển thị lỗi validation */}
                        {errors.password && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="size-3" />
                            {errors.password}
                          </p>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="reg-repassword" className="text-sm font-medium text-gray-700">
                            Xác Nhận Mật Khẩu
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                            <Input
                              id="reg-repassword"
                              type={showRegRepassword ? "text" : "password"}
                              placeholder="Nhập lại mật khẩu"
                              className="pl-10 pr-10 bg-white border-gray-300 text-gray-900 focus:border-[#C40E61] focus:ring-[#C40E61]"
                              value={repassword}
                              onChange={(e) => {
                                setRepassword(e.target.value);
                                if (errors.repassword)
                                  setErrors((p) => ({ ...p, repassword: "" }));
                              }}
                              required
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              onClick={() =>
                                setShowRegRepassword(!showRegRepassword)
                              }
                              aria-label={
                                showRegRepassword
                                  ? "Ẩn mật khẩu"
                                  : "Hiện mật khẩu"
                              }
                            >
                              {showRegRepassword ? (
                                <EyeOff className="size-4" />
                              ) : (
                                <Eye className="size-4" />
                              )}
                            </button>
                          </div>
                          {/* Hiển thị lỗi validation */}
                          {errors.repassword && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="size-3" />
                              {errors.repassword}
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                        style={{ backgroundColor: "#C40E61" }}
                        disabled={localLoading}
                      >
                        {localLoading ? (
                          <>
                            <Loader2 className="animate-spin mr-2 size-4" />
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-2 size-4" />
                            Tạo Tài Khoản
                          </>
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
                    <DialogHeader className="text-left mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: "#C40E61" }}>
                          <KeyRound className="size-5 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-gray-900">Đặt Lại Mật Khẩu</DialogTitle>
                      </div>
                      <DialogDescription className="text-gray-600">
                        Chúng tôi sẽ gửi mã đặt lại mật khẩu đến email của bạn.
                      </DialogDescription>
                    </DialogHeader>
                    {renderMessage()}
                    <form onSubmit={handleForgot} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email" className="text-sm font-medium text-gray-700">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder="Nhập email đã đăng ký"
                            className="pl-10 bg-white border-gray-300 text-gray-900 focus:border-[#C40E61] focus:ring-[#C40E61]"
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
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="size-3" />
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                        style={{ backgroundColor: "#C40E61" }}
                        disabled={localLoading}
                      >
                        {localLoading ? (
                          <>
                            <Loader2 className="animate-spin mr-2 size-4" />
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <KeyRound className="mr-2 size-4" />
                            Gửi Mã Đặt Lại
                          </>
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
