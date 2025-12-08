import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Search, Eye, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Label usage moved into child components
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
import EditAdminDialog from "@/components/admin/user/EditAdminDialog";
import CreateAdminDialog from "@/components/admin/user/CreateAdminDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog"; // Import component chung
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import {
  useSearchAdminsQuery,
  useCreateAdminMutation,
  useUpdateUserStatusMutation,
  useUpdateAdminMutation,
  useResetAdminPasswordMutation,
  useDeleteAdminMutation,
} from "@/features/user/userApi";
import type { User } from "@/types/user";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

const initialCreateForm = {
  username: "",
  email: "",
  password: "",
  role: "comment_admin" as AdminRole,
  avatarFile: null as File | null,
};

export default function AdminList() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [createErrors, setCreateErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
  }>({});
  const [filterActive, setFilterActive] = useState<"ALL" | "TRUE" | "FALSE">(
    "ALL"
  );
  const [filterRole, setFilterRole] = useState<
    "ALL" | "movie_admin" | "comment_admin"
  >("ALL");
  const PAGE_SIZE = 10;
  const debouncedQuery = useDebounce(query, 400);
  const { data, isFetching, isError } = useSearchAdminsQuery({
    query: debouncedQuery || undefined,
    page: currentPage + 1,
    size: PAGE_SIZE,
    isActive:
      filterActive === "ALL"
        ? undefined
        : filterActive === "TRUE"
          ? true
          : false,
    roleCode: filterRole === "ALL" ? undefined : filterRole,
  });
  const [updateUserStatus, { isLoading: isUpdating }] =
    useUpdateUserStatusMutation();

  /* Dialog States */
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteAdmin, { isLoading: isDeleting }] = useDeleteAdminMutation();
  const [cannotDeleteOpen, setCannotDeleteOpen] = useState(false);

  /* Create Form State */
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();
  const [updateAdmin, { isLoading: isUpdatingAdmin }] =
    useUpdateAdminMutation();
  const [resetAdminPassword, { isLoading: isResettingPassword }] =
    useResetAdminPasswordMutation();

  /* Edit Form State */
  const [editForm, setEditForm] = useState<{
    username: string;
    email: string;
    role: AdminRole;
    avatarFile: File | null;
    newPassword: string;
  }>({
    username: "",
    email: "",
    role: "comment_admin",
    avatarFile: null,
    newPassword: "",
  });
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(
    null
  );
  const [editErrors, setEditErrors] = useState<{
    username?: string;
    email?: string;
  }>({});

  /* Validation helpers */
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  };
  const validateUsername = (username: string) => {
    const re = /^[A-Za-z0-9_. ]{3,32}$/; // 3-32 chars, letters/numbers/_/.
    return re.test(username.trim());
  };
  const validatePassword = (password: string) => {
    // Min 8, at least one uppercase, one lowercase, one number, one special
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return re.test(password);
  };

  useEffect(() => {
    if (editForm.avatarFile) {
      const url = URL.createObjectURL(editForm.avatarFile);
      setAvatarPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    setAvatarPreviewUrl(null);
    return;
  }, [editForm.avatarFile]);

  useEffect(() => {
    const list = (data?.content || []) as User[];
    const mapped: AdminUser[] = list.map((u) => {
      const ru = u as unknown as Record<string, unknown>;
      const active =
        typeof ru.active === "boolean"
          ? (ru.active as boolean)
          : typeof ru.isActive === "boolean"
            ? (ru.isActive as boolean)
            : false;
      const role: AdminRole =
        filterRole !== "ALL"
          ? (filterRole as AdminRole)
          : ((ru.roleCode as AdminRole) ?? "comment_admin");
      return {
        id: u.id,
        username: u.username,
        email: u.email,
        avatar_url: u.avatarUrl,
        role,
        is_active: active,
        created_at: u.createdAt,
        stats: {
          movies_added: u.createdMovieCount,
          comments_moderated: u.adminCommentCount,
          last_login: "",
        },
      } as AdminUser;
    });
    setAdmins(mapped);
  }, [data, filterRole]);

  const filteredData = admins;
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
      setAdmins((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_active: next } : a))
      );
      if (selectedAdmin?.id === id) {
        setSelectedAdmin({ ...selectedAdmin, is_active: next });
      }
    } catch {
      // Optional: surface error toast
    } finally {
      setConfirmOpen(false);
      setPendingToggle(null);
    }
  };

  // Role changes are handled in the Edit Profile section via updateAdmin

  const handleView = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setEditForm({
      username: admin.username,
      email: admin.email,
      role: admin.role,
      avatarFile: null,
      newPassword: "",
    });
    setAvatarPreviewUrl(null);
    setIsViewOpen(true);
  };

  const handleOpenCreate = () => {
    setCreateForm(initialCreateForm);
    setCreateErrors({});
    setIsCreateOpen(true);
  };

  const handleSaveNewAdmin = async () => {
    // Validate fields
    const errs: typeof createErrors = {};
    if (!validateUsername(createForm.username)) {
      errs.username = "Username must be 3-32 chars (letters, numbers, _ .)";
    }
    if (!validateEmail(createForm.email)) {
      errs.email = "Invalid email format";
    }
    if (!validatePassword(createForm.password)) {
      errs.password =
        "Password must be ≥8 chars and include upper, lower, number, special";
    }
    setCreateErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fix form validation errors");
      return;
    }
    const fd = new FormData();
    fd.append("username", createForm.username);
    fd.append("email", createForm.email);
    fd.append("password", createForm.password);
    fd.append(
      "roleCode",
      createForm.role === "movie_admin" ? "movie_admin" : "comment_admin"
    );
    if (createForm.avatarFile) {
      fd.append("avatar", createForm.avatarFile, createForm.avatarFile.name);
    }
    try {
      await createAdmin(fd).unwrap();
      toast.success("Admin created successfully");
      setIsCreateOpen(false);
      setCreateForm(initialCreateForm);
      setCreateErrors({});
      setCurrentPage(0);
    } catch {
      // Optional: surface error to user
    }
  };

  const openDeleteConfirm = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAdmin(deleteId).unwrap();
      setAdmins((prev) => prev.filter((a) => a.id !== deleteId));
      toast.success("Admin deleted successfully");
      setDeleteId(null);
    } catch {
      setDeleteId(null);
      setCannotDeleteOpen(true);
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
          value={filterRole}
          onValueChange={(v) => {
            setFilterRole(v as "ALL" | "movie_admin" | "comment_admin");
            setCurrentPage(0);
          }}
        >
          <SelectTrigger className="w-full sm:w-44 bg-zinc-900 border-zinc-700">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="movie_admin">Movie Admin</SelectItem>
            <SelectItem value="comment_admin">Comment Admin</SelectItem>
          </SelectContent>
        </Select>

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
      </div>

      {/* ─── Table ─── */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-950">
            <TableRow className="hover:bg-zinc-900">
              <TableHead className="min-w-[180px] sm:min-w-[250px]">Admin</TableHead>
              <TableHead className="hidden sm:table-cell min-w-[200px]">Email</TableHead>
              <TableHead className="min-w-[120px]">Role</TableHead>
              <TableHead className="hidden md:table-cell min-w-[120px]">
                Joined Date
              </TableHead>
              <TableHead className="text-center min-w-[100px]">Active</TableHead>
              <TableHead className="w-[100px] sm:w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-zinc-500"
                >
                  {isError ? "Failed to load admins." : "No admins found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((a) => (
                <TableRow
                  key={a.id}
                  className="hover:bg-zinc-800/50 border-zinc-800"
                >
                  {/* Admin Info - Combined with email on mobile */}
                  <TableCell className="min-w-[180px] sm:min-w-[250px]">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
                        <AvatarImage src={a.avatar_url} />
                        <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs sm:text-sm">
                          {a.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-white truncate">{a.username}</p>
                        {/* Show email on mobile */}
                        <p className="text-[10px] text-zinc-400 truncate sm:hidden mt-0.5">{a.email}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Email - Hidden on mobile */}
                  <TableCell className="hidden sm:table-cell text-zinc-300 text-xs sm:text-sm min-w-[200px]">
                    <span className="truncate block">{a.email}</span>
                  </TableCell>
                  
                  <TableCell className="min-w-[120px]">
                    <RoleBadge role={a.role} />
                  </TableCell>
                  
                  {/* Join Date - Hidden on mobile/tablet */}
                  <TableCell className="hidden md:table-cell text-zinc-400 text-xs sm:text-sm min-w-[120px]">
                    {format(new Date(a.created_at), "MMM dd, yyyy")}
                  </TableCell>

                  {/* Status Switch */}
                  <TableCell className="text-center min-w-[100px]">
                    <Switch
                      checked={a.is_active}
                      onCheckedChange={() => requestToggle(a.id, !a.is_active)}
                      className="data-[state=checked]:bg-teal-600"
                    />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="w-[100px] sm:w-[120px]">
                    <div className="flex gap-0.5 sm:gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(a)}
                        className="h-7 w-7 sm:h-8 sm:w-8 text-zinc-400 hover:text-white"
                      >
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteConfirm(a.id)}
                        className="h-7 w-7 sm:h-8 sm:w-8 text-zinc-400 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
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
                Page {currentPage + 1} of {data?.totalPages ?? 0}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  !isFetching &&
                  currentPage < (data?.totalPages ?? 0) - 1 &&
                  setCurrentPage((p) => p + 1)
                }
                className={
                  isFetching || currentPage >= (data?.totalPages ?? 0) - 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* ─── 1. View/Edit Dialog ─── */}
      {selectedAdmin && (
        <EditAdminDialog
          open={isViewOpen}
          onOpenChange={setIsViewOpen}
          selectedAdmin={selectedAdmin}
          editForm={editForm}
          setEditForm={setEditForm}
          avatarPreviewUrl={avatarPreviewUrl}
          setAvatarPreviewUrl={setAvatarPreviewUrl}
          editErrors={editErrors}
          setEditErrors={setEditErrors}
          showEditPassword={showEditPassword}
          setShowEditPassword={setShowEditPassword}
          resetPasswordError={resetPasswordError}
          setResetPasswordError={setResetPasswordError}
          validateEmail={validateEmail}
          validateUsername={validateUsername}
          validatePassword={validatePassword}
          requestToggle={requestToggle}
          updateAdmin={updateAdmin}
          isUpdatingAdmin={isUpdatingAdmin}
          resetAdminPassword={resetAdminPassword}
          isResettingPassword={isResettingPassword}
          setSelectedAdmin={setSelectedAdmin}
          setAdmins={setAdmins}
        />
      )}

      {/* ─── 2. Create Dialog ─── */}
      <CreateAdminDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        createForm={createForm}
        setCreateForm={setCreateForm}
        createErrors={createErrors}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        isCreating={isCreating}
        handleSaveNewAdmin={handleSaveNewAdmin}
      />

      {/* ─── Confirm Update Status ─── */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => {
          if (!isUpdating) setConfirmOpen(false);
        }}
        onConfirm={confirmToggle}
        title="Update admin status?"
        description={
          pendingToggle
            ? pendingToggle.next
              ? "This will activate the admin account and allow access."
              : "This will ban/suspend the admin from logging in."
            : undefined
        }
        confirmText={pendingToggle?.next ? "Set Active" : "Set Banned"}
        variant={pendingToggle?.next ? "default" : "destructive"}
        isLoading={isUpdating}
      />

      {/* ─── 3. Delete Confirm Dialog ─── */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Admin User?"
        description="This will permanently delete the user. This action cannot be undone."
        confirmText="Delete User"
        variant="destructive"
        isLoading={isDeleting}
      />

      {/* ─── Cannot Delete Advisory Dialog ─── */}
      <Dialog open={cannotDeleteOpen} onOpenChange={setCannotDeleteOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Unable to delete admin</DialogTitle>
            <DialogDescription className="text-zinc-400">
              This admin cannot be deleted. Consider disabling the account
              instead.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setCannotDeleteOpen(false)}
              className="bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
