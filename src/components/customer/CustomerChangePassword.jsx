import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Eye, EyeOff, Loader2 } from "lucide-react";
import { changePassword } from "@/services/customerService";
import { changePasswordAccount } from "@/services/accountService";

const PW_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function CustomerChangePassword() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const accountId = user.id;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalErrors, setGeneralErrors] = useState([]);

  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
  });

  const [show, setShow] = useState({
    old: false,
    neo: false,
  });

  const setField = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};

    if (!form.old_password?.trim()) {
      e.old_password = "Vui lòng nhập mật khẩu cũ";
    }

    if (!form.new_password?.trim()) {
      e.new_password = "Vui lòng nhập mật khẩu mới";
    } else if (!PW_RE.test(form.new_password)) {
      e.new_password =
        "Mật khẩu mới phải ≥8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt";
    } else if (form.new_password === form.old_password) {
      e.new_password = "Mật khẩu mới không được trùng mật khẩu cũ";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setGeneralErrors([]);
    if (!validate()) return;

    try {
      setLoading(true);
      await changePasswordAccount(dispatch,accountId, {
        old_password: form.old_password,
        new_password: form.new_password,
      });
      toast.success("Đổi mật khẩu thành công");
      setForm({ old_password: "", new_password: "" });
    } catch (err) {
      setGeneralErrors([
        err?.response?.data?.message || "Không thể đổi mật khẩu",
      ]);
      // giữ nguyên input để user sửa
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle>Đổi mật khẩu</CardTitle>
        <CardDescription>
          Vui lòng nhập mật khẩu cũ và đặt mật khẩu mới đáp ứng yêu cầu bảo mật.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {generalErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>
              <ul className="list-disc ml-4">
                {generalErrors.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <h3 className="text-base font-semibold">Thông tin mật khẩu</h3>
          <Separator />

          {/* OLD PASSWORD */}
          <div className="space-y-2">
            <Label>Mật khẩu cũ</Label>
            <div className="relative">
              <Input
                type={show.old ? "text" : "password"}
                value={form.old_password}
                onChange={setField("old_password")}
                autoComplete="current-password"
                className="pr-10"
                placeholder="Nhập mật khẩu hiện tại"
              />
              <button
                type="button"
                onClick={() => setShow((s) => ({ ...s, old: !s.old }))}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={show.old ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                title={show.old ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
              >
                {show.old ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.old_password && (
              <p className="text-sm text-destructive mt-1">
                {errors.old_password}
              </p>
            )}
          </div>

          {/* NEW PASSWORD */}
          <div className="space-y-2">
            <Label>Mật khẩu mới</Label>
            <div className="relative">
              <Input
                type={show.neo ? "text" : "password"}
                value={form.new_password}
                onChange={setField("new_password")}
                autoComplete="new-password"
                className="pr-10"
                placeholder="Tối thiểu 8 ký tự, có HOA/thường/số/ký tự đặc biệt"
              />
              <button
                type="button"
                onClick={() => setShow((s) => ({ ...s, neo: !s.neo }))}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={show.neo ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                title={show.neo ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
              >
                {show.neo ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.new_password && (
              <p className="text-sm text-destructive mt-1">
                {errors.new_password}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">
              Yêu cầu: ≥8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-end gap-3">
        <Button type="button" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            "Đổi mật khẩu"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
