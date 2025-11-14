import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Search,
  Eye,
  Plus,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Clapperboard,
  MessagesSquare,
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
import { ConfirmDialog } from "@/components/common/ConfirmDialog"; // Import component chung

/* ─── Type Definition ─── */
type AdminRole = "movie_admin" | "comment_admin" | "super_admin";

type AdminUser = {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  stats?: {
    // Mock stats
    movies_added?: number;
    comments_moderated?: number;
    last_login: string;
  };
};

/* ─── Mock Data ─── */
const mockAdmins: AdminUser[] = [
  {
    id: "a-1",
    username: "admin_movie",
    email: "movie@admin.com",
    avatar_url: "https://i.pravatar.cc/150?img=50",
    role: "movie_admin",
    is_active: true,
    created_at: "2023-01-01T10:00:00Z",
    stats: { movies_added: 150, last_login: "1 hour ago" },
  },
  {
    id: "a-2",
    username: "mod_comment",
    email: "comment@admin.com",
    avatar_url: "https://i.pravatar.cc/150?img=51",
    role: "comment_admin",
    is_active: true,
    created_at: "2023-02-15T11:00:00Z",
    stats: { comments_moderated: 2300, last_login: "20 mins ago" },
  },
  {
    id: "a-3",
    username: "banned_admin",
    email: "banned@admin.com",
    avatar_url: undefined,
    role: "movie_admin",
    is_active: false,
    created_at: "2023-03-20T12:00:00Z",
    stats: { movies_added: 10, last_login: "3 months ago" },
  },
  {
    id: "sa-1",
    username: "SuperBoss",
    email: "super@admin.com",
    avatar_url: "https://i.pravatar.cc/150?img=60",
    role: "super_admin", // Sẽ bị lọc bỏ khỏi danh sách
    is_active: true,
    created_at: "2023-01-01T00:00:00Z",
    stats: { last_login: "5 mins ago" },
  },
];

/* ─── Form State for Create Dialog ─── */
const initialCreateForm = {
  username: "",
  email: "",
  password: "",
  role: "comment_admin" as AdminRole,
};

export default function AdminList() {
  const [admins, setAdmins] = useState<AdminUser[]>(mockAdmins);
  const [query, setQuery] = useState("");

  /* Dialog States */
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* Create Form State */
  const [createForm, setCreateForm] = useState(initialCreateForm);

  /* Filter Logic: Only show movie_admin and comment_admin */
  const filteredData = useMemo(() => {
    const lowerQ = query.toLowerCase();
    return admins.filter(
      (a) =>
        (a.role === "movie_admin" || a.role === "comment_admin") &&
        (a.username.toLowerCase().includes(lowerQ) ||
          a.email.toLowerCase().includes(lowerQ))
    );
  }, [admins, query]);

  /* Handlers */
  const toggleStatus = (id: string) => {
    setAdmins((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const newStatus = !a.is_active;
          if (selectedAdmin?.id === id) {
            setSelectedAdmin({ ...a, is_active: newStatus });
          }
          return { ...a, is_active: newStatus };
        }
        return a;
      })
    );
  };

  const handleUpdateRole = (newRole: AdminRole) => {
    if (!selectedAdmin) return;

    // Simulate API update
    const updatedAdmin = { ...selectedAdmin, role: newRole };
    setSelectedAdmin(updatedAdmin);
    setAdmins((prev) =>
      prev.map((a) => (a.id === selectedAdmin.id ? updatedAdmin : a))
    );
  };

  const handleView = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setIsViewOpen(true);
  };

  const handleOpenCreate = () => {
    setCreateForm(initialCreateForm);
    setIsCreateOpen(true);
  };

  const handleSaveNewAdmin = () => {
    if (!createForm.email || !createForm.username || !createForm.password) {
      alert("Please fill all fields"); // Simple validation
      return;
    }
    const newAdmin: AdminUser = {
      id: `a-${Date.now()}`,
      ...createForm,
      avatar_url: "",
      is_active: true,
      created_at: new Date().toISOString(),
      stats: { last_login: "Just now" },
    };
    setAdmins((prev) => [newAdmin, ...prev]);
    setIsCreateOpen(false);
  };

  const openDeleteConfirm = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setAdmins((prev) => prev.filter((a) => a.id !== deleteId));
      setDeleteId(null);
    }
  };

  /* Helper: Role Badge */
  const RoleBadge = ({ role }: { role: AdminRole }) => {
    if (role === "movie_admin") {
      return (
        <Badge className="bg-teal-600/20 text-teal-400 border-teal-600/50">
          Movie Admin
        </Badge>
      );
    }
    if (role === "comment_admin") {
      return (
        <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/50">
          Comment Admin
        </Badge>
      );
    }
    return <Badge variant="secondary">{role}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Management</h1>
          <p className="text-sm text-zinc-400">
            Manage internal staff roles and access
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="mr-2 size-4" /> Add Admin
        </Button>
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
              <TableHead className="w-[250px]">Admin</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">
                Joined Date
              </TableHead>
              <TableHead className="text-center">Active</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((a) => (
              <TableRow
                key={a.id}
                className="hover:bg-zinc-800/50 border-zinc-800"
              >
                {/* Admin Info */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={a.avatar_url} />
                      <AvatarFallback className="bg-zinc-800 text-zinc-400">
                        {a.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-medium text-white">{a.username}</p>
                  </div>
                </TableCell>

                <TableCell className="text-zinc-300">{a.email}</TableCell>
                <TableCell>
                  <RoleBadge role={a.role} />
                </TableCell>
                <TableCell className="hidden md:table-cell text-zinc-400">
                  {format(new Date(a.created_at), "MMM dd, yyyy")}
                </TableCell>

                {/* Status Switch */}
                <TableCell className="text-center">
                  <Switch
                    checked={a.is_active}
                    onCheckedChange={() => toggleStatus(a.id)}
                    className="data-[state=checked]:bg-teal-600"
                  />
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleView(a)}
                      className="text-zinc-400 hover:text-white"
                    >
                      {" "}
                      <Eye className="size-4" />{" "}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteConfirm(a.id)}
                      className="text-zinc-400 hover:text-red-500"
                    >
                      {" "}
                      <Trash2 className="size-4" />{" "}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-zinc-500"
                >
                  No admins found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ─── 1. View/Edit Dialog ─── */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[500px]">
          {selectedAdmin && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border-2 border-zinc-800">
                    <AvatarImage src={selectedAdmin.avatar_url} />
                    <AvatarFallback className="text-xl bg-teal-800 text-teal-200">
                      {selectedAdmin.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl">
                      {selectedAdmin.username}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      {selectedAdmin.email}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="py-4 space-y-4">
                {/* Stats */}
                <div className="flex justify-between rounded-md bg-zinc-950 p-3 text-center border border-zinc-800">
                  {selectedAdmin.role === "movie_admin" ? (
                    <div className="text-center">
                      <p className="text-xs text-zinc-500">Movies Added</p>
                      <p className="text-lg font-bold text-teal-400">
                        {selectedAdmin.stats?.movies_added || 0}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-xs text-zinc-500">
                        Comments Moderated
                      </p>
                      <p className="text-lg font-bold text-purple-400">
                        {selectedAdmin.stats?.comments_moderated || 0}
                      </p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-xs text-zinc-500">Last Active</p>
                    <p className="text-sm font-medium text-white mt-1">
                      {selectedAdmin.stats?.last_login}
                    </p>
                  </div>
                </div>

                {/* Change Role */}
                <div className="space-y-2">
                  <Label>Change Role</Label>
                  <Select
                    value={selectedAdmin.role}
                    onValueChange={(v) => handleUpdateRole(v as AdminRole)}
                  >
                    <SelectTrigger className="bg-zinc-950 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                      <SelectItem value="movie_admin">Movie Admin</SelectItem>
                      <SelectItem value="comment_admin">
                        Comment Admin
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Change Status */}
                <div className="flex items-center justify-between rounded-lg border border-zinc-800 p-4">
                  <div>
                    <Label className="text-base text-white">
                      Account Status
                    </Label>
                    <p className="text-xs text-zinc-500">
                      User can log in or is suspended.
                    </p>
                  </div>
                  <Switch
                    checked={selectedAdmin.is_active}
                    onCheckedChange={() => toggleStatus(selectedAdmin.id)}
                    className="data-[state=checked]:bg-teal-600"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => setIsViewOpen(false)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── 2. Create Dialog ─── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Admin</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Set credentials and role for the new staff member.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={createForm.username}
                onChange={(e) =>
                  setCreateForm({ ...createForm, username: e.target.value })
                }
                className="bg-zinc-950 border-zinc-700"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
                className="bg-zinc-950 border-zinc-700"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
                className="bg-zinc-950 border-zinc-700"
              />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select
                value={createForm.role}
                onValueChange={(v) =>
                  setCreateForm({ ...createForm, role: v as AdminRole })
                }
              >
                <SelectTrigger className="bg-zinc-950 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                  <SelectItem value="comment_admin">Comment Admin</SelectItem>
                  <SelectItem value="movie_admin">Movie Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsCreateOpen(false)}
              className="bg-zinc-800 hover:bg-zinc-700 text-white border-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveNewAdmin}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Create Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── 3. Delete Confirm Dialog ─── */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Admin User?"
        description="This will permanently delete the user. This action cannot be undone."
        confirmText="Delete User"
        variant="destructive"
      />
    </div>
  );
}
