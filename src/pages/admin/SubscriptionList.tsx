import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Pencil,
  Monitor,
  Wifi,
  Check,
  Users,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ─── Type Definition ─── */
type PackageStatus = "ACTIVE" | "ARCHIVED";

type SubPackage = {
  id: string;
  name: string;
  monthly_price: number;
  max_quality: string; // 480p, 720p, 1080p, 4K
  device_limit: number;
  description: string;
  created_at: string;
  status: PackageStatus; // Field giả lập để quản lý ẩn/hiện gói
  // Aggregate field (Count từ bảng user_subscriptions)
  active_subscribers: number;
};

/* ─── Mock Data ─── */
const initialPackages: SubPackage[] = [
  {
    id: "pkg-1",
    name: "Mobile Only",
    monthly_price: 50000,
    max_quality: "480p",
    device_limit: 1,
    description: "Good for mobile and tablet streaming.",
    created_at: "2023-01-01",
    status: "ACTIVE",
    active_subscribers: 1240,
  },
  {
    id: "pkg-2",
    name: "Basic HD",
    monthly_price: 120000,
    max_quality: "720p",
    device_limit: 2,
    description: "Watch on 2 screens at the same time.",
    created_at: "2023-01-01",
    status: "ACTIVE",
    active_subscribers: 5302,
  },
  {
    id: "pkg-3",
    name: "Standard FHD",
    monthly_price: 220000,
    max_quality: "1080p",
    device_limit: 4,
    description: "Full HD video quality, watch on 4 screens.",
    created_at: "2023-01-15",
    status: "ACTIVE",
    active_subscribers: 8100,
  },
  {
    id: "pkg-4",
    name: "Premium 4K",
    monthly_price: 260000,
    max_quality: "4K+HDR",
    device_limit: 5,
    description: "Best video quality, spatial audio included.",
    created_at: "2023-02-20",
    status: "ARCHIVED", // Gói cũ
    active_subscribers: 450, // Người dùng cũ vẫn còn dùng
  },
];

export default function SubscriptionList() {
  const [packages, setPackages] = useState<SubPackage[]>(initialPackages);
  const [query, setQuery] = useState("");

  /* Dialog State */
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  /* Form State */
  const [formData, setFormData] = useState({
    name: "",
    monthly_price: 0,
    max_quality: "1080p",
    device_limit: 1,
    description: "",
    status: "ACTIVE" as PackageStatus,
  });

  /* Format Currency */
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  /* Filter Logic */
  const filteredData = useMemo(() => {
    return packages.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [packages, query]);

  /* Handlers */
  const handleAdd = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      monthly_price: 0,
      max_quality: "1080p",
      device_limit: 1,
      description: "",
      status: "ACTIVE",
    });
    setIsOpen(true);
  };

  const handleEdit = (pkg: SubPackage) => {
    setIsEditing(true);
    setCurrentId(pkg.id);
    setFormData({
      name: pkg.name,
      monthly_price: pkg.monthly_price,
      max_quality: pkg.max_quality,
      device_limit: pkg.device_limit,
      description: pkg.description,
      status: pkg.status,
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return;

    if (isEditing && currentId) {
      // Update Logic
      setPackages((prev) =>
        prev.map((p) => (p.id === currentId ? { ...p, ...formData } : p))
      );
    } else {
      // Create Logic
      const newPkg: SubPackage = {
        id: `pkg-${Date.now()}`,
        created_at: new Date().toISOString(),
        active_subscribers: 0, // New package has 0 users
        ...formData,
      };
      setPackages((prev) => [...prev, newPkg]);
    }
    setIsOpen(false);
  };

  // Quick Status Toggle in Table
  const toggleStatus = (id: string) => {
    setPackages((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            status: p.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE",
          };
        }
        return p;
      })
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Gói Đăng Ký
          </h1>
          <p className="text-sm text-zinc-400">
            Quản lý các mức giá và lợi ích
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="mr-2 size-4" /> Tạo Gói
        </Button>
      </div>

      {/* ─── Search ─── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder="Tìm kiếm gói..."
          className="pl-9 bg-zinc-900 border-zinc-700"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* ─── Table ─── */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-950">
            <TableRow className="hover:bg-zinc-900">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Tên Gói</TableHead>
              <TableHead>Giá (Hàng Tháng)</TableHead>
              <TableHead>Chất Lượng</TableHead>
              <TableHead className="text-center">Thiết Bị</TableHead>
              <TableHead className="text-right">Người Đăng Ký</TableHead>
              <TableHead className="text-center">Trạng Thái</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((p) => (
              <TableRow
                key={p.id}
                className="hover:bg-zinc-800/50 border-zinc-800"
              >
                <TableCell>
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-800 text-zinc-400">
                    <Package className="size-4" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-white">{p.name}</span>
                    <span className="text-xs text-zinc-500 line-clamp-1">
                      {p.description}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-zinc-300 font-mono">
                  {formatMoney(p.monthly_price)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="border-zinc-700 text-teal-400"
                  >
                    {p.max_quality}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="inline-flex items-center gap-1 text-zinc-400 text-sm">
                    <Monitor className="size-3" />
                    {p.device_limit}
                  </div>
                </TableCell>

                {/* Active Subscribers Count */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-medium text-white">
                      {p.active_subscribers.toLocaleString()}
                    </span>
                    <Users className="size-3 text-zinc-500" />
                  </div>
                </TableCell>

                {/* Quick Status Toggle */}
                <TableCell className="text-center">
                  <Switch
                    checked={p.status === "ACTIVE"}
                    onCheckedChange={() => toggleStatus(p.id)}
                    className="data-[state=checked]:bg-teal-600"
                  />
                </TableCell>

                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(p)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <Pencil className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-zinc-500"
                >
                  Không tìm thấy gói nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ─── Add/Edit Dialog ─── */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Chỉnh Sửa Gói" : "Tạo Gói"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Cấu hình chi tiết và giới hạn đăng ký.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tên Gói</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-zinc-950 border-zinc-700"
                  placeholder="ví dụ: Premium"
                />
              </div>
              <div className="space-y-2">
                <Label>Giá Hàng Tháng (VND)</Label>
                <Input
                  type="number"
                  value={formData.monthly_price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthly_price: Number(e.target.value),
                    })
                  }
                  className="bg-zinc-950 border-zinc-700"
                />
              </div>
            </div>

            {/* Quality & Devices */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Chất Lượng Tối Đa</Label>
                <Select
                  value={formData.max_quality}
                  onValueChange={(v) =>
                    setFormData({ ...formData, max_quality: v })
                  }
                >
                  <SelectTrigger className="bg-zinc-950 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                    <SelectItem value="480p">480p (SD)</SelectItem>
                    <SelectItem value="720p">720p (HD)</SelectItem>
                    <SelectItem value="1080p">1080p (FHD)</SelectItem>
                    <SelectItem value="4K+HDR">4K + HDR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Giới Hạn Thiết Bị</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.device_limit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      device_limit: Number(e.target.value),
                    })
                  }
                  className="bg-zinc-950 border-zinc-700"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Mô Tả</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-zinc-950 border-zinc-700"
                rows={3}
              />
            </div>

            {/* Status (In Dialog) */}
            <div className="flex items-center justify-between rounded-lg border border-zinc-800 p-3 bg-zinc-950/50">
              <div className="space-y-0.5">
                <Label>Trạng Thái Gói</Label>
                <p className="text-xs text-zinc-500">
                  {formData.status === "ACTIVE"
                    ? "Hiển thị cho người dùng"
                    : "Ẩn khỏi trang giá"}
                </p>
              </div>
              <Select
                value={formData.status}
                onValueChange={(v) =>
                  setFormData({ ...formData, status: v as PackageStatus })
                }
              >
                <SelectTrigger className="w-[120px] h-8 bg-zinc-900 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                  <SelectItem value="ACTIVE">Hoạt Động</SelectItem>
                  <SelectItem value="ARCHIVED">Đã Lưu Trữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsOpen(false)}
              className="bg-zinc-800 hover:bg-zinc-700 text-white border-none"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Lưu Gói
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
