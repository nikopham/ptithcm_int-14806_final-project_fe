import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Search,
  Eye,
  CreditCard,
  User,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

/* ─── Type Definition ─── */
type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED";

type Transaction = {
  id: string;
  provider: string; // stripe | momo | vnpay
  amount: number;
  currency: string;
  status: TransactionStatus;
  payment_ref: string;
  metadata: any; // JSONB
  created_at: string;
  // Joined data
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  package: {
    id: string;
    name: string;
  };
};

/* ─── Mock Data ─── */
const mockTransactions: Transaction[] = [
  {
    id: "txn-1",
    provider: "VNPAY",
    amount: 260000,
    currency: "VND",
    status: "SUCCESS",
    payment_ref: "VN12345ABC",
    metadata: { package_id: "pkg-4", duration_months: 1, ip: "127.0.0.1" },
    created_at: "2023-11-10T10:00:00Z",
    user: {
      id: "u-1",
      name: "Alice Viewer",
      email: "alice@gmail.com",
      avatar_url: "https://i.pravatar.cc/150?img=1",
    },
    package: { id: "pkg-4", name: "Premium 4K" },
  },
  {
    id: "txn-2",
    provider: "Momo",
    amount: 120000,
    currency: "VND",
    status: "PENDING",
    payment_ref: "MM67890XYZ",
    metadata: {
      package_id: "pkg-2",
      duration_months: 1,
      note: "User processing",
    },
    created_at: "2023-11-11T14:30:00Z",
    user: {
      id: "u-2",
      name: "Bob User",
      email: "bob@yahoo.com",
      avatar_url: "https://i.pravatar.cc/150?img=2",
    },
    package: { id: "pkg-2", name: "Basic HD" },
  },
  {
    id: "txn-3",
    provider: "Stripe",
    amount: 50000,
    currency: "VND",
    status: "FAILED",
    payment_ref: "stripe_fail_123",
    metadata: { package_id: "pkg-1", error: "Insufficient funds." },
    created_at: "2023-11-11T09:15:00Z",
    user: {
      id: "u-3",
      name: "Charlie Spammer",
      email: "charlie@spam.com",
      avatar_url: undefined,
    },
    package: { id: "pkg-1", name: "Mobile Only" },
  },
];

/* ─── Helper Functions ─── */

// Format Currency
const formatMoney = (amount: number, currency: string) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

// Status Badge
const StatusBadge = ({ status }: { status: TransactionStatus }) => {
  switch (status) {
    case "SUCCESS":
      return (
        <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/50">
          <CheckCircle2 className="size-3 mr-1" /> Thành Công
        </Badge>
      );
    case "PENDING":
      return (
        <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/50">
          <Clock className="size-3 mr-1" /> Đang Chờ
        </Badge>
      );
    case "FAILED":
      return (
        <Badge className="bg-red-600/20 text-red-400 border-red-600/50">
          <XCircle className="size-3 mr-1" /> Thất Bại
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function TransactionList() {
  const [transactions, setTransactions] =
    useState<Transaction[]>(mockTransactions);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | TransactionStatus>(
    "ALL"
  );

  /* Dialog State */
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /* Filter Logic */
  const filteredData = useMemo(() => {
    const lowerQ = query.toLowerCase();
    return transactions.filter((t) => {
      const matchStatus = filterStatus === "ALL" || t.status === filterStatus;
      const matchSearch =
        t.user.name.toLowerCase().includes(lowerQ) ||
        t.user.email.toLowerCase().includes(lowerQ) ||
        t.payment_ref.toLowerCase().includes(lowerQ) ||
        t.package.name.toLowerCase().includes(lowerQ);

      return matchStatus && matchSearch;
    });
  }, [transactions, query, filterStatus]);

  /* Handlers */
  const handleView = (txn: Transaction) => {
    setSelectedTxn(txn);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Giao Dịch</h1>
          <p className="text-sm text-zinc-400">Xem lịch sử thanh toán và nhật ký</p>
        </div>
        {/* Total Stats (Optional) */}
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              {transactions.length}
            </p>
            <p className="text-xs text-zinc-500">Tổng Thanh Toán</p>
          </div>
        </div>
      </div>

      {/* ─── Filters ─── */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Tìm kiếm người dùng, ID tham chiếu, gói..."
            className="pl-9 bg-zinc-900 border-zinc-700"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <Select
          value={filterStatus}
          onValueChange={(v) => setFilterStatus(v as any)}
        >
          <SelectTrigger className="w-full sm:w-40 bg-zinc-900 border-zinc-700">
            <SelectValue placeholder="Trạng Thái" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
            <SelectItem value="ALL">Tất Cả Trạng Thái</SelectItem>
            <SelectItem value="SUCCESS">Thành Công</SelectItem>
            <SelectItem value="PENDING">Đang Chờ</SelectItem>
            <SelectItem value="FAILED">Thất Bại</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ─── Table ─── */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-950">
            <TableRow className="hover:bg-zinc-900">
              <TableHead className="w-[200px]">Người Dùng</TableHead>
              <TableHead>Chi Tiết</TableHead>
              <TableHead>Số Tiền</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="text-right">Ngày</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((t) => (
              <TableRow
                key={t.id}
                className="hover:bg-zinc-800/50 border-zinc-800"
              >
                {/* User Info */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={t.user.avatar_url} />
                      <AvatarFallback className="bg-zinc-800 text-zinc-400">
                        {t.user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white line-clamp-1">
                        {t.user.name}
                      </p>
                      <p className="text-xs text-zinc-500 line-clamp-1">
                        {t.user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Details (Package, Provider, Ref) */}
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <Package className="size-3 text-teal-500" />
                      <span className="text-sm font-semibold text-white">
                        {t.package.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="size-3 text-zinc-500" />
                      <span className="text-xs text-zinc-400">
                        {t.provider}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-600 font-mono">
                      {t.payment_ref}
                    </span>
                  </div>
                </TableCell>

                {/* Amount */}
                <TableCell className="font-mono text-zinc-300">
                  {formatMoney(t.amount, t.currency)}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <StatusBadge status={t.status} />
                </TableCell>

                {/* Date */}
                <TableCell className="text-right text-zinc-400 text-xs">
                  {format(new Date(t.created_at), "MMM dd, yyyy")}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleView(t)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <Eye className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-zinc-500"
                >
                  Không tìm thấy giao dịch nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ─── Detail Dialog ─── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[650px]">
          {selectedTxn && (
            <>
              <DialogHeader>
                <DialogTitle>Chi Tiết Giao Dịch</DialogTitle>
                <DialogDescription className="text-zinc-500 font-mono">
                  ID: {selectedTxn.id}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Main Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                  {/* Left Side: User/Package */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedTxn.user.avatar_url} />
                        <AvatarFallback>
                          {selectedTxn.user.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-white">
                          {selectedTxn.user.name}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {selectedTxn.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-zinc-800 pt-3">
                      <p className="text-xs text-zinc-500">Gói</p>
                      <p className="font-semibold text-teal-400">
                        {selectedTxn.package.name}
                      </p>
                    </div>
                  </div>
                  {/* Right Side: Amount/Status */}
                  <div className="space-y-4 rounded-md bg-zinc-900 p-4 border border-zinc-800">
                    <div>
                      <p className="text-xs text-zinc-500">Số Tiền Đã Thanh Toán</p>
                      <p className="text-2xl font-bold text-white">
                        {formatMoney(selectedTxn.amount, selectedTxn.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Trạng Thái</p>
                      <StatusBadge status={selectedTxn.status} />
                    </div>
                  </div>
                </div>

                {/* Payment Refs */}
                <div className="space-y-2 text-sm">
                  <h4 className="font-semibold text-zinc-300">Thông Tin Thanh Toán</h4>
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500">Nhà Cung Cấp</span>
                    <span className="text-white font-medium">
                      {selectedTxn.provider}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500">ID Tham Chiếu</span>
                    <span className="text-white font-mono text-xs">
                      {selectedTxn.payment_ref}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500">Thời Gian</span>
                    <span className="text-white">
                      {format(new Date(selectedTxn.created_at), "PPPpp")}
                    </span>
                  </div>
                </div>

                {/* Metadata JSON */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-zinc-400">
                    <Code2 className="size-4" /> Siêu Dữ Liệu (JSON)
                  </Label>
                  <ScrollArea className="h-[150px] w-full rounded-md border border-zinc-800 bg-zinc-950 p-4">
                    <pre className="text-xs text-zinc-300 whitespace-pre-wrap">
                      {JSON.stringify(selectedTxn.metadata, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700"
                >
                  Đóng
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
