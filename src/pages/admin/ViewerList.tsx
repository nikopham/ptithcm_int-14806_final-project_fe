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
      toast.success(`User status updated to ${next ? "Active" : "Banned"}`);
    } catch (err: unknown) {
      let message = "Failed to update user status. Please try again.";
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
          <h1 className="text-2xl font-bold text-white">Viewer Management</h1>
          <p className="text-sm text-zinc-400">
            Manage registered users and access
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-zinc-900 px-3 py-1 border border-zinc-800">
          <UserIcon className="size-4 text-teal-500" />
          <span className="text-sm font-medium text-zinc-300">
            {viewers.length} Users
          </span>
        </div>
      </div>

      {/* ─── Filters ─── */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search username or email..."
            className="pl-9 bg-zinc-900 border-zinc-700"
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
          <SelectTrigger className="w-full sm:w-40 bg-zinc-900 border-zinc-700">
            <SelectValue placeholder="Active" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="TRUE">Active</SelectItem>
            <SelectItem value="FALSE">Banned</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterVerified}
          onValueChange={(v) => {
            setFilterVerified(v as "ALL" | "TRUE" | "FALSE");
            setCurrentPage(0);
          }}
        >
          <SelectTrigger className="w-full sm:w-44 bg-zinc-900 border-zinc-700">
            <SelectValue placeholder="Verification" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
            <SelectItem value="ALL">All Emails</SelectItem>
            <SelectItem value="TRUE">Verified</SelectItem>
            <SelectItem value="FALSE">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ─── Table ─── */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-950">
            <TableRow className="hover:bg-zinc-900">
              <TableHead className="w-[250px]">User</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead className="text-center">Verified</TableHead>
              <TableHead className="hidden md:table-cell">
                Joined Date
              </TableHead>
              <TableHead className="text-center">Active Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isFetching &&
              filteredData.map((v) => (
                <TableRow
                  key={v.id}
                  className="hover:bg-zinc-800/50 border-zinc-800"
                >
                  {/* User Avatar & Username */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={v.avatarUrl} />
                        <AvatarFallback className="bg-teal-800 text-teal-200">
                          {v.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-white">{v.username}</p>
                        <p className="text-xs text-zinc-500 font-mono">
                          ID: {v.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell>
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Mail className="size-3 text-zinc-500" />
                      {v.email}
                    </div>
                  </TableCell>

                  {/* Verified Badge */}
                  <TableCell className="text-center">
                    {v.emailVerified ? (
                      <div className="inline-flex items-center justify-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500 ring-1 ring-inset ring-emerald-500/20">
                        <ShieldCheck className="mr-1 size-3" /> Verified
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center rounded-full bg-zinc-500/10 px-2 py-1 text-xs font-medium text-zinc-400 ring-1 ring-inset ring-zinc-500/20">
                        <ShieldAlert className="mr-1 size-3" /> Pending
                      </div>
                    )}
                  </TableCell>

                  {/* Join Date */}
                  <TableCell className="hidden md:table-cell text-zinc-400">
                    {v.createdAt
                      ? format(new Date(v.createdAt), "MMM dd, yyyy")
                      : "—"}
                  </TableCell>

                  {/* Quick Status Switch */}
                  <TableCell className="text-center">
                    <Switch
                      checked={v.active}
                      onCheckedChange={() => requestToggle(v.id, !v.active)}
                      className="data-[state=checked]:bg-teal-600"
                    />
                  </TableCell>

                  {/* View Action */}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleView(v)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <Eye className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            {(filteredData.length === 0 || isFetching) && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-zinc-500"
                >
                  {isFetching ? "Loading..." : "No viewers found."}
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
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-4 text-sm text-zinc-400">
                Page {currentPage + 1} of {totalPages}
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
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* ─── Detail Dialog ─── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[500px]">
          {selectedViewer && (
            <>
              <DialogHeader>
                <DialogTitle>Viewer Profile</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Detailed information about this user.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-6">
                {/* Profile Header Card */}
                <div className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                  <Avatar className="h-16 w-16 border-2 border-zinc-800">
                    <AvatarImage src={selectedViewer.avatarUrl} />
                    <AvatarFallback className="text-xl bg-teal-800 text-teal-200">
                      {selectedViewer.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">
                        {selectedViewer.username}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="bg-zinc-800 text-zinc-400 hover:bg-zinc-800"
                      >
                        Viewer
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-500">
                      {selectedViewer.email}
                    </p>
                    <div className="mt-2 flex gap-2">
                      {selectedViewer.emailVerified && (
                        <span className="text-[10px] flex items-center text-emerald-500">
                          <ShieldCheck className="size-3 mr-1" /> Email Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-md bg-zinc-900 p-3 text-center border border-zinc-800">
                    <p className="text-xs text-zinc-500">Reviews</p>
                    <p className="text-xl font-bold text-white">
                      {selectedViewer.reviewCount ?? "—"}
                    </p>
                  </div>
                  <div className="rounded-md bg-zinc-900 p-3 text-center border border-zinc-800">
                    <p className="text-xs text-zinc-500">Comments</p>
                    <p className="text-xl font-bold text-white">
                      {selectedViewer.commentCount ?? "—"}
                    </p>
                  </div>
                  <div className="rounded-md bg-zinc-900 p-3 text-center border border-zinc-800">
                    <p className="text-xs text-zinc-500">Joined</p>
                    <p className="text-sm font-medium text-white mt-1">
                      {selectedViewer.createdAt
                        ? format(new Date(selectedViewer.createdAt), "MMM yyyy")
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Calendar className="size-3" /> Created At
                    </span>
                    <span className="text-white">
                      {selectedViewer.createdAt
                        ? format(new Date(selectedViewer.createdAt), "PPpp")
                        : "—"}
                    </span>
                  </div>
                </div>

                {/* Status Control */}
                <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base text-white">
                      Account Status
                    </Label>
                    <p className="text-xs text-zinc-500">
                      {selectedViewer.active
                        ? "User can log in and use the platform."
                        : "User is banned/suspended from logging in."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${selectedViewer.active ? "text-emerald-500" : "text-red-500"}`}
                    >
                      {selectedViewer.active ? "Active" : "Banned"}
                    </span>
                    <Switch
                      checked={selectedViewer.active}
                      onCheckedChange={() =>
                        requestToggle(selectedViewer.id, !selectedViewer.active)
                      }
                      className="data-[state=checked]:bg-teal-600"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white"
                >
                  Close Details
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
        title="Update user status?"
        description={
          pendingToggle
            ? pendingToggle.next
              ? "This will activate the user account and allow access."
              : "This will ban/suspend the user from logging in."
            : undefined
        }
        confirmText={pendingToggle?.next ? "Set Active" : "Set Banned"}
        variant={pendingToggle?.next ? "default" : "destructive"}
        isLoading={isUpdating}
      />
    </div>
  );
}
