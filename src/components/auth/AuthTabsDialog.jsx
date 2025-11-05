import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { ScrollArea } from "../ui/scroll-area";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  loginUser,
  registerUser,
  submitResetPwInfo,
  verifyRegisterCode,
  verifyResetPwCode,
} from "@/services/authService";
import { setError } from "@/features/auth/authSlice";
import { actionTypes } from "@/constants/actionTypes";
import { toast } from "sonner";

export default function AuthTabsDialog({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState({
    password: false,
    repassword: false,
  });
  const { user, loading, error } = useSelector((s) => s.auth);

  const [open, setOpen] = useState(false);
  const [otpSessionId, setOtpSessionId] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [stepRegister, setStepRegister] = useState(null);
  const [stepForgot, setStepForgot] = useState(null);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [reg, setReg] = useState({
    email: "",
    name: "",
    password: "",
    repassword: "",
  });
  const [verifyCode, setVerifyCode] = useState("");
  const [errors, setErrors] = useState([]);
  const [fpEmail, setFpEmail] = useState("");
  const [tab, setTab] = useState("login");

  const validateRegister = () => {
    const e = [];

    // Email
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(reg.email.trim())) {
      e.push("Email không hợp lệ.");
    }

    // Họ và tên
    if (!reg.name.trim()) {
      e.push("Họ và tên không được để trống.");
    }

    // Mật khẩu mạnh
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\\[\]{}|:;"'<>,.?/~`]).{8,}$/;

    if (!strongPasswordRegex.test(reg.password)) {
      e.push(
        "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ thường, chữ hoa, số và ký tự đặc biệt."
      );
    }

    if (reg.password !== reg.repassword) {
      e.push("Mật khẩu nhập lại không khớp.");
    }

    setErrors(e);
    return e.length === 0;
  };
  const validateForgotPW = () => {
    const e = [];
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(fpEmail.trim())) {
      e.push("Email không hợp lệ.");
    }
    setErrors(e);
    return e.length === 0;
  };
  const validateLogin = () => {
    const e = [];

    // Email
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(login.email.trim())) {
      e.push("Email không hợp lệ.");
    }

    // Mật khẩu
    if (login.password.length == 0) {
      e.push("Mật khẩu không được để trống.");
    }

    setErrors(e);
    return e.length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateLogin()) return;

    try {
      // Gọi loginUser và nhận lại user từ /auth/me
      const user = await loginUser(dispatch, login.email, login.password);

      // Điều hướng theo role
      if (user) {
        toast.success("Đăng nhập thành công.");

        if (user?.data?.role === "admin" || user?.data?.role === "employee") {
          navigate("/admin-dashboard/dashboard");
        }
        setOpen(false);
      }
    } catch (err) {
      setErrors([err.response?.data?.message]);
      console.error("Đăng nhập thất bại", err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); /* TODO */
    if (!validateRegister()) return;
    try {
      const { otpSessionId, customerRegisterInfo } = await registerUser(
        dispatch,
        reg.email,
        reg.password,
        reg.name
      );

      setOtpSessionId(otpSessionId);
      setCustomerInfo(customerRegisterInfo);
      setStepRegister(actionTypes.CUSTOMER.VERIFY_REGISTER_CODE);
    } catch (err) {
      setErrors([err.response?.data?.message]);
      console.error(err);
    }
  };
  const handleVerifyOtp = async () => {
    if (verifyCode.length == 0) {
      setErrors(["Mã xác nhận không được để trống"]);
      return;
    }
    try {
      const res = await verifyRegisterCode(
        dispatch,
        otpSessionId,
        verifyCode,
        customerInfo
      );

      if (res?.success) {
        toast.success(
          res?.message + ". Vui lòng đăng nhập để sử dụng." ||
            "Xác minh thành công. Vui lòng đăng nhập!"
        );
        setTab("login");
        setStepRegister(null);
        setVerifyCode("");
        setReg({
          email: "",
          name: "",
          password: "",
          repassword: "",
        });
      }
    } catch (err) {
      setErrors([err.response?.data?.message]);
      console.error(err);
    }
  };
  const handleForgotPW = async (e) => {
    e?.preventDefault?.();
    if (!validateForgotPW()) return;

    try {
      const { otpSessionId } = await submitResetPwInfo(dispatch, fpEmail);
      setOtpSessionId(otpSessionId);
      setStepForgot(actionTypes.CUSTOMER.VERIFY_RESET_PW_CODE);
      toast.success("Đã gửi mã xác thực tới email của bạn");
    } catch (err) {
      setErrors([
        err.response?.data?.message || "Gửi yêu cầu khôi phục thất bại",
      ]);
      console.error(err);
    }
  };

  const handleVerifyResetPw = async () => {
    setErrors([]);
    if (!verifyCode?.trim()) {
      setErrors(["Mã xác nhận không được để trống"]);
      return;
    }
    if (!otpSessionId) {
      setErrors(["Thiếu thông tin phiên OTP, vui lòng gửi lại email"]);
      return;
    }

    try {
      const res = await verifyResetPwCode(dispatch, otpSessionId, verifyCode);
      if (res?.success) {
        toast.success(
          res?.message ||
            "Đặt lại mật khẩu thành công. Mật khẩu mới đã được gửi tới email."
        );
        setStepForgot(actionTypes.CUSTOMER.RESET_PW_SUBMIT_INFO);
        setVerifyCode("");
        setFpEmail("");
        setOtpSessionId(null);
        setTab("login");
      }
    } catch (err) {
      setErrors([err.response?.data?.message || "Xác minh mã thất bại"]);
      console.error(err);
    }
  };
  const handleForgot = async (ev) => {
    ev.preventDefault();
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(fpEmail.trim())) {
      return setErrors(["Email không hợp lệ."]);
    }
    try {
      alert("Đã gửi email reset!");
    } catch (err) {
      setErrors(["Không thể gửi email, thử lại sau."]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogTitle>
        <VisuallyHidden.Root>Auth</VisuallyHidden.Root>
      </DialogTitle>
      {/* —— Dialog —— */}
      <DialogContent className="p-0 w-[90vw] max-w-sm max-h-[90vh]">
        {/* —— Tabs —— */}
        <ScrollArea className={"h-full"}>
          <Tabs
            defaultValue="login"
            value={tab}
            className="w-full h-full flex flex-col "
            onValueChange={(val) => {
              setTab(val);
              setErrors([]);
            }}
          >
            {/* Tab bar */}
            <TabsList className="flex mt-2 ml-5">
              {["login", "register", "forgot-password"].map((val) => (
                <TabsTrigger key={val} value={val}>
                  {
                    {
                      login: "Đăng nhập",
                      register: "Đăng ký",
                      "forgot-password": "Quên mật khẩu",
                    }[val]
                  }
                </TabsTrigger>
              ))}
            </TabsList>

            {/* —— Login —— */}
            <TabsContent value="login" className="flex-1 overflow-y-auto">
              <Card className="border-0 shadow-none h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Đăng nhập tài khoản</CardTitle>
                  <CardDescription>
                    Nhập email và mật khẩu để tiếp tục
                  </CardDescription>
                </CardHeader>
                {errors.length > 0 && (
                  <Alert
                    variant="destructive"
                    className="mx-6 mt-2 mb-2 w-[90%]"
                  >
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Vui lòng kiểm tra lại</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc ml-5 space-y-1">
                        {errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <CardContent className="flex-1">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="grid gap-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        required
                        value={login.email}
                        onChange={(e) => {
                          setErrors([]);
                          dispatch(setError(null));
                          setLogin({ ...login, email: e.target.value });
                        }}
                      />
                    </div>

                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Mật khẩu</Label>
                      </div>

                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={login.password}
                          onChange={(e) => {
                            setErrors([]);
                            dispatch(setError(null));
                            setLogin({ ...login, password: e.target.value });
                          }}
                          className="pr-10"
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-auto w-auto"
                          onClick={() => setShowPassword((prev) => !prev)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>

                <CardFooter className="flex-col gap-2">
                  <Button
                    className="w-full"
                    onClick={handleLogin}
                    disabled={loading}
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Đăng nhập
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setOpen(false)}
                    disabled={loading}
                  >
                    Đóng
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* —— Register —— */}
            <TabsContent value="register" className="flex-1 overflow-y-auto">
              <Card className="border-0 shadow-none h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Tạo tài khoản mới</CardTitle>
                  <CardDescription>
                    {stepRegister == actionTypes.CUSTOMER.VERIFY_REGISTER_CODE
                      ? "Nhập mã xác nhận đã được gửi tới email đăng ký của bạn"
                      : "Nhập các thông tin cần thiết để đăng ký tài khoản"}
                  </CardDescription>
                </CardHeader>
                {errors.length > 0 && (
                  <Alert
                    variant="destructive"
                    className="mx-6 mt-2 mb-2 w-[90%]"
                  >
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Vui lòng kiểm tra lại</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc ml-5 space-y-1">
                        {errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <CardContent className="flex-1 space-y-4">
                  {stepRegister ===
                  actionTypes.CUSTOMER.VERIFY_REGISTER_CODE ? (
                    <>
                      <div className="grid gap-2">
                        <Label>Mã xác thực</Label>
                        <Input
                          type="text"
                          required
                          value={verifyCode}
                          onChange={(e) => {
                            setErrors([]);
                            dispatch(setError(null));
                            setVerifyCode(e.target.value);
                          }}
                        />
                      </div>

                      <a
                        href="#"
                        onClick={() => {
                          setStepRegister(null);
                          setVerifyCode("");
                          setErrors([]);
                          dispatch(setError(null));
                        }}
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-primary"
                      >
                        Gửi lại thông tin
                      </a>
                    </>
                  ) : (
                    [
                      {
                        label: "Email",
                        val: reg.email,
                        key: "email",
                        type: "email",
                      },
                      { label: "Họ và tên", val: reg.name, key: "name" },
                      {
                        label: "Mật khẩu",
                        val: reg.password,
                        key: "password",
                        type: "password",
                      },
                      {
                        label: "Nhập lại mật khẩu",
                        val: reg.repassword,
                        key: "repassword",
                        type: "password",
                      },
                    ].map((f) => (
                      <div className="grid gap-2" key={f.key}>
                        <Label>{f.label}</Label>
                        <div className="relative">
                          <Input
                            type={
                              f.type === "password" && showPassword[f.key]
                                ? "text"
                                : f.type || "text"
                            }
                            required
                            value={f.val}
                            onChange={(e) => {
                              setErrors([]);
                              dispatch(setError(null));
                              setReg({ ...reg, [f.key]: e.target.value });
                            }}
                            className={f.type === "password" ? "pr-10" : ""}
                          />

                          {f.type === "password" && (
                            <button
                              type="button"
                              onClick={() =>
                                setShowPassword((prev) => ({
                                  ...prev,
                                  [f.key]: !prev[f.key],
                                }))
                              }
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                            >
                              {showPassword[f.key] ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>

                <CardFooter className="flex-col gap-2">
                  <Button
                    className="w-full"
                    onClick={
                      stepRegister === actionTypes.CUSTOMER.VERIFY_REGISTER_CODE
                        ? handleVerifyOtp
                        : handleRegister
                    }
                    disabled={loading}
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {stepRegister === actionTypes.CUSTOMER.VERIFY_REGISTER_CODE
                      ? "Xác minh mã"
                      : "Đăng ký"}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setOpen(false)}
                    disabled={loading}
                  >
                    Đóng
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent
              value="forgot-password"
              className="flex-1 overflow-y-auto"
            >
              <Card className="border-0 shadow-none h-full flex flex-col">
                {/* Header */}
                <CardHeader>
                  <CardTitle>Khôi phục mật khẩu</CardTitle>
                  <CardDescription>
                    {stepForgot === actionTypes.CUSTOMER.VERIFY_RESET_PW_CODE
                      ? "Nhập mã xác nhận đã được gửi tới email đăng ký của bạn"
                      : "Nhập email của tài khoản cần khôi phục mật khẩu"}
                  </CardDescription>
                </CardHeader>

                {/* Alert lỗi */}
                {errors.length > 0 && (
                  <Alert
                    variant="destructive"
                    className="mx-6 mt-2 mb-2 w-[90%]"
                  >
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Vui lòng kiểm tra lại</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc ml-5 space-y-1">
                        {errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Body */}
                <CardContent className="flex-1 space-y-4">
                  {stepForgot === actionTypes.CUSTOMER.VERIFY_RESET_PW_CODE ? (
                    <>
                      {/* Verify code */}
                      <div className="grid gap-2">
                        <Label>Mã xác thực</Label>
                        <Input
                          type="text"
                          required
                          value={verifyCode}
                          onChange={(e) => {
                            setErrors([]);
                            dispatch(setError(null));
                            setVerifyCode(e.target.value);
                          }}
                          placeholder="Nhập mã gồm chữ/số"
                        />
                      </div>

                      {/* Quay lại bước 1 / Gửi lại */}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setStepForgot(
                            actionTypes.CUSTOMER.RESET_PW_SUBMIT_INFO
                          );
                          setVerifyCode("");
                          setErrors([]);
                          dispatch(setError(null));
                        }}
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-primary"
                      >
                        Gửi lại thông tin
                      </a>
                    </>
                  ) : (
                    <>
                      {/* Email */}
                      <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          required
                          value={fpEmail}
                          onChange={(e) => {
                            setErrors([]);
                            dispatch(setError(null));
                            setFpEmail(e.target.value);
                          }}
                          placeholder="you@example.com"
                        />
                      </div>
                    </>
                  )}
                </CardContent>

                {/* Footer */}
                <CardFooter className="flex-col gap-2">
                  <Button
                    className="w-full"
                    onClick={
                      stepForgot === actionTypes.CUSTOMER.VERIFY_RESET_PW_CODE
                        ? handleVerifyResetPw
                        : handleForgotPW
                    }
                    disabled={loading}
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {stepForgot === actionTypes.CUSTOMER.VERIFY_RESET_PW_CODE
                      ? "Xác minh mã"
                      : "Gửi mã xác minh"}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setOpen(false)}
                    disabled={loading}
                  >
                    Đóng
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
