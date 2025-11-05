// src/pages/admin/CustomerList.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import qs from "qs";
import { searchReviews, searchReviewsByCustomer } from "@/services/bookingService";
import { clearBookings, setError } from "@/features/booking/bookingSlice";

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
const Stars = ({ n = 0 }) => {
  const v = Math.max(0, Math.min(5, Number(n) || 0));
  return (
    <div className="leading-none text-[15px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={i <= v ? "text-yellow-500" : "text-muted-foreground"}
        >
          {i <= v ? "★" : "☆"}
        </span>
      ))}
      <span className="ml-1 text-xs text-muted-foreground">({v}/5)</span>
    </div>
  );
};

export default function ReviewList() {
  const dispatch = useDispatch();
  const { list: bookings, pagination, loading } = useSelector((s) => s.booking);
  const { user } = useSelector((s) => s.auth);
  const accountId = user.id;
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  
  useEffect(() => {
    searchReviews(dispatch, {
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

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Input
            placeholder="Tìm kiếm mã đơn đặt"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full sm:max-w-xs"
          />
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

        <div className="border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đặt phòng</TableHead>
                <TableHead>Ảnh</TableHead>
                <TableHead>Homestay</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Số sao</TableHead>
                <TableHead>Nội dung</TableHead>

                <TableHead>Ảnh đánh giá</TableHead>
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
                bookings.map((r) => (
                  <TableRow key={r._id}>
                    {/* Mã đặt phòng */}
                    <TableCell className="font-mono text-sm">
                      {r.booking_code}
                    </TableCell>

                    {/* Ảnh homestay */}
                    <TableCell>
                      <img
                        src={r.homestay_image_url || "/placeholder.png"}
                        alt={r.homestay_name || "Homestay"}
                        className="w-16 h-12 object-cover rounded-md border"
                        onClick={() =>
                          r.homestay_image_url &&
                          window.open(r.homestay_image_url, "_blank")
                        }
                      />
                    </TableCell>

                    {/* Homestay: tên + địa chỉ */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{r.homestay_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {r.homestay_address}
                        </span>
                      </div>
                    </TableCell>

                    {/* Ngày nhận/trả */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span>
                          Nhận:{" "}
                          {r.date_from
                            ? format(new Date(r.date_from), "dd/MM/yyyy")
                            : "—"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Trả:{" "}
                          {r.date_to
                            ? format(new Date(r.date_to), "dd/MM/yyyy")
                            : "—"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Sao */}
                    <TableCell>
                      <Stars n={r.numb_star} />
                    </TableCell>

                    {/* Nội dung */}
                    <TableCell className="max-w-[360px]">
                      <div className="line-clamp-3 text-sm">
                        {r.content || "—"}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {r.created_at
                          ? format(new Date(r.created_at), "dd/MM/yyyy HH:mm")
                          : ""}
                      </div>
                    </TableCell>

                    {/* Ảnh review */}
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {(r.review_images || []).length ? (
                          r.review_images.map((u, i) => (
                            <a
                              key={i}
                              href={u}
                              target="_blank"
                              rel="noreferrer"
                              className="block border rounded-lg overflow-hidden"
                              title="Xem ảnh"
                            >
                              <img
                                src={u}
                                alt={`rv-${i}`}
                                className="h-12 w-12 object-cover"
                              />
                            </a>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
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
