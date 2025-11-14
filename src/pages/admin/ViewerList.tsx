import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Search,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Calendar,
  User as UserIcon,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
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

/* ─── Type Definition ─── */
type Viewer = {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  role: "viewer"; // Hardcode vì list này chỉ hiện viewer
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  // Mock stats (số liệu giả lập để hiển thị chi tiết cho đẹp)
  stats?: {
    reviews: number;
    comments: number;
    last_login: string;
  };
};

/* ─── Mock Data ─── */
const mockViewers: Viewer[] = [
  {
    id: "u-1",
    username: "movie_buff_99",
    email: "alice@gmail.com",
    avatar_url: "https://i.pravatar.cc/150?img=1",
    role: "viewer",
    email_verified: true,
    is_active: true,
    created_at: "2023-01-15T08:30:00Z",
    stats: { reviews: 12, comments: 45, last_login: "2 hours ago" },
  },
  {
    id: "u-2",
    username: "johnny_d",
    email: "john.doe@yahoo.com",
    avatar_url: undefined, // Test fallback avatar
    role: "viewer",
    email_verified: false,
    is_active: true,
    created_at: "2023-03-10T14:20:00Z",
    stats: { reviews: 0, comments: 2, last_login: "5 days ago" },
  },
  {
    id: "u-3",
    username: "spammer_bot",
    email: "bot@spam.net",
    avatar_url: "https://i.pravatar.cc/150?img=11",
    role: "viewer",
    email_verified: false,
    is_active: false, // Banned user
    created_at: "2023-11-01T09:00:00Z",
    stats: { reviews: 0, comments: 100, last_login: "1 month ago" },
  },
];

export default function ViewerList() {
  const [viewers, setViewers] = useState<Viewer[]>(mockViewers);
  const [query, setQuery] = useState("");

  /* Dialog State */
  const [selectedViewer, setSelectedViewer] = useState<Viewer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /* Filter Logic */
  const filteredData = useMemo(() => {
    const lowerQ = query.toLowerCase();
    return viewers.filter(
      (v) =>
        v.username.toLowerCase().includes(lowerQ) ||
        v.email.toLowerCase().includes(lowerQ)
    );
  }, [viewers, query]);

  /* Toggle Status Handler */
  const toggleStatus = (id: string) => {
    setViewers((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const newStatus = !v.is_active;
          // Update selectedViewer if dialog is open
          if (selectedViewer?.id === id) {
            setSelectedViewer({ ...v, is_active: newStatus });
          }
          return { ...v, is_active: newStatus };
        }
        return v;
      })
    );
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

      {/* ─── Search ─── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder="Search username or email..."
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
            {filteredData.map((v) => (
              <TableRow
                key={v.id}
                className="hover:bg-zinc-800/50 border-zinc-800"
              >
                {/* User Avatar & Username */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={v.avatar_url} />
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
                  {v.email_verified ? (
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
                  {format(new Date(v.created_at), "MMM dd, yyyy")}
                </TableCell>

                {/* Quick Status Switch */}
                <TableCell className="text-center">
                  <Switch
                    checked={v.is_active}
                    onCheckedChange={() => toggleStatus(v.id)}
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
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-zinc-500"
                >
                  No viewers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
                    <AvatarImage src={selectedViewer.avatar_url} />
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
                      {selectedViewer.email_verified && (
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
                      {selectedViewer.stats?.reviews}
                    </p>
                  </div>
                  <div className="rounded-md bg-zinc-900 p-3 text-center border border-zinc-800">
                    <p className="text-xs text-zinc-500">Comments</p>
                    <p className="text-xl font-bold text-white">
                      {selectedViewer.stats?.comments}
                    </p>
                  </div>
                  <div className="rounded-md bg-zinc-900 p-3 text-center border border-zinc-800">
                    <p className="text-xs text-zinc-500">Joined</p>
                    <p className="text-sm font-medium text-white mt-1">
                      {format(new Date(selectedViewer.created_at), "MMM yyyy")}
                    </p>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Activity className="size-3" /> Last Active
                    </span>
                    <span className="text-white">
                      {selectedViewer.stats?.last_login}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Calendar className="size-3" /> Created At
                    </span>
                    <span className="text-white">
                      {format(new Date(selectedViewer.created_at), "PPpp")}
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
                      {selectedViewer.is_active
                        ? "User can log in and use the platform."
                        : "User is banned/suspended from logging in."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${selectedViewer.is_active ? "text-emerald-500" : "text-red-500"}`}
                    >
                      {selectedViewer.is_active ? "Active" : "Banned"}
                    </span>
                    <Switch
                      checked={selectedViewer.is_active}
                      onCheckedChange={() => toggleStatus(selectedViewer.id)}
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
    </div>
  );
}
