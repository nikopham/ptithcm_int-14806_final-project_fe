// src/components/EmployeeEditForm.jsx
import { useEffect, useMemo, useState } from "react";
import { format, isAfter, isValid, addYears, startOfToday } from "date-fns";
import { Trash2, Calendar as CalIcon, AlertTriangle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { appendIdentityImagesToFD } from "@/services/uploadService";
import { useDispatch, useSelector } from "react-redux";
import { uploadManyUnsigned } from "@/services/uploadUnsigned";
import {
  editEmployee,
  getEmployeeDetailByAccountId,
} from "@/services/employeeServices";
import { toast } from "sonner";
import { parse } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { setLoading } from "@/features/cloudinary/uploadSlice";

const MAX_ID_IMAGES = 2;
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET;

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

export default function EmployeeEditForm({
  initialData,
  onSubmit,
  submitting = false,
  accountId,
}) {
  const dispatch = useDispatch();
  const loading = useSelector((s) => s.employee.loading || s.upload.loading);
  const [form, setForm] = useState({
    fullName: initialData?.full_name || "",
    dob: initialData?.dob ? new Date(initialData.dob) : null,
    identityNumber: initialData?.identity_number || "",
    gender: initialData?.gender || "male",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    email: initialData?.account?.email || "",
  });
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(form.dob ? formatDate(form.dob) : "");
  const [month, setMonth] = useState(form.dob || new Date());

  const [errors, setErrors] = useState({});
  const [generalErrors, setGeneralErrors] = useState([]);

  const [serverImages, setServerImages] = useState(
    initialData?.identity_images || []
  );
  const [removedImageIds, setRemovedImageIds] = useState([]);

  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const usedSlots = serverImages.length + newImages.length;
  const slotsLeft = Math.max(0, MAX_ID_IMAGES - usedSlots);

  useEffect(() => {
    return () => {
      newPreviews.forEach(
        (u) => u?.startsWith("blob:") && URL.revokeObjectURL(u)
      );
    };
  }, []);
  useEffect(() => {
    setValue(form.dob ? formatDate(form.dob) : "");
    setMonth(form.dob || new Date());
  }, [form.dob]);
  const setField = (key) => (eOrValue) => {
    const value = eOrValue?.target ? eOrValue.target.value : eOrValue;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((err) => ({ ...err, [key]: undefined }));
  };

  const handleIdentityFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const accepted = files.slice(0, slotsLeft);

    const nextFiles = [...newImages, ...accepted].slice(
      0,
      MAX_ID_IMAGES - serverImages.length
    );

    newPreviews.forEach(
      (u) => u?.startsWith("blob:") && URL.revokeObjectURL(u)
    );
    const nextPreviews = nextFiles.map((f) => URL.createObjectURL(f));

    setNewImages(nextFiles);
    setNewPreviews(nextPreviews);

    if (accepted.length < files.length) {
      setGeneralErrors([`Chỉ được tải tối đa ${MAX_ID_IMAGES} ảnh.`]);
    } else {
      setGeneralErrors([]);
    }
  };

  const removeNewAt = (idx) => {
    const url = newPreviews[idx];
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    setNewImages((arr) => arr.filter((_, i) => i !== idx));
    setNewPreviews((arr) => arr.filter((_, i) => i !== idx));
  };

  const removeServerAt = (img) => {
    setServerImages((arr) => arr.filter((x) => x._id !== img._id));
    setRemovedImageIds((ids) =>
      ids.includes(img._id) ? ids : [...ids, img._id]
    );
  };

  const validate = () => {
    const fe = {};
    const ge = [];
    const today = startOfToday();

    if (!form.fullName || form.fullName.trim().length < 2) {
      fe.fullName = "Họ tên tối thiểu 2 ký tự";
    }

    if (!form.dob || !isValid(form.dob)) {
      fe.dob = "Vui lòng chọn ngày sinh";
    } else if (isAfter(form.dob, new Date())) {
      fe.dob = "Ngày sinh không hợp lệ";
    } else if (addYears(form.dob, 18) > today) {
      // chưa đến sinh nhật 18 => < 18 tuổi
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

    const totalImages = serverImages.length + newImages.length;
    if (totalImages !== MAX_ID_IMAGES) {
      fe.identityImages = `Cần đủ ${MAX_ID_IMAGES} ảnh (hiện có ${totalImages}).`;
    }

    setErrors(fe);
    if (Object.keys(fe).length)
      ge.push("Vui lòng kiểm tra lại các trường bị lỗi.");
    setGeneralErrors(ge);

    return Object.keys(fe).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralErrors([]);
    if (!validate()) return;

    const fd = new FormData();
    fd.append("account_id", accountId);
    fd.append("full_name", form.fullName.trim());
    fd.append("dob", form.dob ? form.dob.toISOString() : "");
    fd.append("identity_number", form.identityNumber);
    fd.append("gender", form.gender);
    fd.append("phone", form.phone);
    fd.append("address", form.address.trim());
    fd.append("existed_identity_image", initialData?.identity_images || []);
    if (initialData?._id) fd.append("employee_id", initialData._id);
    dispatch(setLoading(true));
    const uploaded = await uploadManyUnsigned(newImages, {
      cloudName: CLOUD_NAME,
      uploadPreset: PRESET,
      folder: "homestay/uploads/identity",
    });

    appendIdentityImagesToFD(fd, uploaded);

    (serverImages || []).forEach((img) => {
      fd.append("identity_image_urls", img.url);
      fd.append("identity_image_public_ids", img.public_id);
    });

    const payload = {
      account_id: accountId,
      full_name: form.fullName.trim(),
      dob: value ? format(value, "yyyy-MM-dd") : null,
      identity_number: form.identityNumber,
      gender: form.gender,
      phone: form.phone,
      address: form.address.trim(),
      ...(Array.isArray(serverImages) && serverImages.length
        ? {
            existed_identity_image: serverImages.map((img) => ({
              _id: img._id,
            })),
          }
        : {}),
      ...(uploaded?.length
        ? { identity_image_urls: uploaded.map((x) => x.url) }
        : {}),
    };

    try {
      await editEmployee(dispatch, payload);
      toast.success("Cập nhật nhân viên thành công");
    } catch (err) {
      toast.error("Có lỗi xảy ra");
      setGeneralErrors([err.response?.data?.message]);
      console.error(err);
    } finally {
      dispatch(setLoading(false));
      getEmployeeDetailByAccountId(dispatch, accountId).catch(() => {});
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

      <div className="space-y-4">
        <h3 className="text-base font-semibold">Thông tin tài khoản</h3>
        <Separator />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Email (không thể chỉnh sửa)</Label>
            <Input
              value={form.email || ""}
              readOnly
              className="bg-muted/50 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* BLOCK: Thông tin cá nhân */}
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
                    setField("dob")(d);
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
                      setField("dob")(d || null);
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

        {serverImages.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Ảnh hiện có</p>

            <div className="flex flex-wrap gap-3 items-start">
              {serverImages.map((img) => (
                <div key={img._id} className="relative inline-flex h-28">
                  <a
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block border rounded-lg overflow-hidden"
                    title="Mở ảnh trong tab mới"
                  >
                    <img
                      src={img.url}
                      alt="identity"
                      className="h-full w-auto block max-w-none"
                    />
                  </a>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeServerAt(img);
                    }}
                    className="absolute top-1 right-1 inline-flex items-center justify-center rounded-md bg-black/60 text-white hover:bg-black/80 w-6 h-6"
                    title="Xóa ảnh này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
                    title="Mở ảnh trong tab mới"
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
          onClick={() => {
            setForm({
              fullName: initialData?.full_name || "",
              dob: initialData?.dob ? new Date(initialData.dob) : null,
              identityNumber: initialData?.identity_number || "",
              gender: initialData?.gender || "male",
              phone: initialData?.phone || "",
              address: initialData?.address || "",
              email: initialData?.account?.email || "",
            });
            setErrors({});
            setGeneralErrors([]);

            newPreviews.forEach(
              (u) => u?.startsWith("blob:") && URL.revokeObjectURL(u)
            );
            setNewPreviews([]);
            setNewImages([]);
            setRemovedImageIds([]);
            setServerImages(initialData?.identity_images || []);
          }}
          disabled={loading}
        >
          Hủy
        </Button>

        <Button type="button" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            "Lưu thay đổi"
          )}
        </Button>
      </div>
    </div>
  );
}
