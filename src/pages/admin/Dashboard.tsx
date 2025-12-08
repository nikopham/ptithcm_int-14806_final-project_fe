import {
  Users,
  Film,
  Wallet,
  Clock3,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { LineChart, Line, Tooltip, ResponsiveContainer, XAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

/* ───── mock stats ───── */
const KPIS = [
  {
    label: "Tổng Người Dùng",
    value: "40,689",
    icon: Users,
    diff: "+8.5%",
    trend: "up",
  },
  {
    label: "Đăng Ký Đang Hoạt Động",
    value: "10,293",
    icon: Film,
    diff: "+1.3%",
    trend: "up",
  },
  {
    label: "Tổng Doanh Thu",
    value: "$89,000",
    icon: Wallet,
    diff: "-4.3%",
    trend: "down",
  },
  {
    label: "Thanh Toán Đang Chờ",
    value: "2,040",
    icon: Clock3,
    diff: "+1.8%",
    trend: "up",
  },
];

/* ───── mock sales trend ───── */
const sales = Array.from({ length: 30 }).map((_, i) => ({
  day: i + 1,
  value: Math.round(20 + Math.random() * 80),
}));

/* ───── mock deals table ───── */
const deals = [
  {
    product: "Premium Plan – Annual",
    user: "Niko Nguyen",
    date: "12.05.2025 – 14:32",
    amount: "$119.99",
    status: "Success",
  },
  {
    product: "Movie Upload: Oppenheimer",
    user: "Movie Admin",
    date: "11.05.2025 – 10:02",
    amount: "-",
    status: "Published",
  },
  {
    product: "Ro-Coin Top-up • 500K",
    user: "Bao Tran",
    date: "10.05.2025 – 19:07",
    amount: "₫500,000",
    status: "Pending",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-10">
      {/* ───── heading */}
      <h1 className="text-2xl font-bold text-white">Bảng Điều Khiển</h1>

      {/* ───── KPI cards */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => (
          <Card key={kpi.label} className="bg-zinc-900">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="grid h-12 w-12 place-items-center rounded-md bg-zinc-800">
                <kpi.icon className="size-6 text-teal-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-zinc-400">
                  {kpi.label}
                </p>
                <p className="text-xl font-bold text-white">{kpi.value}</p>
              </div>
              <span
                className={`flex items-center gap-1 text-sm ${
                  kpi.trend === "up" ? "text-emerald-400" : "text-red-500"
                }`}
              >
                {kpi.trend === "up" ? (
                  <TrendingUp className="size-4" />
                ) : (
                  <TrendingDown className="size-4" />
                )}
                {kpi.diff}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ───── sales chart */}
      <Card className="bg-zinc-900">
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Doanh Thu Đăng Ký Hàng Ngày
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={sales}>
              <XAxis dataKey="day" tick={{ fill: "#71717a", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "none" }}
                labelStyle={{ color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ───── deals table */}
      <Card className="bg-zinc-900">
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Hoạt Động Gần Đây
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="py-2 pr-4">Mục</th>
                  <th className="py-2 pr-4">Người Dùng</th>
                  <th className="py-2 pr-4">Ngày – Giờ</th>
                  <th className="py-2 pr-4">Số Tiền</th>
                  <th className="py-2 pr-4">Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((d) => (
                  <tr key={d.product} className="border-b border-zinc-800">
                    <td className="py-3 pr-4 text-white">{d.product}</td>
                    <td className="py-3 pr-4 text-zinc-300">{d.user}</td>
                    <td className="py-3 pr-4 text-zinc-300">{d.date}</td>
                    <td className="py-3 pr-4 text-zinc-300">{d.amount}</td>
                    <td>
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          d.status === "Success"
                            ? "bg-emerald-600"
                            : d.status === "Pending"
                              ? "bg-yellow-500 text-black"
                              : "bg-teal-700"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
