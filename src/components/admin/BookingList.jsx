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
  searchBookings,
} from "@/services/bookingService";
import { clearBookings, setError } from "@/features/booking/bookingSlice";
import { attachIdentityUrlsFromUploads } from "@/utils/uploadBookingGuestImg";

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

export default function BookingList() {
  const dispatch = useDispatch();
  const { list: bookings, pagination, loading } = useSelector((s) => s.booking);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [checkinOpen, setCheckinOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [guestForms, setGuestForms] = useState([]);

  useEffect(() => {
    searchBookings(dispatch, {
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

  const currentQuery = useMemo(() => {
    const qObj = qs.parse(location.search, { ignoreQueryPrefix: true });

    const page = Number(qObj.page) || 1;
    const limit = Number(qObj.limit) || 10;
    const status =
      qObj.status && qObj.status !== "all" ? String(qObj.status) : undefined;

    const q = qObj.q ? String(qObj.q) : undefined;

    return { q, status, page, limit };
  }, [location.search]);

  const pageNumbers = useMemo(() => {
    const totalPages = pagination.totalPages || 1;
    if (totalPages <= 5) return [...Array(totalPages)].map((_, i) => i + 1);

    const arr = [1];
    if (page > 3) arr.push("prev");
    if (page > 2) arr.push(page - 1);
    if (page !== 1 && page !== totalPages) arr.push(page);
    if (page < totalPages - 1) arr.push(page + 1);
    if (page < totalPages - 2) arr.push("next");
    arr.push(totalPages);
    return arr;
  }, [page, pagination.totalPages]);

  async function handleToggleStatus(customer) {
    const nextStatus =
      customer.account.status === "active" ? "inactive" : "active";

    try {
      await updateAccountStatus(dispatch, customer.account._id, nextStatus);
      await searchCustomers(dispatch, currentQuery);
      toast.success("Cập nhật trạng thái thành công");
    } catch (err) {
      toast.error("Không thể cập nhật trạng thái!");
      console.error(err);
    }
  }

  function openCheckinSheet(b) {
    const total = (b.numb_adult ?? 0) + (b.numb_child ?? 0);
    const forms = Array.from({ length: total }).map((_, i) => ({
      customer_name: i === 0 ? b.full_name || "" : "",
      dob: "",
      identity_number: "",
      is_child: i >= (b.numb_adult ?? 0),
      identity_url_front: null,
      identity_url_back: null,
    }));
    setSelectedBooking(b);
    setGuestForms(forms);
    setCheckinOpen(true);
  }

  function updateGuestForm(idx, patch) {
    setGuestForms((arr) => {
      const next = [...arr];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  const cancelBooking = async (b) => {
    try {
      const res = await changeStatusBooking(dispatch, {
        booking_id: b._id,
        status: "cancelled",
      });
      if (res.success) {
        toast.success("Đã hủy đơn đặt");
        await searchBookings(dispatch, {
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

  const checkoutBooking = async (b) => {
    try {
      const res = await changeStatusBooking(dispatch, {
        booking_id: b._id,
        status: "check-out",
      });
      if (res.success) {
        toast.success("Đã chuyển sang check-out");
        await searchBookings(dispatch, {
          q: undefined,
          status: undefined,
          page,
          limit,
        });
      }
    } catch (e) {
      toast.error("Lỗi khi check-out đơn đặt");
    }
  };

  async function handleSubmitCheckin() {
    const errors = [];

    guestForms.forEach((g, idx) => {
      const guestNum = `Khách #${idx + 1}`;

      if (!g.customer_name?.trim()) {
        errors.push(`${guestNum}: Vui lòng nhập tên khách`);
      }
      if (!g.dob) {
        errors.push(`${guestNum}: Vui lòng chọn ngày sinh`);
      }

      if (!g.is_child) {
        if (!g.identity_number?.trim()) {
          errors.push(`${guestNum}: Vui lòng nhập CMND/CCCD`);
        } else if (!/^\d{12}$/.test(g.identity_number.trim())) {
          errors.push(`${guestNum}: CMND/CCCD phải gồm đúng 12 số`);
        }
        if (!g.identity_url_front) {
          errors.push(`${guestNum}: Vui lòng tải ảnh mặt trước`);
        }
        if (!g.identity_url_back) {
          errors.push(`${guestNum}: Vui lòng tải ảnh mặt sau`);
        }
      }
    });

    if (errors.length) {
      toast.error(
        <div className="space-y-1">
          {errors.map((err, i) => (
            <div key={i}>- {err}</div>
          ))}
        </div>,
        { duration: 5000 }
      );
      return;
    }

    try {
      const guestsWithUrls = await attachIdentityUrlsFromUploads(guestForms, {
        cloudName: CLOUD_NAME,
        preset: PRESET,
        folder: "homestay/uploads",
      });
      const payload = {
        booking_id: selectedBooking._id,
        bookingGuest: guestsWithUrls.map((g) => ({
          customer_name: g.customer_name?.trim(),
          dob: g.dob, 
          identity_number: g.identity_number?.trim(),
          is_child: !!g.is_child,
          identity_url_front:
            typeof g.identity_url_front === "string"
              ? g.identity_url_front
              : null,
          identity_url_back:
            typeof g.identity_url_back === "string"
              ? g.identity_url_back
              : null,
        })),
      };

      const result = await checkInBooking(dispatch, payload);
      if (result.success) {
        toast.success("Check-in thành công");
      }
      setCheckinOpen(false);
      await searchBookings(dispatch, {
        q: undefined,
        status: undefined,
        page,
        limit,
      });
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi check-in");
    }
  }
  return (
    <>
      <Sheet open={checkinOpen} onOpenChange={setCheckinOpen}>
        <SheetContent side="right" className="w-[92vw] sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>
              Check-in — {selectedBooking?.booking_code || "—"}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-3 ml-4">
            <div className="text-sm text-muted-foreground">
              Homestay:{" "}
              <span className="font-medium">
                {selectedBooking?.homestay_name}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Thời gian:{" "}
              {selectedBooking?.date_from
                ? format(new Date(selectedBooking.date_from), "dd/MM/yyyy")
                : "—"}{" "}
              →{" "}
              {selectedBooking?.date_to
                ? format(new Date(selectedBooking.date_to), "dd/MM/yyyy")
                : "—"}
            </div>
          </div>

          <Separator className="my-3" />

          <ScrollArea className="h-[70vh] pr-3">
            <div className="space-y-6 ml-3">
              {guestForms.map((g, idx) => {
                const disabledUploads = !!g.is_child;
                return (
                  <div key={idx} className="rounded-xl border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        Khách #{idx + 1}{" "}
                        <span className="text-xs text-muted-foreground">
                          ({g.is_child ? "Trẻ em" : "Người lớn"})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`is_child_${idx}`}
                          checked={g.is_child}
                          onCheckedChange={(v) =>
                            updateGuestForm(idx, { is_child: !!v })
                          }
                        />
                        <Label htmlFor={`is_child_${idx}`} className="text-xs">
                          Trẻ em
                        </Label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Tên khách</Label>
                        <Input
                          value={g.customer_name}
                          onChange={(e) =>
                            updateGuestForm(idx, {
                              customer_name: e.target.value,
                            })
                          }
                          placeholder="Nguyễn Văn B"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label>Ngày sinh</Label>
                        <Input
                          type="date"
                          value={g.dob}
                          onChange={(e) =>
                            updateGuestForm(idx, { dob: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>CMND/CCCD</Label>
                        <Input
                          value={g.identity_number}
                          onChange={(e) =>
                            updateGuestForm(idx, {
                              identity_number: e.target.value,
                            })
                          }
                          placeholder="0123456789"
                        />
                      </div>

                      {/* Upload ảnh - disable khi là trẻ em */}
                      <div className="space-y-1.5">
                        <Label>Ảnh mặt trước</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          disabled={disabledUploads}
                          className={
                            disabledUploads
                              ? "opacity-60 cursor-not-allowed"
                              : ""
                          }
                          onChange={(e) =>
                            updateGuestForm(idx, {
                              identity_url_front: e.target.files?.[0] || null,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label>Ảnh mặt sau</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          disabled={disabledUploads}
                          className={
                            disabledUploads
                              ? "opacity-60 cursor-not-allowed"
                              : ""
                          }
                          onChange={(e) =>
                            updateGuestForm(idx, {
                              identity_url_back: e.target.files?.[0] || null,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <SheetFooter className="mt-4">
            <Button variant="outline" onClick={() => setCheckinOpen(false)}>
              Đóng
            </Button>
            <Button onClick={handleSubmitCheckin}>Xác nhận check-in</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
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
                            {/* INIT: chuyển sang check-in (mở sheet) */}
                            {b.status === "init" && (
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  openCheckinSheet(b);
                                }}
                                className="cursor-pointer"
                              >
                                Chuyển sang check-in
                              </DropdownMenuItem>
                            )}

                            {/* INIT: hủy đơn -> cancelled */}
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

                            {/* CHECK-IN: chuyển sang check-out */}
                            {b.status === "check-in" && (
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  checkoutBooking(b);
                                }}
                                className="cursor-pointer"
                              >
                                Chuyển sang check-out
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
