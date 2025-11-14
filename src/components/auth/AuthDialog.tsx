// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Mail, Lock, User, Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "@/components/ui/tabs";

// /* ─── Props ─── */
// interface AuthDialogProps {
//   isOpen: boolean;
//   onClose: () => void;
//   defaultTab?: "login" | "register" | "forgot";
// }

// // 2. Định nghĩa hiệu ứng cho Tab
// const tabAnimation = {
//   initial: { opacity: 0, y: 10 },
//   animate: { opacity: 1, y: 0 },
//   exit: { opacity: 0, y: -10 },
//   transition: { duration: 0.2 }
// };

// export function AuthDialog({
//   isOpen,
//   onClose,
//   defaultTab = "login"
// }: AuthDialogProps) {

//   // State chung cho các form
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [username, setUsername] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [message, setMessage] = useState({ type: "", text: "" });

//   // State để điều khiển tab, cần cho AnimatePresence
//   const [activeTab, setActiveTab] = useState(defaultTab);

//   const handleOpenChange = (open: boolean) => {
//     if (!open) {
//       onClose();
//       // Reset state khi đóng
//       setMessage({ type: "", text: "" });
//       setIsLoading(false);
//       setActiveTab(defaultTab); // Reset về tab mặc định
//     }
//   };

//   /* ─── Handlers (Giả lập) ─── */
//   const handleLogin = (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setMessage({ type: "", text: "" }); // Xóa thông báo cũ
//     console.log("Login:", { email, password });
//     setTimeout(() => {
//         setIsLoading(false);
//         setMessage({ type: "error", text: "Invalid credentials (demo)." });
//     }, 1500);
//   };

//   const handleRegister = (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setMessage({ type: "", text: "" });
//     console.log("Register:", { username, email, password });
//     setTimeout(() => {
//         setIsLoading(false);
//         setMessage({ type: "success", text: "Account created! Please log in." });
//         setActiveTab("login"); // Tự động chuyển qua tab login
//     }, 1500);
//   };

//   const handleForgot = (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setMessage({ type: "", text: "" });
//     console.log("Forgot:", { email });
//     setTimeout(() => {
//         setIsLoading(false);
//         setMessage({ type: "success", text: "Password reset link sent!" });
//     }, 1500);
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={handleOpenChange}>
//       {/* Thêm overflow-hidden để hiệu ứng không bị tràn */}
//       <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800 text-white p-0 overflow-hidden">

//         <Tabs
//             value={activeTab} // Điều khiển Tab bằng state
//             onValueChange={(value) => {
//                 setMessage({ type: "", text: "" }); // Xóa message khi chuyển tab
//                 setActiveTab(value as any);
//             }}
//             className="w-full pt-12"
//         >

//           {/* ─── Tab Triggers (Nav) ─── */}
//           <TabsList className="grid w-full grid-cols-3 rounded-b-nonx`e h-12 bg-zinc-950/50 px-2 ">
//             <TabsTrigger value="login" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-300">Login</TabsTrigger>
//             <TabsTrigger value="register" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-300">Register</TabsTrigger>
//             <TabsTrigger value="forgot" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-300">Reset</TabsTrigger>
//           </TabsList>

//           {/* 3. Bọc nội dung bằng AnimatePresence */}
//           <div className="p-6">
//             <AnimatePresence mode="wait">

//               {/* ─── 1. Login Tab ─── */}
//               {activeTab === "login" && (
//                 <TabsContent value="login" forceMount>
//                   <motion.div {...tabAnimation}> {/* Apply animation */}
//                     <DialogHeader className="text-left mb-4">
//                       <DialogTitle>Welcome Back</DialogTitle>
//                       <DialogDescription className="text-zinc-400">
//                         Sign in to access your account.
//                       </DialogDescription>
//                     </DialogHeader>
//                     <form onSubmit={handleLogin} className="space-y-4">
//                       <div className="space-y-2">
//                         <Label htmlFor="login-email">Email</Label>
//                         <div className="relative">
//                           <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
//                           <Input id="login-email" type="email" placeholder="you@example.com" className="pl-10 bg-zinc-950 border-zinc-700 focus-visible:ring-red-600" value={email} onChange={e => setEmail(e.target.value)} required />
//                         </div>
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="login-password">Password</Label>
//                         <div className="relative">
//                           <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
//                           <Input id="login-password" type="password" placeholder="••••••••" className="pl-10 bg-zinc-950 border-zinc-700 focus-visible:ring-red-600" value={password} onChange={e => setPassword(e.target.value)} required />
//                         </div>
//                       </div>

//                       {/* 4. Vị trí Message mới */}
//                       {message.text && message.type === "error" && (
//                         <div className="text-center text-sm p-2 rounded-md bg-red-900/30 text-red-400">
//                           {message.text}
//                         </div>
//                       )}

//                       <Button type="submit" className="w-full text-white bg-red-600 hover:bg-red-700" disabled={isLoading}>
//                         {isLoading ? <Loader2 className="animate-spin" /> : "Login"}
//                       </Button>
//                     </form>
//                   </motion.div>
//                 </TabsContent>
//               )}

//               {/* ─── 2. Register Tab ─── */}
//               {activeTab === "register" && (
//                 <TabsContent value="register" forceMount>
//                   <motion.div {...tabAnimation}>
//                     <DialogHeader className="text-left mb-4">
//                       <DialogTitle>Create Account</DialogTitle>
//                       <DialogDescription className="text-zinc-400">
//                         Get started by creating a new account.
//                       </DialogDescription>
//                     </DialogHeader>
//                     <form onSubmit={handleRegister} className="space-y-4">
//                       <div className="space-y-2">
//                         <Label htmlFor="reg-username">Username</Label>
//                         <div className="relative">
//                           <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
//                           <Input id="reg-username" placeholder="your_username" className="pl-10 bg-zinc-950 border-zinc-700 focus-visible:ring-red-600" value={username} onChange={e => setUsername(e.target.value)} required />
//                         </div>
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="reg-email">Email</Label>
//                         <div className="relative">
//                           <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
//                           <Input id="reg-email" type="email" placeholder="you@example.com" className="pl-10 bg-zinc-950 border-zinc-700 focus-visible:ring-red-600" value={email} onChange={e => setEmail(e.target.value)} required />
//                         </div>
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="reg-password">Password</Label>
//                         <div className="relative">
//                           <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
//                           <Input id="reg-password" type="password" placeholder="Min. 8 characters" className="pl-10 bg-zinc-950 border-zinc-700 focus-visible:ring-red-600" value={password} onChange={e => setPassword(e.target.value)} required />
//                         </div>
//                       </div>

//                       {/* 4. Vị trí Message mới */}
//                       {message.text && message.type === "success" && (
//                         <div className="text-center text-sm p-2 rounded-md bg-emerald-900/30 text-emerald-400">
//                           {message.text}
//                         </div>
//                       )}

//                       {/* Sửa hover color từ teal -> red */}
//                       <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
//                         {isLoading ? <Loader2 className="animate-spin" /> : "Create Account"}
//                       </Button>
//                     </form>
//                   </motion.div>
//                 </TabsContent>
//               )}

//               {/* ─── 3. Forgot Password Tab ─── */}
//               {activeTab === "forgot" && (
//                 <TabsContent value="forgot" forceMount>
//                   <motion.div {...tabAnimation}>
//                     <DialogHeader className="text-left mb-4">
//                       <DialogTitle>Reset Password</DialogTitle>
//                       <DialogDescription className="text-zinc-400">
//                         We'll send a password reset link to your email.
//                       </DialogDescription>
//                     </DialogHeader>
//                     <form onSubmit={handleForgot} className="space-y-4">
//                       <div className="space-y-2">
//                         <Label htmlFor="forgot-email">Email</Label>
//                         <div className="relative">
//                           <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
//                           <Input id="forgot-email" type="email" placeholder="Enter your registered email" className="pl-10 bg-zinc-950 border-zinc-700 focus-visible:ring-red-600" value={email} onChange={e => setEmail(e.target.value)} required />
//                         </div>
//                       </div>

//                       {/* 4. Vị trí Message mới */}
//                       {message.text && (
//                         <div className={`text-center text-sm p-2 rounded-md ${
//                           message.type === 'error'
//                           ? 'bg-red-900/30 text-red-400' // Sửa lỗi text-white-400
//                           : 'bg-emerald-900/30 text-emerald-400'
//                         }`}>
//                           {message.text}
//                         </div>
//                       )}

//                       <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
//                         {isLoading ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
//                       </Button>
//                     </form>
//                   </motion.div>
//                 </TabsContent>
//               )}
//             </AnimatePresence>
//           </div>

//         </Tabs>
//       </DialogContent>
//     </Dialog>
//   );
// }

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export function AuthDialog({
  isOpen,
  onClose,
  defaultTab = "login",
}: AuthDialogProps) {
  /* ─── State cho Form ─── */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  /* ─── State cho Navigation ─── */
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [registerStep, setRegisterStep] = useState<"form" | "otp">("form"); 
  const [forgotStep, setForgotStep] = useState<"form" | "otp">("form"); 

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      // Reset toàn bộ state khi đóng
      setMessage({ type: "", text: "" });
      setIsLoading(false);
      setActiveTab(defaultTab);
      setRegisterStep("form"); 
      setForgotStep("form"); 
      setOtp("");
    }
  };

  /* ─── Helpers ─── */
  const clearForm = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setOtp("");
  };

  /* ─── Handlers (Giả lập) ─── */

  // 1. LOGIN
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    setTimeout(() => {
      setIsLoading(false);
      setMessage({ type: "error", text: "Invalid credentials (demo)." });
    }, 1500);
  };

  // 2. REGISTER (Step 1: Gửi form)
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    console.log("Register:", { username, email, password });
    setTimeout(() => {
      setIsLoading(false);
      // THÀNH CÔNG: Chuyển sang bước 2 (OTP)
      setRegisterStep("otp");
      setOtp(""); // Xóa field OTP cũ
    }, 1500);
  };

  // 3. REGISTER (Step 2: Gửi OTP)
  const handleRegisterOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    console.log("Register OTP:", { email, otp });
    setTimeout(() => {
      setIsLoading(false);
      if (otp === "123456") {
        // Giả lập OTP đúng
        setMessage({
          type: "success",
          text: "Account created! Please log in.",
        });
        setActiveTab("login"); // Chuyển sang tab Login
        setRegisterStep("form"); // Reset về step 1
        clearForm();
      } else {
        setMessage({ type: "error", text: "Invalid OTP. Please try again." });
      }
    }, 1500);
  };

  // 4. FORGOT (Step 1: Gửi email)
  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    console.log("Forgot:", { email });
    setTimeout(() => {
      setIsLoading(false);
      // THÀNH CÔNG: Chuyển sang bước 2 (OTP)
      setForgotStep("otp");
      setOtp(""); // Xóa field OTP cũ
    }, 1500);
  };

  // 5. FORGOT (Step 2: Gửi OTP)
  const handleForgotOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    console.log("Forgot OTP:", { email, otp });
    setTimeout(() => {
      setIsLoading(false);
      if (otp === "123456") {
        // Giả lập OTP đúng
        setMessage({ type: "success", text: "Password reset. Please log in." });
        setActiveTab("login"); // Chuyển sang tab Login
        setForgotStep("form"); // Reset về step 1
        clearForm();
      } else {
        setMessage({ type: "error", text: "Invalid OTP. Please try again." });
      }
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800 text-white p-0 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setMessage({ type: "", text: "" });
            setActiveTab(value as any);
          }}
          className="w-full pt-12"
        >
          {/* Sửa lỗi: rounded-b-none và xóa px-2 */}
          <TabsList className="grid w-full grid-cols-3 rounded-b-none h-12 bg-zinc-950/50 px-2">
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
              Reset Password
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* ─── 1. Login Tab ─── */}
              {activeTab === "login" && (
                <TabsContent value="login" forceMount>
                  <motion.div {...tabAnimation}>
                    <DialogHeader className="text-left mb-4">
                      <DialogTitle>Welcome Back</DialogTitle>
                      <DialogDescription className="text-zinc-400">
                        Sign in to access your account.
                      </DialogDescription>
                    </DialogHeader>
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
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      {/* ... Input Password ... */}
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 bg-zinc-950 border-zinc-700 focus-visible:ring-red-600"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {message.text && message.type === "error" && (
                        <div className="text-center text-sm p-2 rounded-md bg-red-900/30 text-red-400">
                          {message.text}
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full text-white bg-red-600 hover:bg-red-700"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          "Login"
                        )}
                      </Button>
                    </form>
                  </motion.div>
                </TabsContent>
              )}

              {/* ─── 2. Register Tab (Có 2 bước) ─── */}
              {activeTab === "register" && (
                <TabsContent value="register" forceMount>
                  {/* AnimatePresence lồng nhau để chuyển step */}
                  <AnimatePresence mode="wait">
                    {registerStep === "form" ? (
                      /* ─── Step 1: Form Register ─── */
                      <motion.div key="reg-form" {...tabAnimation}>
                        <DialogHeader className="text-left mb-4">
                          <DialogTitle>Create Account</DialogTitle>
                          <DialogDescription className="text-zinc-400">
                            Get started by creating a new account.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleRegister} className="space-y-4">
                          {/* ... Input Username, Email, Password ... */}
                          <div className="space-y-2">
                            <Label htmlFor="reg-username">Username</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                              <Input
                                id="reg-username"
                                placeholder="your_username"
                                className="pl-10 bg-zinc-950 border-zinc-700 focus-visible:ring-red-600"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                              />
                            </div>
                          </div>
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
                                onChange={(e) => setEmail(e.target.value)}
                                required
                              />
                            </div>
                          </div>
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
                                onChange={(e) => setPassword(e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              "Continue"
                            )}
                          </Button>
                        </form>
                      </motion.div>
                    ) : (
                      /* ─── Step 2: Form OTP ─── */
                      <motion.div key="reg-otp" {...tabAnimation}>
                        <DialogHeader className="text-left mb-4">
                          <DialogTitle>Check your Email</DialogTitle>
                          <DialogDescription className="text-zinc-400">
                            We sent a 6-digit code to{" "}
                            <strong className="text-white">{email}</strong>.
                          </DialogDescription>
                        </DialogHeader>
                        <form
                          onSubmit={handleRegisterOtp}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="reg-otp">Verification Code</Label>
                            <div className="relative">
                              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                              <Input
                                id="reg-otp"
                                placeholder="123456"
                                className="pl-10 text-center tracking-[0.3em] bg-zinc-950 border-zinc-700 focus-visible:ring-red-600"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                required
                              />
                            </div>
                          </div>

                          {message.text && (
                            <div
                              className={`text-center text-sm p-2 rounded-md ${
                                message.type === "error"
                                  ? "bg-red-900/30 text-red-400"
                                  : "bg-emerald-900/30 text-emerald-400"
                              }`}
                            >
                              {message.text}
                            </div>
                          )}

                          <Button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              "Verify Account"
                            )}
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            className="w-full text-zinc-400 hover:text-white"
                            type="button"
                            onClick={() => setRegisterStep("form")}
                          >
                            Back to Register
                          </Button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>
              )}

              {/* ─── 3. Forgot Tab (Có 2 bước) ─── */}
              {activeTab === "forgot" && (
                <TabsContent value="forgot" forceMount>
                  <AnimatePresence mode="wait">
                    {forgotStep === "form" ? (
                      /* ─── Step 1: Form Forgot ─── */
                      <motion.div key="forgot-form" {...tabAnimation}>
                        <DialogHeader className="text-left mb-4">
                          <DialogTitle>Reset Password</DialogTitle>
                          <DialogDescription className="text-zinc-400">
                            We'll send a password reset code to your email.
                          </DialogDescription>
                        </DialogHeader>
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
                                onChange={(e) => setEmail(e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              "Send Reset Code"
                            )}
                          </Button>
                        </form>
                      </motion.div>
                    ) : (
                      /* ─── Step 2: Form OTP ─── */
                      <motion.div key="forgot-otp" {...tabAnimation}>
                        <DialogHeader className="text-left mb-4">
                          <DialogTitle>Enter Code</DialogTitle>
                          <DialogDescription className="text-zinc-400">
                            A 6-digit code was sent to{" "}
                            <strong className="text-white">{email}</strong>.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleForgotOtp} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="forgot-otp">
                              Verification Code
                            </Label>
                            <div className="relative">
                              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                              <Input
                                id="forgot-otp"
                                placeholder="123456"
                                className="pl-10 text-center tracking-[0.3em] bg-zinc-950 border-zinc-700 focus-visible:ring-red-600"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                required
                              />
                            </div>
                          </div>

                          {message.text && (
                            <div
                              className={`text-center text-sm p-2 rounded-md ${
                                message.type === "error"
                                  ? "bg-red-900/30 text-red-400"
                                  : "bg-emerald-900/30 text-emerald-400"
                              }`}
                            >
                              {message.text}
                            </div>
                          )}

                          <Button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              "Verify & Reset"
                            )}
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            className="w-full text-zinc-400 hover:text-white"
                            type="button"
                            onClick={() => setForgotStep("form")}
                          >
                            Back to Reset
                          </Button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>
              )}
            </AnimatePresence>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
