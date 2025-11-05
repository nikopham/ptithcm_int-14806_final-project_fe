import React, { useEffect, useMemo, useState } from "react";
import axios from "../../services/axiosInstance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Users, ClipboardList, Info } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const STATUS_ORDER = ["init", "check-in", "check-out", "cancelled"];
const STATUS_LABEL = {
  init: "Chờ check-in",
  "check-in": "Đang ở",
  "check-out": "Đã trả phòng",
  cancelled: "Đã hủy",
};

const STATUS_COLORS = {
  init: "#F59E0B", // amber-500
  "check-in": "#3B82F6", // blue-500
  "check-out": "#10B981", // emerald-500
  cancelled: "#EF4444", // red-500
};

function toYMD(date) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function rangeToFromTo(value) {
  const now = new Date();
  const to = toYMD(now);
  const from = new Date(now);
  switch (value) {
    case "7d":
      from.setDate(from.getDate() - 6);
      break;
    case "30d":
      from.setDate(from.getDate() - 29);
      break;
    case "90d":
      from.setDate(from.getDate() - 89);
      break;
    case "ytd": {
      from.setMonth(0, 1);
      from.setHours(0, 0, 0, 0);
      break;
    }
    default:
      from.setDate(from.getDate() - 29);
  }
  return { from: toYMD(from), to };
}

const mockSummary = { bookings_total: 42, customers_total: 18 };
const mockByStatus = [
  { status: "init", count: 9 },
  { status: "check-in", count: 6 },
  { status: "check-out", count: 20 },
  { status: "cancelled", count: 7 },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({
    bookings_total: 0,
    customers_total: 0,
  });
  const [byStatus, setByStatus] = useState([]);
  const [range, setRange] = useState("30d");

  const { from, to } = useMemo(() => rangeToFromTo(range), [range]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [sumRes, statusRes] = await Promise.all([
        axios.get("/admin/metrics/summary"),
        axios.get("/admin/metrics/bookings-by-status", {
          params: { from, to },
        }),
      ]);

      const s = sumRes?.data?.data || mockSummary;
      const bs = statusRes?.data?.data || mockByStatus;

      setSummary({
        bookings_total: Number(s.bookings_total) || 0,
        customers_total: Number(s.customers_total) || 0,
      });

      const normalized = STATUS_ORDER.map((st) => ({
        status: st,
        count: Number(bs.find((x) => x.status === st)?.count || 0),
        label: STATUS_LABEL[st],
      }));
      setByStatus(normalized);
    } catch (e) {
      // Use mock data in case API not ready
      setSummary(mockSummary);
      setByStatus(
        STATUS_ORDER.map((st) => ({
          status: st,
          count: Number(mockByStatus.find((x) => x.status === st)?.count || 0),
          label: STATUS_LABEL[st],
        }))
      );
      setError(e?.response?.data?.message || "Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  const totalInRange = useMemo(
    () => byStatus.reduce((a, b) => a + b.count, 0),
    [byStatus]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Tổng quan hệ thống</h2>
          <p className="text-sm text-muted-foreground">
            Khoảng thời gian: {from} → {to}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Chọn khoảng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 ngày</SelectItem>
              <SelectItem value="30d">30 ngày</SelectItem>
              <SelectItem value="90d">90 ngày</SelectItem>
              <SelectItem value="ytd">Từ đầu năm</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Làm mới
          </Button>
        </div>
      </div>

      {error && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Thông báo</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> Tổng số booking
            </CardTitle>
            <CardDescription>Tất cả thời gian</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-semibold">
                {summary.bookings_total}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="w-4 h-4" /> Tổng số khách hàng
            </CardTitle>
            <CardDescription>Tất cả thời gian</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-semibold">
                {summary.customers_total}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Tổng booking trong khoảng
            </CardTitle>
            <CardDescription>
              {from} → {to}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-semibold">{totalInRange}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Booking theo trạng thái (Bar)
            </CardTitle>
            <CardDescription>
              {from} → {to}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {loading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(v) => [v, "Số booking"]} />
                  <Legend />
                  {STATUS_ORDER.map((st) => (
                    <Bar
                      key={st}
                      dataKey={(d) => (d.status === st ? d.count : 0)}
                      name={STATUS_LABEL[st]}
                      fill={STATUS_COLORS[st]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Tỷ lệ trạng thái (Pie)
            </CardTitle>
            <CardDescription>
              {from} → {to}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {loading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="count"
                    nameKey="label"
                    data={byStatus}
                    outerRadius={100}
                    label
                  >
                    {byStatus.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
