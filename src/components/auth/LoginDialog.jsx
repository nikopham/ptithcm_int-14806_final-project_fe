import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "@/services/axiosInstance";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
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

import { setCredentials } from "@/features/auth/authSlice";

export default function LoginDialog({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /** local state */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  /** handle submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/login", { email, password } );

      const { data } = await axios.get("/auth/me");
      dispatch(setCredentials(data?.data));

      setOpen(false);

      
      navigate(data?.data.role === "admin" ? "/admin-dashboard/admin" : "/customer");
    } catch (err) {
      setError(
        err.response?.data?.message || "Đăng nhập thất bại, vui lòng thử lại."
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogTitle>
        <VisuallyHidden.Root>
          Login
        </VisuallyHidden.Root>
      </DialogTitle>
      <DialogContent className="p-0 w-[90vw] max-w-sm">
        {/* ==== Card layout (the snippet you provided) ==== */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
            <CardAction>
              <Button variant="link">Sign Up</Button>
            </CardAction>
          </CardHeader>

          <CardContent>
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
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-600 -mt-2">{error}</p>}
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-2">
            <Button className="w-full" onClick={handleSubmit}>
              Login
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
