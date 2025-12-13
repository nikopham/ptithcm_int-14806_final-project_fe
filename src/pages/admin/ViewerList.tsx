import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Search,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Calendar,
  User as UserIcon,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
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
import { useDebounce } from "@/hooks/useDebounce";
import {
  useSearchViewersQuery,
  useUpdateUserStatusMutation,
} from "@/features/user/userApi";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { toast } from "sonner";
import type { User } from "@/types/user";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

/* ─── Type Definition ─── */
type Viewer = User & {
  active: boolean;
  stats?: {
    reviews?: number;
    comments?: number;
    last_login?: string;
  };
};

export default function ViewerList() {
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [filterActive, setFilterActive] = useState<"ALL" | "TRUE" | "FALSE">(
    "ALL"
  );
  const [filterVerified, setFilterVerified] = useState<
    "ALL" | "TRUE" | "FALSE"
  >("ALL");
  const PAGE_SIZE = 10;
  const debouncedQuery = useDebounce(query, 400);
  const { data, isFetching } = useSearchViewersQuery({
    query: debouncedQuery || undefined,
    page: currentPage + 1,
    size: PAGE_SIZE,
    isActive:
      filterActive === "ALL"
        ? undefined
        : filterActive === "TRUE"
          ? true
          : false,
    emailVerified:
      filterVerified === "ALL"
        ? undefined
        : filterVerified === "TRUE"
          ? true
          : false,
  });
  const [updateUserStatus, { isLoading: isUpdating }] =
    useUpdateUserStatusMutation();

  useEffect(() => {
    const list = (data?.content || []) as User[];
    const mapped: Viewer[] = list.map((u) => {
      const ru = u as unknown as Record<string, unknown>;
      const active =
        typeof ru.active === "boolean"
          ? (ru.active as boolean)
          : typeof ru.isActive === "boolean"
            ? (ru.isActive as boolean)
            : false;
      return { ...(u as User), active } as Viewer;
    });
    setViewers(mapped);
  }, [data]);

  /* Dialog State */
  const [selectedViewer, setSelectedViewer] = useState<Viewer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /* Filter Logic */
  const filteredData = viewers;
  const totalPages = data?.totalPages ?? 0;

  /* Toggle Status with Confirm + API */
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<{
    id: string;
    next: boolean;
  } | null>(null);

  const requestToggle = (id: string, next: boolean) => {
    setPendingToggle({ id, next });
    setConfirmOpen(true);
  };

  const confirmToggle = async () => {
    if (!pendingToggle) return;
    try {
      const { id, next } = pendingToggle;
      await updateUserStatus({ id, active: next }).unwrap();
      setViewers((prev) =>
        prev.map((v) => (v.id === id ? { ...v, active: next } : v))
      );
      if (selectedViewer?.id === id) {
        setSelectedViewer({ ...selectedViewer, active: next });
      }
      toast.success(`Đã cập nhật trạng thái người dùng thành ${next ? "Hoạt Động" : "Bị Cấm"}`);
    } catch (err: unknown) {
      let message = "Không thể cập nhật trạng thái người dùng. Vui lòng thử lại.";
      if (typeof err === "object" && err !== null) {
        const e = err as { data?: { message?: string }; message?: string };
        message = e.data?.message ?? e.message ?? message;
      }
      toast.error(message);
    } finally {
      setConfirmOpen(false);
      setPendingToggle(null);
    }
  };

  /* View Detail Handler */
  const handleView = (viewer: Viewer) => {
    setSelectedViewer(viewer);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Users className="size-6 text-[#C40E61]" />
            Quản Lý Người Xem
          </h1>
          <p className="text-sm text-gray-500">
            Quản lý người dùng đã đăng ký và quyền truy cập
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-white px-3 py-1 border border-gray-300 shadow-sm">
          <UserIcon className="size-4 text-[#C40E61]" />
          <span className="text-sm font-medium text-gray-900">
            {viewers.length} Người Dùng
          </span>
        </div>
      </div>

      {/* ─── Filters ─── */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Tìm kiếm tên người dùng hoặc email..."
            className="pl-9 bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C40E61]"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(0);
            }}
          />
        </div>

        <Select
          value={filterActive}
          onValueChange={(v) => {
            setFilterActive(v as "ALL" | "TRUE" | "FALSE");
            setCurrentPage(0);
          }}
        >
          <SelectTrigger className="w-full sm:w-40 bg-white border-gray-300 text-gray-700 hover:bg-gray-100">
            <SelectValue placeholder="Trạng Thái" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-300 text-gray-900">
            <SelectItem value="ALL">Tất Cả Trạng Thái</SelectItem>
            <SelectItem value="TRUE">Hoạt Động</SelectItem>
            <SelectItem value="FALSE">Bị Cấm</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterVerified}
          onValueChange={(v) => {
            setFilterVerified(v as "ALL" | "TRUE" | "FALSE");
            setCurrentPage(0);
          }}
        >
          <SelectTrigger className="w-full sm:w-44 bg-white border-gray-300 text-gray-700 hover:bg-gray-100">
            <SelectValue placeholder="Xác Thực" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-300 text-gray-900">
            <SelectItem value="ALL">Tất Cả Email</SelectItem>
            <SelectItem value="TRUE">Đã Xác Thực</SelectItem>
            <SelectItem value="FALSE">Chờ Xác Thực</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ─── Table ─── */}
      <div className="rounded-lg border border-gray-300 bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow className="hover:bg-gray-50">
              <TableHead className="min-w-[180px] sm:min-w-[250px]">Người Dùng</TableHead>
              <TableHead className="hidden sm:table-cell min-w-[200px]">Thông Tin Liên Hệ</TableHead>
              <TableHead className="text-center min-w-[100px]">Xác Thực</TableHead>
              <TableHead className="hidden md:table-cell min-w-[120px]">
                Ngày Tham Gia
              </TableHead>
              <TableHead className="text-center min-w-[100px]">Trạng Thái Hoạt Động</TableHead>
              <TableHead className="w-[60px] sm:w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isFetching &&
              filteredData.map((v) => (
                <TableRow
                  key={v.id}
                  className="hover:bg-gray-50 border-gray-200"
                >
                  {/* User Avatar & Username - Combined with email on mobile */}
                  <TableCell className="min-w-[180px] sm:min-w-[250px]">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 border border-gray-300">
                        <AvatarImage src={v.avatarUrl} />
                        <AvatarFallback className="bg-[#C40E61] text-white text-xs sm:text-sm">
                          {v.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{v.username}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 font-mono truncate hidden sm:block">
                          ID: {v.id}
                        </p>
                        {/* Show email on mobile */}
                        <div className="flex items-center gap-1 sm:hidden mt-0.5">
                          <Mail className="size-2.5 text-gray-500 shrink-0" />
                          <span className="text-[10px] text-gray-500 truncate">{v.email}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Email - Hidden on mobile */}
                  <TableCell className="hidden sm:table-cell min-w-[200px]">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="size-3 text-gray-500 shrink-0" />
                      <span className="truncate">{v.email}</span>
                    </div>
                  </TableCell>

                  {/* Verified Badge */}
                  <TableCell className="text-center min-w-[100px]">
                    {v.emailVerified ? (
                      <div className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-emerald-700 border border-emerald-300">
                        <ShieldCheck className="mr-0.5 sm:mr-1 size-2.5 sm:size-3" /> <span className="hidden sm:inline">Đã Xác Thực</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center rounded-full bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-gray-600 border border-gray-300">
                        <ShieldAlert className="mr-0.5 sm:mr-1 size-2.5 sm:size-3" /> <span className="hidden sm:inline">Chờ Xác Thực</span>
                      </div>
                    )}
                  </TableCell>

                  {/* Join Date - Hidden on mobile/tablet */}
                  <TableCell className="hidden md:table-cell text-gray-500 text-xs sm:text-sm min-w-[120px]">
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {v.createdAt
                        ? format(new Date(v.createdAt), "dd/MM/yyyy")
                        : "—"}
                    </div>
                  </TableCell>

                  {/* Quick Status Switch */}
                  <TableCell className="text-center min-w-[100px]">
                    <Switch
                      checked={v.active}
                      onCheckedChange={() => requestToggle(v.id, !v.active)}
                      className="data-[state=checked]:bg-[#C40E61]"
                    />
                  </TableCell>

                  {/* View Action */}
                  <TableCell className="w-[60px] sm:w-[80px]">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleView(v)}
                      className="h-7 w-7 sm:h-8 sm:w-8 text-gray-600 hover:text-[#C40E61] hover:bg-[#C40E61]/10"
                    >
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            {(filteredData.length === 0 || isFetching) && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-gray-500"
                >
                  {isFetching ? "Đang tải..." : "Không tìm thấy người xem nào."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ─── Pagination ─── */}
      <div className="flex justify-center pt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  !isFetching && currentPage > 0 && setCurrentPage((p) => p - 1)
                }
                className={
                  isFetching || currentPage === 0
                    ? "pointer-events-none opacity-50 text-gray-400"
                    : "cursor-pointer text-gray-700 hover:bg-gray-100"
                }
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-4 text-sm text-gray-500">
                Trang {currentPage + 1} / {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  !isFetching &&
                  currentPage < totalPages - 1 &&
                  setCurrentPage((p) => p + 1)
                }
                className={
                  isFetching || currentPage >= totalPages - 1
                    ? "pointer-events-none opacity-50 text-gray-400"
                    : "cursor-pointer text-gray-700 hover:bg-gray-100"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* ─── Detail Dialog ─── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border-gray-300 text-gray-900 sm:max-w-[500px]">
          {selectedViewer && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-gray-900">
                  <UserIcon className="size-5 text-[#C40E61]" />
                  Hồ Sơ Người Xem
                </DialogTitle>
                <DialogDescription className="text-gray-500">
                  Thông tin chi tiết về người dùng này.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-6">
                {/* Profile Header Card */}
                <div className="flex items-center gap-4 rounded-lg border border-gray-300 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm">
                  <Avatar className="h-16 w-16 border-2 border-gray-300">
                    <AvatarImage src={selectedViewer.avatarUrl} />
                    <AvatarFallback className="text-xl bg-[#C40E61] text-white">
                      {selectedViewer.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">
                        {selectedViewer.username}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-100"
                      >
                        Người Xem
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Mail className="size-3 text-gray-500" />
                      <p className="text-sm text-gray-600">
                        {selectedViewer.email}
                      </p>
                    </div>
                    <div className="mt-2 flex gap-2">
                      {selectedViewer.emailVerified && (
                        <span className="text-[10px] flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                          <ShieldCheck className="size-3 mr-1" /> Email Đã Xác Thực
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-md bg-white p-3 text-center border border-gray-300 shadow-sm">
                    <p className="text-xs text-gray-500">Đánh Giá</p>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedViewer.reviewCount ?? "—"}
                    </p>
                  </div>
                  <div className="rounded-md bg-white p-3 text-center border border-gray-300 shadow-sm">
                    <p className="text-xs text-gray-500">Bình Luận</p>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedViewer.commentCount ?? "—"}
                    </p>
                  </div>
                  <div className="rounded-md bg-white p-3 text-center border border-gray-300 shadow-sm">
                    <p className="text-xs text-gray-500">Tham Gia</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {selectedViewer.createdAt
                        ? format(new Date(selectedViewer.createdAt), "MMM yyyy")
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Calendar className="size-3 text-[#C40E61]" /> Ngày Tạo
                    </span>
                    <span className="text-gray-900">
                      {selectedViewer.createdAt
                        ? format(new Date(selectedViewer.createdAt), "PPpp")
                        : "—"}
                    </span>
                  </div>
                </div>

                {/* Status Control */}
                <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-900">
                      Trạng Thái Tài Khoản
                    </Label>
                    <p className="text-xs text-gray-500">
                      {selectedViewer.active
                        ? "Người dùng có thể đăng nhập và sử dụng nền tảng."
                        : "Người dùng bị cấm/tạm ngưng đăng nhập."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${selectedViewer.active ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {selectedViewer.active ? "Hoạt Động" : "Bị Cấm"}
                    </span>
                    <Switch
                      checked={selectedViewer.active}
                      onCheckedChange={() =>
                        requestToggle(selectedViewer.id, !selectedViewer.active)
                      }
                      className="data-[state=checked]:bg-[#C40E61]"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full bg-[#C40E61] hover:bg-[#C40E61]/90 text-white"
                >
                  Đóng Chi Tiết
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Confirm Update Status ─── */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => {
          if (!isUpdating) setConfirmOpen(false);
        }}
        onConfirm={confirmToggle}
        title="Cập nhật trạng thái người dùng?"
        description={
          pendingToggle
            ? pendingToggle.next
              ? "Điều này sẽ kích hoạt tài khoản người dùng và cho phép truy cập."
              : "Điều này sẽ cấm/tạm ngưng người dùng đăng nhập."
            : undefined
        }
        confirmText={pendingToggle?.next ? "Đặt Hoạt Động" : "Đặt Bị Cấm"}
        variant={pendingToggle?.next ? "default" : "destructive"}
        isLoading={isUpdating}
      />
    </div>
  );
}
