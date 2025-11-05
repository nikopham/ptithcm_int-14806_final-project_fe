import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Image as ImageIcon, Pencil } from "lucide-react";

import {
  createHomestay,
  getHomestayDetailById,
  updateHomestay,
} from "@/services/homestayService";
import { fetchProvinces } from "@/services/provinceService";
import { fetchCommunesByProvinceId } from "@/services/communeService";
import { fetchAmenities } from "@/services/amenityService";
import { uploadManyUnsigned } from "@/services/uploadUnsigned";
// import { updateHomestayAdmin } from "@/services/homestayService";
import { setError } from "@/features/homestay/homestaySlice";
import { toast } from "sonner";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET;
const toVND = (v) =>
  v == null
    ? ""
    : new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(v);

const isNum = (v) => /^\d+(\.\d+)?$/.test(String(v ?? ""));

export default function HomestayCreatePage() {
  const { homestayId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loading = useSelector((s) => s.homestay.loading);
  const { list: provinces, loading: loadingProvince } = useSelector(
    (s) => s.province
  );
  const { list: communes, loading: loadingCommune } = useSelector(
    (s) => s.commune
  );
  const { list: amenities, loading: loadingAmenity } = useSelector(
    (s) => s.amenity
  );

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    max_adults: "",
    max_children: "",
    room_count: "",
    provinceId: "",
    communeId: "",
    address: "",
  });

  const [serverImages, setServerImages] = useState([]);

  const [newImages, setNewImages] = useState([]);
  const usedImages = serverImages.length + newImages.length;

  const [selectedAmenityIds, setSelectedAmenityIds] = useState([]);

  const [errors, setErrors] = useState({});
  const [generalErrors, setGeneralErrors] = useState([]);


  useEffect(() => {
    if (!provinces.length) fetchProvinces(dispatch);
    if (!amenities.length) fetchAmenities(dispatch);
  }, [dispatch, provinces.length, amenities.length]);


  useEffect(() => {
    if (form.provinceId) {
      fetchCommunesByProvinceId(dispatch, form.provinceId);
    }
  }, [dispatch, form.provinceId]);

  useEffect(() => {
    const p = provinces.find((x) => x._id === form.provinceId);
    const c = communes.find((x) => x._id === form.communeId);
    if (p && c) {
      setForm((f) => ({ ...f, address: `${c.name}, ${p.name}` }));
    }
  }, [form.provinceId, form.communeId, provinces, communes]);


  const setField = (k) => (eOrVal) => {
    const v = eOrVal?.target ? eOrVal.target.value : eOrVal;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const items = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      is_thumb: false,
    }));
    setNewImages((arr) => [...arr, ...items]);
  };

  const removeNewAt = (idx) => {
    const it = newImages[idx];
    if (it?.url?.startsWith("blob:")) URL.revokeObjectURL(it.url);
    setNewImages((arr) => arr.filter((_, i) => i !== idx));
  };

  const removeServerAt = (img) => {
    setServerImages((arr) => arr.filter((x) => x._id !== img._id));
  };

  const setExclusiveThumb = (source, indexOrId) => {
    setServerImages((arr) =>
      arr.map((x) => ({
        ...x,
        is_thumb: source === "server" && x._id === indexOrId,
      }))
    );
    setNewImages((arr) =>
      arr.map((x, i) => ({
        ...x,
        is_thumb: source === "new" && i === indexOrId,
      }))
    );
  };

  const toggleAmenity = (id) => {
    setSelectedAmenityIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const validate = () => {
    const fe = {};
    const ge = [];
    if (!form.name.trim()) fe.name = "Vui lòng nhập tên homestay";
    if (!isNum(form.price) || Number(form.price) < 0)
      fe.price = "Giá phải là số không âm";
    ["max_adults", "max_children", "room_count"].forEach((k) => {
      if (!isNum(form[k]) || Number(form[k]) < 0) fe[k] = "Phải là số không âm";
    });
    if (!form.provinceId) fe.provinceId = "Chọn tỉnh/thành";
    if (!form.communeId) fe.communeId = "Chọn phường/xã";
    if (!form.address.trim()) fe.address = "Địa chỉ không được để trống";

    const total = serverImages.length + newImages.length;
    if (total === 0) fe.images = "Cần ít nhất 1 ảnh";
    const thumbs = [...serverImages, ...newImages].filter(
      (x) => x.is_thumb
    ).length;
    if (thumbs !== 1) fe.images = "Phải chọn đúng 1 ảnh đại diện (is_thumb)";

    setErrors(fe);
    if (Object.keys(fe).length)
      ge.push("Vui lòng kiểm tra lại các trường bị lỗi.");
    setGeneralErrors(ge);
    return Object.keys(fe).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      let uploaded = [];
      if (newImages.length) {
        const files = newImages.map((x) => x.file);
        const res = await uploadManyUnsigned(files, {
          cloudName: CLOUD_NAME,
          uploadPreset: PRESET,
          folder: "homestay/uploads",
        });
        uploaded = res.map((r, i) => ({
          url: r.url,
          is_thumb: newImages[i].is_thumb,
        }));
      }

      const images = [
        ...serverImages.map((x) => ({
          _id: x._id,
          url: x.url,
          is_thumb: x.is_thumb,
        })),
        ...uploaded,
      ];

      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || "",
        price: Number(form.price),
        max_adults: Number(form.max_adults),
        max_children: Number(form.max_children),
        room_count: Number(form.room_count),
        commune_id: form.communeId,
        address: form.address.trim(),
        images,
        amenity_ids: selectedAmenityIds,
      };
      console.log(payload);
      

      const updated = await createHomestay(dispatch, payload);
      if (updated?.success) {
        toast.success("Tạo homestay thành công");
        navigate("/admin-dashboard/movie-list");
      }
    } catch (e) {
      toast.error("Không thể tạo homestay");
      dispatch(
        setError(
          e?.response?.data?.message ||
            "Không thể tạo homestay, thử lại sau"
        )
      );
    }
  };

  // derive: province/commune name
  const provinceName = useMemo(
    () => provinces.find((x) => x._id === form.provinceId)?.name || "",
    [provinces, form.provinceId]
  );
  const communeName = useMemo(
    () => communes.find((x) => x._id === form.communeId)?.name || "",
    [communes, form.communeId]
  );

  return (
    <div className="space-y-6">
      {generalErrors.length > 0 && (
        <Alert variant="destructive">
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

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Thêm Homestay</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Quay lại
          </Button>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...
              </>
            ) : (
              <>
                <Pencil className="mr-2 h-4 w-4" /> Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT: Form + Images */}
        <div className="space-y-6 lg:col-span-2">
          {/* Thông tin cơ bản */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Thông tin cơ bản</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Tên homestay</Label>
                <Input
                  value={form.name}
                  onChange={setField("name")}
                  placeholder="Ví dụ: An Nhiên Guesthouse"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Giá (VND/đêm)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={form.price}
                  onChange={setField("price")}
                  placeholder="Ví dụ: 1500000"
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Tối đa người lớn</Label>
                <Input
                  type="number"
                  value={form.max_adults}
                  onChange={setField("max_adults")}
                  placeholder="VD: 2"
                />
                {errors.max_adults && (
                  <p className="text-sm text-destructive">
                    {errors.max_adults}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Tối đa trẻ em</Label>
                <Input
                  type="number"
                  value={form.max_children}
                  onChange={setField("max_children")}
                  placeholder="VD: 1"
                />
                {errors.max_children && (
                  <p className="text-sm text-destructive">
                    {errors.max_children}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Số phòng</Label>
                <Input
                  type="number"
                  value={form.room_count}
                  onChange={setField("room_count")}
                  placeholder="VD: 3"
                />
                {errors.room_count && (
                  <p className="text-sm text-destructive">
                    {errors.room_count}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Mô tả</Label>
              <Textarea
                rows={4}
                value={form.description}
                onChange={setField("description")}
                placeholder="Mô tả ngắn gọn về homestay..."
              />
            </div>
          </div>

          <Separator />

          {/* Địa chỉ */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Địa chỉ</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Tỉnh/Thành</Label>
                <Select
                  value={form.provinceId || "all"}
                  onValueChange={(val) =>
                    setForm((f) => ({
                      ...f,
                      provinceId: val === "all" ? "" : val,
                      communeId: "",
                    }))
                  }
                  disabled={loadingProvince}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn tỉnh/thành" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">-- Chọn --</SelectItem>
                    {provinces.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.provinceId && (
                  <p className="text-sm text-destructive">
                    {errors.provinceId}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Phường/Xã</Label>
                <Select
                  value={form.communeId || "all"}
                  onValueChange={(val) =>
                    setForm((f) => ({
                      ...f,
                      communeId: val === "all" ? "" : val,
                    }))
                  }
                  disabled={!form.provinceId || loadingCommune}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn phường/xã" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">-- Chọn --</SelectItem>
                    {communes.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.communeId && (
                  <p className="text-sm text-destructive">{errors.communeId}</p>
                )}
              </div>

              <div className="space-y-1.5 md:col-span-1">
                <Label>Địa chỉ</Label>
                <Input
                  value={form.address}
                  onChange={setField("address")}
                  placeholder="VD: Phường A, Tỉnh B"
                  disabled
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Tự động điền địa chỉ:{" "}
              <b>
                {communeName && provinceName
                  ? `${communeName}, ${provinceName}`
                  : "--"}
              </b>
            </p>
          </div>

          <Separator />

          {/* Ảnh homestay */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Ảnh homestay</h3>
              <span className="text-xs text-muted-foreground">
                Đánh dấu <b>Ảnh đại diện</b> cho 1 ảnh duy nhất
              </span>
            </div>

            {/* Ảnh hiện có */}
            {serverImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Ảnh hiện có</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {serverImages.map((img) => (
                    <div
                      key={img._id}
                      className="relative rounded-md border p-2"
                    >
                      <img
                        src={img.url}
                        alt="hs"
                        className="h-32 w-full object-cover rounded"
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={!!img.is_thumb}
                            onCheckedChange={() =>
                              setExclusiveThumb("server", img._id)
                            }
                          />
                          Ảnh đại diện
                        </label>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeServerAt(img)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Thêm ảnh mới */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleAddImages}
                  className="max-w-md"
                />
                <span className="text-xs text-muted-foreground">
                  Có thể chọn nhiều ảnh cùng lúc
                </span>
              </div>

              {newImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {newImages.map((it, idx) => (
                    <div key={idx} className="relative rounded-md border p-2">
                      <img
                        src={it.url}
                        alt={`new-${idx}`}
                        className="h-32 w-full object-cover rounded"
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={!!it.is_thumb}
                            onCheckedChange={() =>
                              setExclusiveThumb("new", idx)
                            }
                          />
                          Ảnh đại diện
                        </label>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeNewAt(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {errors.images && (
              <p className="text-sm text-destructive">{errors.images}</p>
            )}
          </div>
        </div>

        {/* RIGHT: Amenity */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Tiện nghi</h3>
          <div className="grid gap-3 grid-cols-1">
            {/* Đã chọn */}
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium mb-2">Đã chọn</p>
              <div className="flex flex-wrap gap-2">
                {selectedAmenityIds.length ? (
                  selectedAmenityIds
                    .map((id) => amenities.find((a) => a._id === id))
                    .filter(Boolean)
                    .map((a) => (
                      <Badge
                        key={a._id}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => toggleAmenity(a._id)}
                        title="Bỏ chọn"
                      >
                        {a.name}
                      </Badge>
                    ))
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Chưa chọn tiện nghi nào
                  </span>
                )}
              </div>
            </div>

            {/* Danh sách */}
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium mb-2">Danh sách tiện nghi</p>
              <div className="space-y-2 max-h-80 overflow-auto pr-2">
                {amenities.map((a) => (
                  <label
                    key={a._id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={selectedAmenityIds.includes(a._id)}
                      onCheckedChange={() => toggleAmenity(a._id)}
                    />
                    <span>{a.name}</span>
                  </label>
                ))}
                {!amenities.length && (
                  <div className="text-xs text-muted-foreground">
                    Không có dữ liệu tiện nghi
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
