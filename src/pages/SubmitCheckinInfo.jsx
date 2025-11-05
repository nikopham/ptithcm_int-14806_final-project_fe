import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MdMap, MdStar, MdCheckCircle } from "react-icons/md";
import qs from "qs";
import axios from "@/services/axiosInstance";
import { differenceInCalendarDays, parseISO, format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { Checkbox } from "@/components/ui/checkbox";
import * as MdIcons from "react-icons/md";
import AuthTabsDialog from "@/components/auth/AuthTabsDialog";
import { createBooking } from "@/services/bookingService";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { createVNPayUrl } from "@/services/paymentService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
/**
 * SubmitCheckinInfo Page
 * - đọc homestayId + filter hiện tại từ URL
 * - fetch chi tiết homestay
 * - tự tính số đêm & tổng giá
 * - form gồm phone + identity, auto‑fill name/email
 * - onSubmit(payload) => parent xử lý (POST booking / next step)
 */
export default function SubmitCheckinInfo() {
  const { search } = useLocation();
  const query = useMemo(() => qs.parse(search.slice(1)), [search]);
  const homestayId = query.homestayId;
  const [payment, setPayment] = useState("checkin");
   const [paymentAlertOpen, setPaymentAlertOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const phoneRegex = /^0\d{9}$/;
  const identityRegex = /^\d{12}$/;
  // ---------- Local state ----------
  const [homestay, setHomestay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errors, setErrors] = useState([]);
  const [form, setForm] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    identity: "",
  });

  // ---------- Fetch homestay ----------
  useEffect(() => {
    if (!homestayId) return;
    const fetch = async () => {
      try {
        const res = await axios.get(`/homestays/${homestayId}`);
        setHomestay(res.data.data.homestay);
      } catch {
        toast.error("Không thể tải thông tin homestay");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [homestayId]);

  useEffect(() => {
    if (user) {
      setForm((prevForm) => ({
        ...prevForm,
        email: user.email,
      }));
    }
  }, [homestayId, user]);

  // ---------- Derive booking ----------
  const booking = useMemo(() => {
    if (!homestay) return null;
    const fromDate = parseISO(query.dateFrom);
    const toDate = parseISO(query.dateTo);

    // Tính số ngày (>= 1)
    const nights = Math.max(1, differenceInCalendarDays(toDate, fromDate));
    const adults = Number(query.adults || 1);
    const children = Number(query.children || 0);
    const rooms = Number(query.rooms || 1);
    return {
      dateFrom: format(parseISO(query.dateFrom), "dd-MM-yyyy"),
      dateTo: format(parseISO(query.dateTo), "dd-MM-yyyy"),
      nights,
      adults,
      children,
      rooms,
      totalPrice: nights * homestay.price * rooms,
    };
  }, [homestay, query]);

  // ---------- Handlers ----------
  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    const errs = [];
    if (!form.fullName) errs.push("Vui lòng nhập họ tên");
    if (!form.phone) errs.push("Vui lòng nhập số điện thoại");
    if (!form.identity) errs.push("Vui lòng nhập CMND/CCCD");
    if (form.phone && !phoneRegex.test(form.phone))
      errs.push("SĐT phải có 10 số và bắt đầu bằng 0");
    if (form.identity && !identityRegex.test(form.identity))
      errs.push("CMND/CCCD phải gồm 12 số");

    if (errs.length) return setErrors(errs);
    setErrors([]);

    const payload = {
      homestay_id: homestayId,
      full_name: form.fullName,
      phone: form.phone,
      email: form.email,
      date_from: query.dateFrom,
      date_to: query.dateTo,
      numb_adult: Number(query.adults || 1),
      numb_child: Number(query.children || 0),
      identity_number: form.identity,
    };
    const a = booking.totalPrice;
    try {
      setLoading(true);
      // 1) Tạo booking (init)
      const booking = await createBooking(dispatch, payload);
      if (payment === "vnpay") {
        // const amount = a;
        
        // const payUrl = await createVNPayUrl({
        //   booking_id: booking._id,
        //   amount,
        // });

        // window.location.assign(payUrl);
        // return;
        setPaymentAlertOpen(true);
      }
      
      // Trường hợp không thanh toán online:
      toast.success("Tạo booking thành công!");
      setSuccessOpen(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Tạo booking không thành công, thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };
  const handleDialogChange = (open) => {
    setSuccessOpen(open);
    if (!open) navigate("/"); // đóng → điều hướng /
  };

  // ---------- Loading / error UI ----------
  if (loading) return <p className="text-center py-10">Đang tải thông tin…</p>;
  if (!homestay || !booking)
    return <p className="text-center py-10">Không tìm thấy homestay</p>;

  // ---------- UI ----------

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="bg-background border-b">
          <div className="container max-w-5xl mx-auto py-4">
            <h1 className="text-xl font-semibold">Check-in đặt phòng</h1>
            <p className="text-sm text-muted-foreground">
              Vui lòng nhập thông tin liên hệ &amp; CMND/CCCD để hoàn tất đặt
              phòng.
            </p>
          </div>
        </div>

        <div className="container max-w-5xl mx-auto py-6 flex flex-col lg:flex-row gap-6 flex-1">
          {/* LEFT COLUMN */}
          <div className="w-full lg:w-2/5 space-y-4 order-2 lg:order-1">
            {/* Homestay overview */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex gap-3">
                  <img
                    src={homestay.images?.[0]?.url || "/placeholder.png"}
                    alt="thumb"
                    className="h-16 w-20 object-cover rounded"
                  />
                  <div>
                    <p className="font-semibold">{homestay.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MdMap className="h-3 w-3" />
                      {homestay.address}
                    </p>
                    {homestay.avgStar ? (
                      <p className="text-xs flex items-center gap-1 mt-1">
                        <MdStar className="h-3 w-3 text-yellow-500" />
                        {homestay.avgStar?.toFixed(1) || 0} / 5
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        Chưa có đánh giá
                      </p>
                    )}
                  </div>
                </div>
                {/* TIỆN ÍCH PHỔ BIẾN */}
                <div className="space-y-2 mt-4">
                  <h3 className="text-xs font-medium">Tiện ích phổ biến</h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {homestay.amenities.slice(0, 12).map((a) => {
                      const Icon = MdIcons[a.icon_url] || MdCheckCircle;
                      return (
                        <div key={a._id} className="flex items-center gap-1">
                          <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
                          {a.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin đặt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                Chi tiết đơn đặt: <br></br>
                <p>
                  <b>Check‑in</b>: <b>{booking.dateFrom}</b>
                </p>
                <p>
                  <b>Check‑out</b>: <b>{booking.dateTo}</b>
                </p>
                <p>
                  Số lượng khách: <br></br>
                  <strong>
                    {booking.nights} đêm - {booking.adults} người lớn
                    {booking.children ? ` - ${booking.children} trẻ em` : ""}
                  </strong>
                </p>
              </CardContent>
            </Card>

            {/* Price summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tóm tắt giá</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>Giá gốc: {homestay.price.toLocaleString()} ₫ / đêm</p>
                <p>
                  Tổng:{" "}
                  <b className="text-lg">
                    {booking.totalPrice.toLocaleString()} ₫
                  </b>
                </p>
                <p className="text-xs text-muted-foreground">
                  Đã gồm thuế & phí
                </p>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN (FORM) */}
          <Card className="flex-1 order-1 lg:order-2">
            <CardHeader>
              <CardTitle className="text-base">
                Nhập thông tin của bạn
              </CardTitle>
            </CardHeader>
            {errors.length > 0 && (
              <div className="mx-4">
                <Alert variant="destructive" className={""}>
                  <AlertTitle>Kiểm tra lại thông tin của bạn</AlertTitle>

                  <AlertDescription>
                    <ul className="list-disc space-y-1 pl-4 text-sm mx-2">
                      {errors.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            )}
            <CardContent className="space-y-4">
              <div>
                <Label>Họ & tên *</Label>
                <Input
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                  className={"mt-2"}
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input value={form.email} disabled className={"mt-2"} />
              </div>

              <div>
                <Label>Số điện thoại *</Label>
                <Input
                  value={form.phone}
                  onChange={handleChange("phone")}
                  className={"mt-2"}
                />
              </div>
              <div>
                <Label>CMND/CCCD *</Label>
                <Input
                  value={form.identity}
                  onChange={handleChange("identity")}
                  className={"mt-2"}
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Thanh toán trước *</h3>

                <div className="flex flex-col gap-2 pl-1">
                  {/* 1. Thanh toán khi check-in */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      id="pay-checkin"
                      checked={payment === "checkin"}
                      onCheckedChange={() => setPayment("checkin")}
                    />
                    <span className="text-sm select-none">
                      Thanh toán khi check-in
                    </span>
                  </label>

                  {/* 2. Thanh toán online VNPay */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      id="pay-vnpay"
                      checked={payment === "vnpay"}
                      onCheckedChange={() => setPayment("vnpay")}
                    />
                    <span className="text-sm select-none">
                      Thanh toán&nbsp;online&nbsp;bằng&nbsp;VNPay
                    </span>
                  </label>
                </div>
              </div>
              {isAuthenticated ? (
                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Tiếp tục"}
                </Button>
              ) : (
                <AuthTabsDialog>
                  <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "Đang xử lý..." : "Tiếp tục"}
                  </Button>
                </AuthTabsDialog>
              )}
            </CardContent>
          </Card>
        </div>
        <Dialog open={successOpen} onOpenChange={handleDialogChange}>
          <DialogContent className="max-w-sm text-center space-y-4">
            <DialogHeader>
              <DialogTitle>Đặt phòng thành công!</DialogTitle>
              <DialogDescription>
                Cảm ơn bạn đã đặt phòng. Bạn có thể xem chi tiết ngay bây giờ.
              </DialogDescription>
            </DialogHeader>

            <Button
              className="w-full"
              onClick={() => navigate(`/customer-dashboard/booking-list`)}
            >
              Xem chi tiết đặt phòng
            </Button>
          </DialogContent>
        </Dialog>
        <div className="mt-32">
          <Footer />
        </div>
      </div>
      {/* Alert Dialog: Tính năng đang phát triển */}
      <AlertDialog open={paymentAlertOpen} onOpenChange={setPaymentAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tính năng đang phát triển</AlertDialogTitle>
            <AlertDialogDescription>
              Phần <b>thanh toán</b> hiện chưa khả dụng. Vui lòng quay
              lại sau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPaymentAlertOpen(false)}>
              Đóng
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => setPaymentAlertOpen(false)}>
              Ok
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
