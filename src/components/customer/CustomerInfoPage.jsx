import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { AlertTriangle, Loader2 } from "lucide-react";

import {
  getCustomerByAccountId,
  updateCustomer,
} from "@/services/customerService";
import { getAccountByAccountId, updateAccount } from "@/services/accountService";

const VN_PHONE = /^0\d{9}$/;

function toDateInputValue(d) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}
const todayStr = toDateInputValue(new Date());

export default function CustomerInfoPage({ accountId: accountIdProp }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const accountId = user.id;

  const [loading, setLoading] = useState(false);
  const [generalErrors, setGeneralErrors] = useState([]);
  const [errors, setErrors] = useState({});

  const [customerId, setCustomerId] = useState(null);
  const [email, setEmail] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    dob: "",
    phone: "",
    address: "",
    gender: "male",
  });
  const [initialForm, setInitialForm] = useState(null);

  const setField = (key) => (eOrVal) => {
    const value = eOrVal?.target ? eOrVal.target.value : eOrVal;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const isDirty =
    initialForm && JSON.stringify(form) !== JSON.stringify(initialForm);

  useEffect(() => {
    if (!accountId) return;
    (async () => {
      setLoading(true);
      setGeneralErrors([]);
      try {
        console.log(accountId);
        
        const res = await getAccountByAccountId(dispatch, accountId);
      

        setCustomerId(res?.data?.customer?._id || null);
        setEmail(user.email || "");
        let info = res?.data?.customer;
        console.log(info);

        const next = {
          full_name: info?.full_name || "",
          dob: toDateInputValue(info?.dob),
          phone: info?.phone || "",
          address: info?.address || "",
          gender: info?.gender || "male",
        };
        setForm(next);
        setInitialForm(next);
      } catch (err) {
        setGeneralErrors([
          err?.response?.data?.message || "Không thể tải thông tin khách hàng",
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [accountId, dispatch]);

  const MIN_AGE = 18;

  function parseYMD(ymd) {
    // ymd dạng "yyyy-MM-dd"
    if (!ymd) return null;
    const [y, m, d] = String(ymd).split("-").map(Number);
    if (!y || !m || !d) return null;
    const dt = new Date(y, m - 1, d); // local time, tránh lệch múi giờ
    // kiểm tra hợp lệ (Date tự sửa ngày nếu vượt, nên cần xác nhận lại)
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d)
      return null;
    return dt;
  }

  function calcAge(ymd, ref = new Date()) {
    const birth = parseYMD(ymd);
    if (!birth) return NaN;
    let age = ref.getFullYear() - birth.getFullYear();
    const notHadBirthdayThisYear =
      ref.getMonth() < birth.getMonth() ||
      (ref.getMonth() === birth.getMonth() && ref.getDate() < birth.getDate());
    if (notHadBirthdayThisYear) age--;
    return age;
  }

  const validate = () => {
    const e = {};
    if (!form.full_name?.trim()) e.full_name = "Họ và tên là bắt buộc";
    if (form.phone?.trim() && !VN_PHONE.test(form.phone.trim()))
      e.phone = "Số điện thoại phải gồm 10 số và bắt đầu bằng 0";
    if (form.dob) {
      const birth = parseYMD(form.dob);
      const now = new Date();
      if (!birth) {
        e.dob = "Ngày sinh không hợp lệ";
      } else if (birth > now) {
        e.dob = "Ngày sinh không hợp lệ";
      } else {
        const age = calcAge(form.dob, now);
        if (Number.isNaN(age) || age < MIN_AGE) {
          e.dob = `Khách hàng phải đủ ${MIN_AGE} tuổi`;
        }
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRestore = () => {
    if (initialForm) setForm(initialForm);
  };

  const handleSave = async () => {
    if (!validate()) return;
    // if (!customerId) {
    //   setGeneralErrors(["Không xác định được khách hàng để cập nhật"]);
    //   return;
    // }
    setLoading(true);
    setGeneralErrors([]);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        dob: form.dob || null,
        phone: form.phone?.trim() || null,
        address: form.address?.trim() || null,
        gender: form.gender,
      };
      await updateAccount(dispatch, accountId, payload);
      toast.success("Lưu thay đổi thành công");

      setInitialForm(form);
    } catch (err) {
      setGeneralErrors([
        err?.response?.data?.message || "Không thể lưu thay đổi",
      ]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
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

      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Thông tin tài khoản</CardTitle>
          <CardDescription>
            Tài khoản liên kết:{" "}
            <span className="font-mono">{email || "—"}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Thông tin cá nhân</h3>
            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Họ và tên</Label>
                <Input
                  value={form.full_name}
                  onChange={setField("full_name")}
                  placeholder="VD: Nguyễn Văn A"
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.full_name}
                  </p>
                )}
              </div>

            
            </div>

            <div className="grid gap-4 md:grid-cols-3">
          

            

              <div className="space-y-2 md:col-span-1">
                <Label>&nbsp;</Label>
                <div className="text-xs text-muted-foreground">
                  Chỉ lưu các trường bạn thay đổi.
                </div>
              </div>
            </div>

          
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Quay lại
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleRestore}
            disabled={loading || !initialForm || !isDirty}
          >
            Khôi phục
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading || !isDirty}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
