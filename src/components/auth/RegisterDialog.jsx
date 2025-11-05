import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export default function RegisterDialog({ children }) {
  /** form state */
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");

  /** ui state */
  const [errors, setErrors] = useState([]);
  const [open, setOpen] = useState(false);

  /** simple client-side validation */
  const validate = () => {
    const errs = [];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.push("Email không hợp lệ.");
    if (!name.trim()) errs.push("Họ và tên không được bỏ trống.");
    if (password.length < 6) errs.push("Mật khẩu phải có ít nhất 6 ký tự.");
    if (password !== rePassword) errs.push("Mật khẩu nhập lại không khớp.");
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length) {
      setErrors(errs);
      return;
    }
    setErrors([]);

    // TODO: call backend /auth/register ...
    // axios.post("/auth/register", { payload: { email, name, password }})

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogTitle>
        <VisuallyHidden.Root>Login</VisuallyHidden.Root>
      </DialogTitle>
      <DialogContent className="p-0 w-[90vw] max-w-sm">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Tạo tài khoản mới</CardTitle>
            <CardDescription>
              Điền thông tin bên dưới để đăng ký
            </CardDescription>
            <CardAction>{/* có thể đặt nút Login chuyển đổi */}</CardAction>
          </CardHeader>

          <CardContent>
            {/* Hiển thị Alert lỗi nếu có */}
            {errors.length > 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Có lỗi xảy ra</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((er) => (
                      <li key={er}>{er}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  placeholder="Nguyễn Văn A"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="repassword">Nhập lại mật khẩu</Label>
                <Input
                  id="repassword"
                  type="password"
                  required
                  value={rePassword}
                  onChange={(e) => setRePassword(e.target.value)}
                />
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-2">
            <Button className="w-full" onClick={handleSubmit}>
              Register
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
