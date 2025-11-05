// src/pages/admin/EmployeeCreatePage.jsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  format,
  parse,
  isAfter,
  isValid,
  addYears,
  startOfToday,
} from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  AlertTriangle,
  Loader2,
  Trash2,
  X,
} from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { uploadManyUnsigned } from "@/services/uploadUnsigned";

import { setError } from "@/features/employee/employeeSlice";
import { createEmployee } from "@/services/employeeServices";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { setLoading } from "@/features/cloudinary/uploadSlice";

const MAX_ID_IMAGES = 2;
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET;

// Helpers cho ngày dd/MM/yyyy
function isValidDate(d) {
  return d instanceof Date && !Number.isNaN(d.getTime());
}
function formatDate(d) {
  return isValidDate(d) ? format(d, "dd/MM/yyyy", { locale: vi }) : "";
}
function parseInput(value) {
  const d = parse(value, "dd/MM/yyyy", new Date());
  return isValidDate(d) ? d : null;
}
function toYMD(d) {
  if (!d) return null;
  // Tránh lệch timezone
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}
const PASSWORD_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])(?=.{8,})/;
export default function EmployeeCreatePage() {
  const dispatch = useDispatch();
  const loading = useSelector((s) => s.employee.loading || s.upload.loading);

  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    dob: null, // Date
    identityNumber: "",
    gender: "male",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [generalErrors, setGeneralErrors] = useState([]);
  const [showPwd, setShowPwd] = useState(false);

  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const usedSlots = newImages.length;
  const slotsLeft = Math.max(0, MAX_ID_IMAGES - usedSlots);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [month, setMonth] = useState(new Date());

  useEffect(() => {
    setValue(form.dob ? formatDate(form.dob) : "");
    setMonth(form.dob || new Date());
  }, [form.dob]);

  // Handlers
  const setField = (field) => (eOrValue) => {
    const val = eOrValue?.target ? eOrValue.target.value : eOrValue;
    setForm((f) => ({ ...f, [field]: val }));
  };

  const handleIdentityFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const canTake = Math.min(files.length, slotsLeft);
    const picked = files.slice(0, canTake);

    const urls = picked.map((f) => URL.createObjectURL(f));
    setNewImages((arr) => [...arr, ...picked]);
    setNewPreviews((arr) => [...arr, ...urls]);
  };

  const removeNewAt = (idx) => {
    const url = newPreviews[idx];
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    setNewPreviews((arr) => arr.filter((_, i) => i !== idx));
    setNewImages((arr) => arr.filter((_, i) => i !== idx));
  };

  useEffect(() => {
    return () => {
      newPreviews.forEach(
        (u) => u?.startsWith("blob:") && URL.revokeObjectURL(u)
      );
    };
  }, [newPreviews]);

  const validate = () => {
    const fe = {};
    const ge = [];
    const today = startOfToday();

    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      fe.email = "Email không hợp lệ";
    }
    if (!form.password || !PASSWORD_RE.test(form.password)) {
      fe.password =
        "Mật khẩu phải ≥8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt";
    }
    if (!form.fullName || form.fullName.trim().length < 2) {
      fe.fullName = "Họ tên tối thiểu 2 ký tự";
    }

    if (!form.dob || !isValid(form.dob)) {
      fe.dob = "Vui lòng chọn ngày sinh";
    } else if (isAfter(form.dob, today)) {
      fe.dob = "Ngày sinh không hợp lệ";
    } else if (addYears(form.dob, 18) > today) {
      fe.dob = "Bạn phải từ 18 tuổi trở lên";
    }

    if (!/^\d{12}$/.test(form.identityNumber)) {
      fe.identityNumber = "CCCD phải gồm 12 số";
    }

    if (!["male", "female", "other"].includes(form.gender)) {
      fe.gender = "Giới tính không hợp lệ";
    }

    if (!/^0\d{9}$/.test(form.phone)) {
      fe.phone = "Số điện thoại 10 số và bắt đầu bằng 0";
    }

    if (!form.address || form.address.trim().length < 5) {
      fe.address = "Địa chỉ tối thiểu 5 ký tự";
    }

    if (newImages.length !== MAX_ID_IMAGES) {
      fe.identityImages = `Cần đủ ${MAX_ID_IMAGES} ảnh (hiện có ${newImages.length}).`;
    }

    setErrors(fe);
    if (Object.keys(fe).length)
      ge.push("Vui lòng kiểm tra lại các trường bị lỗi.");
    setGeneralErrors(ge);

    return Object.keys(fe).length === 0;
  };

  const resetForm = () => {
    newPreviews.forEach(
      (u) => u?.startsWith("blob:") && URL.revokeObjectURL(u)
    );
    setForm({
      email: "",
      password: "",
      fullName: "",
      dob: null,
      identityNumber: "",
      gender: "male",
      phone: "",
      address: "",
    });
    setErrors({});
    setGeneralErrors([]);
    setNewPreviews([]);
    setNewImages([]);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      dispatch(setLoading(true))
      
      const uploaded = await uploadManyUnsigned(newImages, {
        cloudName: CLOUD_NAME,
        uploadPreset: PRESET,
        folder: "homestay/uploads/identity",
      });
      const urls = uploaded.map((u) => u.url);

      const payload = {
        email: form.email.trim(),
        password: form.password,
        full_name: form.fullName.trim(),
        dob: value ? format(value, "yyyy-MM-dd") : null,
        identity_number: form.identityNumber,
        gender: form.gender,
        phone: form.phone,
        address: form.address.trim(),
        identity_image_urls: urls,
        status: "active",
      };
      try {
        const res = await createEmployee(dispatch, payload);
        if (res.success) {
          toast.success("Tạo nhân viên thành công");
          resetForm();
        }
      } catch (err) {
        toast.error("Có lỗi xảy ra");
        setGeneralErrors([err.response?.data?.message]);
        console.error(err);
      }
    } catch (err) {
      if (!err?.response) {
        dispatch(setError("Không thể tạo nhân viên. Kiểm tra kết nối mạng."));
      }
    } finally{
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="space-y-8">
      {generalErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Lỗi xác thực</AlertTitle>
          <AlertDescription>
            <ul className="list-disc ml-4">
              {generalErrors.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Thông tin tài khoản */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold">Thông tin tài khoản</h3>
        <Separator />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={form.email}
              onChange={setField("email")}
              placeholder="email@company.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Mật khẩu</Label>
            <div className="relative">
              <Input
                type={showPwd ? "text" : "password"}
                value={form.password}
                onChange={setField("password")}
                placeholder="Tối thiểu 8 ký tự, có HOA/thường/số/ký tự đặc biệt"
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPwd ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                title={showPwd ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
              >
                {showPwd ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive mt-1">{errors.password}</p>
            )}
            <p className="text-[11px] text-muted-foreground">
              Yêu cầu: ≥8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
            </p>
          </div>
        </div>
      </div>

      {/* Thông tin cá nhân */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold">Thông tin cá nhân</h3>
        <Separator />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Họ và tên</Label>
            <Input
              value={form.fullName}
              onChange={setField("fullName")}
              placeholder="VD: Nguyễn Văn A"
            />
            {errors.fullName && (
              <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="dob">Ngày sinh</Label>

            <div className="relative flex gap-2">
              <Input
                id="dob"
                value={value}
                placeholder="dd/MM/yyyy"
                className="bg-background pr-10"
                onChange={(e) => {
                  const v = e.target.value;
                  setValue(v);
                  const d = parseInput(v);
                  if (d && !isAfter(d, new Date())) {
                    setForm((f) => ({ ...f, dob: d }));
                    setMonth(d);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setOpen(true);
                  }
                }}
              />

              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="date-picker"
                    type="button"
                    variant="ghost"
                    className="absolute top-1/2 right-2 size-8 -translate-y-1/2"
                  >
                    <CalendarIcon className="size-4" />
                    <span className="sr-only">Chọn ngày</span>
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="end"
                  alignOffset={-8}
                  sideOffset={10}
                >
                  <Calendar
                    mode="single"
                    selected={form.dob || undefined}
                    captionLayout="dropdown"
                    month={month}
                    onMonthChange={setMonth}
                    onSelect={(d) => {
                      setForm((f) => ({ ...f, dob: d || null }));
                      setValue(d ? formatDate(d) : "");
                      if (d) setMonth(d);
                      setOpen(false);
                    }}
                    disabled={(date) => isAfter(date, new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {errors?.dob && (
              <p className="text-sm text-destructive mt-1">{errors.dob}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>CCCD</Label>
            <Input
              value={form.identityNumber}
              onChange={setField("identityNumber")}
              placeholder="12 số"
              inputMode="numeric"
            />
            {errors.identityNumber && (
              <p className="text-sm text-destructive mt-1">
                {errors.identityNumber}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Giới tính</Label>
            <Select value={form.gender} onValueChange={setField("gender")}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Nam</SelectItem>
                <SelectItem value="female">Nữ</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-sm text-destructive mt-1">{errors.gender}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Số điện thoại</Label>
            <Input
              value={form.phone}
              onChange={setField("phone")}
              placeholder="0xxxxxxxxx"
              inputMode="tel"
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Địa chỉ</Label>
          <Textarea
            rows={3}
            value={form.address}
            onChange={setField("address")}
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
          />
          {errors.address && (
            <p className="text-sm text-destructive mt-1">{errors.address}</p>
          )}
        </div>
      </div>

      {/* Ảnh xác minh */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Ảnh xác minh</h3>
          <span className="text-xs text-muted-foreground">
            Yêu cầu: đủ {MAX_ID_IMAGES} ảnh (hiện có {usedSlots}/{MAX_ID_IMAGES}
            )
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Là 2 ảnh bao gồm: ảnh chân dung, ảnh căn cước công dân
        </span>
        <Separator />

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleIdentityFiles}
              disabled={slotsLeft <= 0}
              className="max-w-md"
            />
            <span className="text-xs text-muted-foreground">
              {slotsLeft > 0
                ? `Có thể tải thêm tối đa ${slotsLeft} ảnh`
                : "Đã đủ số lượng ảnh"}
            </span>
          </div>

          {newPreviews.length > 0 && (
            <div className="flex flex-wrap gap-3 items-start">
              {newPreviews.map((url, idx) => (
                <div key={idx} className="relative inline-flex h-28">
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="block border rounded-lg overflow-hidden"
                  >
                    <img
                      src={url}
                      alt={`new-${idx}`}
                      className="h-full w-auto block max-w-none"
                    />
                  </a>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeNewAt(idx);
                    }}
                    className="absolute top-1 right-1 inline-flex items-center justify-center rounded-md bg-black/60 text-white hover:bg-black/80 w-6 h-6"
                    title="Xóa ảnh mới này"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {errors.identityImages && (
            <p className="text-sm text-destructive mt-1">
              {errors.identityImages}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={resetForm}
          disabled={loading}
        >
          Hủy
        </Button>

        <Button type="button" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tạo...
            </>
          ) : (
            "Tạo nhân viên"
          )}
        </Button>
      </div>
    </div>
  );
}
