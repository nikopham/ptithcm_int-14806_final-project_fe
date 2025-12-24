import {
  Users,
  Film,
  MessageSquare,
  Eye,
  BarChart3,
  Activity,
  Tag,
  Calendar,
} from "lucide-react";
import { LineChart, Line, Tooltip, ResponsiveContainer, XAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetOverviewQuery,
  useGetViewsChartQuery,
  useGetTopGenresQuery,
} from "@/features/dashboard/dashboardApi";
import { useMemo, useState } from "react";

// Format số với dấu phẩy
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("vi-VN").format(num);
};

export default function Dashboard() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Generate list of 5 recent years
  const recentYears = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, [currentYear]);

  // Fetch data from API
  const { data: overview, isLoading: overviewLoading } = useGetOverviewQuery();
  const { data: viewsChart = [], isLoading: chartLoading } =
    useGetViewsChartQuery(selectedYear);
  const { data: topGenres = [], isLoading: genresLoading } =
    useGetTopGenresQuery();

  // Format KPI data
  const kpis = useMemo(() => {
    if (!overview) return [];

    return [
      {
        label: "Tổng Người Dùng",
        value: formatNumber(overview.totalUsers),
        icon: Users,
      },
      {
        label: "Tổng Phim",
        value: formatNumber(overview.totalMovies),
        icon: Film,
      },
      {
        label: "Tổng Bình Luận",
        value: formatNumber(overview.totalComments),
        icon: MessageSquare,
      },
      {
        label: "Tổng Lượt Xem",
        value: formatNumber(overview.totalViews),
        icon: Eye,
      },
    ];
  }, [overview]);

  // Format chart data (12 months)
  const chartData = useMemo(() => {
    if (!viewsChart || viewsChart.length === 0) return [];

    const monthNames = [
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
      "T8",
      "T9",
      "T10",
      "T11",
      "T12",
    ];

    return viewsChart.map((value, index) => ({
      month: monthNames[index] || `T${index + 1}`,
      value: value,
    }));
  }, [viewsChart]);
  return (
    <div className="space-y-8 px-4 py-6">
      {/* ───── heading */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: "#C40E61" }}>
          <BarChart3 className="size-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* ───── KPI cards */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {overviewLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-white border-gray-200 shadow-sm">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="h-12 w-12 rounded-lg bg-gray-200 animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <div className="h-3 w-24 bg-gray-200 animate-pulse rounded mb-2" />
                    <div className="h-6 w-20 bg-gray-200 animate-pulse rounded" />
                  </div>
                </CardContent>
              </Card>
            ))
          : kpis.map((kpi) => (
              <Card
                key={kpi.label}
                className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div
                    className="grid h-12 w-12 place-items-center rounded-lg"
                    style={{ backgroundColor: "#C40E61" }}
                  >
                    <kpi.icon className="size-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {kpi.label}
                    </p>
                    <p className="text-xl font-bold text-gray-900 truncate">
                      {kpi.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* ───── views chart */}
      <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: "#C40E61" }}
              >
                <Activity className="size-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Lượt Xem Theo Tháng
              </h2>
            </div>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value, 10))}
            >
              <SelectTrigger className="w-[140px] bg-white border-gray-300 text-gray-900 hover:bg-gray-50 focus:ring-[#C40E61]">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" style={{ color: "#C40E61" }} />
                  <SelectValue placeholder="Chọn năm" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300 text-gray-900">
                {recentYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {chartLoading ? (
            <div className="h-[240px] flex items-center justify-center">
              <div className="text-sm text-gray-500">Đang tải dữ liệu...</div>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData}>
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  labelStyle={{ color: "#111827", fontWeight: 600 }}
                  itemStyle={{ color: "#C40E61" }}
                  formatter={(value: number) => formatNumber(value)}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#C40E61"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#C40E61" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center">
              <div className="text-sm text-gray-500">Không có dữ liệu</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ───── Top Genres */}
      {topGenres.length > 0 && (
        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: "#C40E61" }}
              >
                <Tag className="size-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Thể Loại Phổ Biến
              </h2>
            </div>
            {genresLoading ? (
              <div className="text-sm text-gray-500">Đang tải dữ liệu...</div>
            ) : (
              <div className="space-y-3">
                {topGenres.map((genre, index) => (
                  <div
                    key={genre.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:border-[#C40E61] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-white"
                        style={{ backgroundColor: "#C40E61" }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {genre.genreName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatNumber(genre.movieCount)} phim
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-lg font-bold"
                        style={{ color: "#C40E61" }}
                      >
                        {genre.movieCount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
