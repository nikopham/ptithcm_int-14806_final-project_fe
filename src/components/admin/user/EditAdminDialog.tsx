import { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff } from "lucide-react";
import type { User as UserType } from "@/types/user";

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
    movies_added?: number;
    comments_moderated?: number;
    last_login: string;
  };
};

type EditForm = {
  username: string;
  email: string;
  role: AdminRole;
  avatarFile: File | null;
  newPassword: string;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAdmin: AdminUser;
  editForm: EditForm;
  setEditForm: Dispatch<SetStateAction<EditForm>>;
  avatarPreviewUrl: string | null;
  setAvatarPreviewUrl: Dispatch<SetStateAction<string | null>>;
  editErrors: { username?: string; email?: string };
  setEditErrors: Dispatch<
    SetStateAction<{ username?: string; email?: string }>
  >;
  showEditPassword: boolean;
  setShowEditPassword: Dispatch<SetStateAction<boolean>>;
  resetPasswordError: string | null;
  setResetPasswordError: Dispatch<SetStateAction<string | null>>;
  validateEmail: (email: string) => boolean;
  validateUsername: (username: string) => boolean;
  validatePassword: (password: string) => boolean;
  requestToggle: (id: string, next: boolean) => void;
  updateAdmin: (args: { id: string; body: FormData }) => any;
  isUpdatingAdmin: boolean;
  resetAdminPassword: (args: {
    id: string;
    body: { newPassword: string };
  }) => any;
  isResettingPassword: boolean;
  setSelectedAdmin: Dispatch<SetStateAction<AdminUser | null>>;
  setAdmins: Dispatch<SetStateAction<AdminUser[]>>;
}

export default function EditAdminDialog(props: Props) {
  const {
    open,
    onOpenChange,
    selectedAdmin,
    editForm,
    setEditForm,
    avatarPreviewUrl,
    editErrors,
    setEditErrors,
    showEditPassword,
    setShowEditPassword,
    resetPasswordError,
    setResetPasswordError,
    validateEmail,
    validateUsername,
    validatePassword,
    requestToggle,
    updateAdmin,
    isUpdatingAdmin,
    resetAdminPassword,
    isResettingPassword,
    setSelectedAdmin,
    setAdmins,
  } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-zinc-800">
              <AvatarImage src={avatarPreviewUrl || selectedAdmin.avatar_url} />
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
          <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <Label className="text-white">Edit Profile</Label>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      username: e.target.value,
                    }))
                  }
                  className="bg-zinc-950 border-zinc-700"
                />
                {editErrors.username && (
                  <p className="text-xs text-red-400">{editErrors.username}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      email: e.target.value,
                    }))
                  }
                  className="bg-zinc-950 border-zinc-700 opacity-70"
                />
                {editErrors.email && (
                  <p className="text-xs text-red-400">{editErrors.email}</p>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Avatar</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    avatarFile: e.target.files?.[0] || null,
                  }))
                }
                className="bg-zinc-950 border-zinc-700 text-xs"
              />
              <p className="text-[11px] text-zinc-500">PNG/JPG, up to 5MB.</p>
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(v) =>
                  setEditForm((f) => ({ ...f, role: v as AdminRole }))
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
            <div className="flex justify-end">
              <Button
                onClick={async () => {
                  const errs: typeof editErrors = {};
                  if (!validateUsername(editForm.username)) {
                    errs.username =
                      "Username must be 3-32 chars (letters, numbers, _ .)";
                  }
                  if (!validateEmail(editForm.email)) {
                    errs.email = "Invalid email format";
                  }
                  setEditErrors(errs);
                  if (Object.keys(errs).length > 0) return;

                  const fd = new FormData();
                  fd.append("username", editForm.username);
                  fd.append("email", editForm.email);
                  fd.append("roleCode", editForm.role);
                  if (editForm.avatarFile) {
                    fd.append(
                      "avatar",
                      editForm.avatarFile,
                      editForm.avatarFile.name
                    );
                  }
                  await updateAdmin({
                    id: selectedAdmin.id,
                    body: fd,
                  }).unwrap();
                }}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Save Changes
              </Button>
            </div>
          </div>

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
                <p className="text-xs text-zinc-500">Comments Moderated</p>
                <p className="text-lg font-bold text-purple-400">
                  {selectedAdmin.stats?.comments_moderated || 0}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 rounded-lg border border-zinc-800 p-4">
            <Label>Reset Password</Label>
            <div className="space-y-3">
              <div className="relative">
                <Input
                  type={showEditPassword ? "text" : "password"}
                  placeholder="New password"
                  value={editForm.newPassword}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full bg-zinc-950 border-zinc-700 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword((s) => !s)}
                  className="absolute inset-y-0 right-3 inline-flex items-center justify-center text-zinc-400 hover:text-white"
                  aria-label={
                    showEditPassword ? "Hide password" : "Show password"
                  }
                >
                  {showEditPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {resetPasswordError && (
                <p className="text-xs text-red-400">{resetPasswordError}</p>
              )}
              <div className="flex justify-end">
                <Button
                  onClick={async () => {
                    if (!validatePassword(editForm.newPassword)) {
                      setResetPasswordError(
                        "Password must be ≥8 chars and include upper, lower, number, special"
                      );
                      return;
                    }
                    await resetAdminPassword({
                      id: selectedAdmin.id,
                      body: { newPassword: editForm.newPassword },
                    }).unwrap();
                  }}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Update Password
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-zinc-800 p-4">
            <div>
              <Label className="text-base text-white">Account Status</Label>
              <p className="text-xs text-zinc-500">
                User can log in or is suspended.
              </p>
            </div>
            <Switch
              checked={selectedAdmin.is_active}
              onCheckedChange={() =>
                requestToggle(selectedAdmin.id, !selectedAdmin.is_active)
              }
              className="data-[state=checked]:bg-teal-600"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
