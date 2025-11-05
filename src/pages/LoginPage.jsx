import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService"; // hàm ở trên

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const LoginPage = () => {
  const [email, setEmail] = useState("45twila@somoj.com");
  const [password, setPassword] = useState("123456Aa@");
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginUser(dispatch, email, password);

      
      if (user?.role === "admin") navigate("/admin-dashboard/admin");
      else if (user?.role === "employee") navigate("/admin-dashboard/employee");
      else navigate("/customer");
    } catch (err) {
      setError(err.response?.data?.message || "Login thất bại");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md p-6">
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-semibold text-center">Đăng nhập</h2>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full">
              Đăng nhập
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
