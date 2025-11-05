// src/pages/admin/CustomerList.jsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchCustomers } from "@/services/customerService";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Ban } from "lucide-react";
import { genderMap, statusMap } from "@/utils/badgeHelpers";
import { toast } from "sonner";
import { updateAccountStatus } from "@/services/authService";
import qs from "qs";
import {
  changeStatusBooking,
  checkInBooking,
  createBookingReview,
  searchBookings,
  searchBookingsByCustomer,
} from "@/services/bookingService";
import { clearBookings, setError } from "@/features/booking/bookingSlice";
import { attachIdentityUrlsFromUploads } from "@/utils/uploadBookingGuestImg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { X, ImagePlus } from "lucide-react";
import { uploadManyUnsigned } from "@/services/uploadUnsigned";

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET;
const MAX_REVIEW_IMAGES = 4;

function isFileLike(x) {
  return (
    x instanceof File || (x && typeof x === "object" && x.file instanceof File)
  );
}

function getUrlIfAny(x) {
  if (typeof x === "string") return x;
  if (x && typeof x === "object" && typeof x.url === "string") return x.url;
  return null;
}
export default function CustomerBookingList() {
  const dispatch = useDispatch();
  const { list: bookings, pagination, loading } = useSelector((s) => s.booking);
  const { user } = useSelector((s) => s.auth);
  const accountId = user.id;
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [reviewRating, setReviewRating] = useState(0);

  const [checkinOpen, setCheckinOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [guestForms, setGuestForms] = useState([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewFiles, setReviewFiles] = useState([]); // File[]
  const [reviewPreviews, setReviewPreviews] = useState([]); // string[]
  const [reviewDesc, setReviewDesc] = useState("");

  useEffect(() => {
    searchBookingsByCustomer(dispatch, accountId, {
      q: debouncedSearch || undefined,
      status: status !== "all" ? status : undefined,
      page,
      limit,
    }).catch((err) =>
      dispatch(
        setError(err.response?.data?.message || "Không lấy được dữ liệu")
      )
    );

    return () => dispatch(clearBookings());
  }, [debouncedSearch, status, page, dispatch]);


  function openReviewDialog(b) {
    setSelectedBooking(b);
    setReviewOpen(true);
  }
  function handleReviewFiles(e) {
    const incoming = Array.from(e.target.files || []);
    if (!incoming.length) return;

    const remain = MAX_REVIEW_IMAGES - reviewFiles.length;
    const toAdd = incoming.slice(0, Math.max(0, remain));
    const newPreviews = toAdd.map((f) => URL.createObjectURL(f));

    setReviewFiles((prev) => [...prev, ...toAdd]);
    setReviewPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeReviewAt(idx) {
    setReviewFiles((prev) => prev.filter((_, i) => i !== idx));
    setReviewPreviews((prev) => {
      const url = prev[idx];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== idx);
    });
  }

  function closeReviewDialog() {
    reviewPreviews.forEach((u) => URL.revokeObjectURL(u));
    setReviewOpen(false);
    setSelectedBooking(null);
    setReviewFiles([]);
    setReviewPreviews([]);
    setReviewDesc("");
  }
  async function submitReview() {
    try {
      const fileIndexes = [];
      const filesToUpload = [];

      reviewFiles.forEach((item, idx) => {
        if (item instanceof File) {
          fileIndexes.push(idx);
          filesToUpload.push(item);
        } else if (isFileLike(item)) {
          fileIndexes.push(idx);
          filesToUpload.push(item.file);
        }
      });

      let uploadedUrls = [];
      if (filesToUpload.length) {
        const res = await uploadManyUnsigned(filesToUpload, {
          cloudName: CLOUD_NAME,
          uploadPreset: PRESET,
          folder: "reviews/uploads",
        });
        uploadedUrls = res.map((r) => r.url);
      }

      const uploadedMap = new Map();
      for (let i = 0; i < fileIndexes.length; i++) {
        uploadedMap.set(fileIndexes[i], uploadedUrls[i]);
      }

      const normalized = reviewFiles
        .map((item, idx) => {
          if (uploadedMap.has(idx)) return uploadedMap.get(idx); 
          const existed = getUrlIfAny(item);
          return existed || null;
        })
        .filter(Boolean)
        .slice(0, MAX_REVIEW_IMAGES);

      // (tuỳ chọn) cập nhật lại state images để UI phản ánh URL mới
      setReviewFiles(normalized);

      // 5) Build payload & gọi API
      const payload = {
        booking_id: selectedBooking._id,
        homestay_id: selectedBooking.homestay_id,
        account_id: accountId,
        numb_star: reviewRating,
        content: reviewDesc?.trim() || "",
        suitable: true,
        images: normalized,
      };
      
      await createBookingReview(dispatch, payload);
      closeReviewDialog();
      toast.success("Đã gửi đánh giá");
      searchBookingsByCustomer(dispatch, accountId, {
        q: debouncedSearch || undefined,
        status: status !== "all" ? status : undefined,
        page,
        limit,
      });
    } catch (err) {
      console.error(err);
      toast.error("Gửi đánh giá thất bại");
    }
  }
   const cancelBooking = async (b) => {
     try {
       const res = await changeStatusBooking(dispatch, {
         booking_id: b._id,
         status: "cancelled",
       });
       if (res.success) {
         toast.success("Đã hủy đơn đặt");
         await searchBookingsByCustomer(dispatch, accountId, {
           q: undefined,
           status: undefined,
           page,
           limit,
         });
       }
     } catch (e) {
       toast.error("Lỗi khi hủy đơn đặt");
     }
   };

  return (
    <>
      <Dialog
        open={reviewOpen}
        onOpenChange={(o) => (!o ? closeReviewDialog() : setReviewOpen(o))}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Đánh giá đặt phòng {selectedBooking?.booking_code || ""}
            </DialogTitle>
          </DialogHeader>

          {/* UPLOAD ẢNH */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Ảnh đính kèm</span>
              <span className="text-xs text-muted-foreground">
                Tối đa {MAX_REVIEW_IMAGES} ảnh (đã chọn {reviewFiles.length})
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleReviewFiles}
                disabled={reviewFiles.length >= MAX_REVIEW_IMAGES}
                className="max-w-xs"
              />
              <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <ImagePlus className="w-4 h-4" />
                <span>Chọn ảnh để tải lên</span>
              </div>
            </div>

            {reviewPreviews.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {reviewPreviews.map((url, idx) => (
                  <div key={idx} className="relative inline-flex h-24">
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="block border rounded-lg overflow-hidden"
                    >
                      <img
                        src={url}
                        alt={`review-${idx}`}
                        className="h-full w-auto block max-w-none"
                      />
                    </a>
                    <button
                      type="button"
                      onClick={() => removeReviewAt(idx)}
                      className="absolute top-1 right-1 inline-flex items-center justify-center rounded-md bg-black/60 text-white hover:bg-black/80 w-6 h-6"
                      title="Xóa ảnh này"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Đánh giá</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setReviewRating(n)}
                  className="text-2xl leading-none"
                  aria-label={`Chọn ${n} sao`}
                  title={`${n} sao`}
                >
                  {/* tô sao nếu <= rating */}
                  <span
                    className={
                      n <= reviewRating
                        ? "text-yellow-500"
                        : "text-muted-foreground"
                    }
                  >
                    {n <= reviewRating ? "★" : "☆"}
                  </span>
                </button>
              ))}

              <span className="ml-2 text-xs text-muted-foreground">
                {reviewRating > 0 ? `${reviewRating}/5` : "Chưa chọn"}
              </span>
            </div>
          </div>
          {/* MÔ TẢ */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Mô tả</span>
            <Textarea
              rows={4}
              value={reviewDesc}
              onChange={(e) => setReviewDesc(e.target.value)}
              placeholder="Nhập cảm nhận về homestay, dịch vụ..."
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeReviewDialog}>
              Đóng
            </Button>
            <Button onClick={submitReview} disabled={!selectedBooking}>
              Gửi đánh giá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Input
            placeholder="Tìm kiếm mã đơn đặt tên, email, SĐT"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full sm:max-w-xs"
          />

          <Select
            value={status}
            onValueChange={(value) => {
              setPage(1);
              setStatus(value);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="init">Khởi tạo</SelectItem>
              <SelectItem value="check-in">Check-in</SelectItem>
              <SelectItem value="check-out">Check-out</SelectItem>
              <SelectItem value="inactive">Hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Trang trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {pagination?.page || 1}/{pagination?.totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={
              (pagination?.page || 1) >= (pagination?.totalPages || 1) ||
              loading
            }
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
          >
            Trang sau
          </Button>
        </div>
        {/* <div className="flex justify-end">
        <Pagination className={"justify-end"}>
          <PaginationContent className="justify-end">
            <PaginationItem>
              <PaginationLink
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              >
                Trước
              </PaginationLink>
            </PaginationItem>

            {pageNumbers.map((num, idx) =>
              typeof num === "number" ? (
                <PaginationItem key={idx}>
                  <PaginationLink
                    isActive={num === page}
                    onClick={() => setPage(num)}
                  >
                    {num}
                  </PaginationLink>
                </PaginationItem>
              ) : (
                <PaginationEllipsis key={idx} />
              )
            )}

            <PaginationItem>
              <PaginationLink
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                className={
                  page === pagination.totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              >
                Sau
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div> */}

        {/* TABLE */}
        <div className="border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đặt phòng</TableHead>
                <TableHead>Ảnh</TableHead>
                <TableHead>Homestay</TableHead>
                <TableHead>Khách</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Số khách</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    Đang tải…
                  </TableCell>
                </TableRow>
              ) : bookings.length ? (
                bookings.map((b) => {
                  const statusMap = {
                    init: {
                      label: "Chờ check-in",
                      color: "bg-yellow-100 text-yellow-800",
                      action: { label: "Chuyển sang check-in" },
                    },
                    "check-in": {
                      label: "Đang ở",
                      color: "bg-blue-100 text-blue-800",
                      action: { label: "Chuyển sang check-out" },
                    },
                    "check-out": {
                      label: "Đã trả phòng",
                      color: "bg-green-100 text-green-800",
                    },
                    cancelled: {
                      label: "Đã hủy",
                      color: "bg-red-100 text-red-800",
                    },
                  };

                  const s = statusMap[b.status] || {
                    label: b.status,
                    color: "bg-slate-100 text-slate-800",
                  };

                  return (
                    <TableRow key={b._id}>
                      {/* Mã đặt phòng */}
                      <TableCell className="font-mono text-sm">
                        {b.booking_code}
                      </TableCell>

                      {/* Ảnh homestay */}
                      <TableCell>
                        <img
                          src={b.homestay_image_url || "/placeholder.png"}
                          alt={b.homestay_name || "Homestay"}
                          className="w-16 h-12 object-cover rounded-md border"
                          onClick={() =>
                            window.open(b.homestay_image_url, "_blank")
                          }
                        />
                      </TableCell>

                      {/* Homestay: tên + địa chỉ */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{b.homestay_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {b.homestay_address}
                          </span>
                        </div>
                      </TableCell>

                      {/* Khách */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{b.full_name}</span>
                          <span className="text-xs text-muted-foreground">
                            CMND/CCCD: {b.identity_number || "—"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Liên hệ */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{b.phone || "—"}</span>
                          <span className="text-xs text-muted-foreground">
                            {b.email}
                          </span>
                        </div>
                      </TableCell>

                      {/* Ngày */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span>
                            Nhận:{" "}
                            {b.date_from
                              ? format(new Date(b.date_from), "dd/MM/yyyy")
                              : "—"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Trả:{" "}
                            {b.date_to
                              ? format(new Date(b.date_to), "dd/MM/yyyy")
                              : "—"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Số khách */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span>Người lớn: {b.numb_adult ?? 0}</span>
                          <span className="text-xs text-muted-foreground">
                            Trẻ em: {b.numb_child ?? 0}
                          </span>
                        </div>
                      </TableCell>

                      {/* Trạng thái */}
                      <TableCell>
                        <div className="flex flex-col">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${s.color}`}
                                disabled={loading}
                              >
                                {s.label}
                              </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              {b.status === "check-out" && (
                                <>
                                  {!b.is_reviewed ? (
                                    <DropdownMenuItem
                                      onSelect={(e) => {
                                        e.preventDefault();
                                        openReviewDialog(b);
                                      }}
                                      className="cursor-pointer"
                                    >
                                      Đánh giá
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      disabled
                                      onSelect={(e) => {
                                        e.preventDefault();
                                        toast.info(
                                          "Bạn đã đánh giá đơn này rồi"
                                        );
                                      }}
                                      className="opacity-60 cursor-not-allowed"
                                    >
                                      Đã đánh giá
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                              {b.status === "init" && (
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    cancelBooking(b);
                                  }}
                                  className="cursor-pointer text-red-600 focus:text-red-700"
                                >
                                  Hủy đơn đặt
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* Chú thích nhỏ */}
                          {b.status === "check-out" && (
                            <span className="text-[11px] text-muted-foreground mt-1">
                              {b.is_reviewed
                                ? "Bạn đã đánh giá rồi"
                                : "Đã có thể đánh giá"}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
