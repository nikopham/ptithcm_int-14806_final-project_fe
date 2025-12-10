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
import { Eye, EyeOff, Edit, ImageIcon, Mail, Lock, Shield, Film, Save, KeyRound, Power, User as UserIcon } from "lucide-react";
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
      <DialogContent className="bg-white border-gray-300 text-gray-900 sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-gray-300 shadow-sm">
              <AvatarImage src={avatarPreviewUrl || selectedAdmin.avatar_url} />
              <AvatarFallback className="text-xl bg-[#C40E61] text-white">
                {selectedAdmin.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="flex items-center gap-2 text-2xl text-gray-900">
                <Edit className="size-5 text-[#C40E61]" />
                {selectedAdmin.username}
              </DialogTitle>
              <DialogDescription className="text-gray-500 flex items-center gap-1">
                <Mail className="size-3" />
                {selectedAdmin.email}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-3 rounded-lg border border-gray-300 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm">
            <Label className="text-gray-900 flex items-center gap-2 text-base font-semibold">
              <Edit className="size-4 text-[#C40E61]" />
              Chỉnh Sửa Hồ Sơ
            </Label>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-username" className="text-gray-900 flex items-center gap-2">
                  <UserIcon className="size-4 text-[#C40E61]" />
                  Tên Người Dùng
                </Label>
                <Input
                  id="edit-username"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      username: e.target.value,
                    }))
                  }
                  className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C40E61]"
                />
                {editErrors.username && (
                  <p className="text-xs text-red-600">{editErrors.username}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email" className="text-gray-900 flex items-center gap-2">
                  <Mail className="size-4 text-[#C40E61]" />
                  Email
                </Label>
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
                  className="bg-white border-gray-300 text-gray-900 opacity-70 focus-visible:ring-[#C40E61]"
                />
                {editErrors.email && (
                  <p className="text-xs text-red-600">{editErrors.email}</p>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-gray-900 flex items-center gap-2">
                <ImageIcon className="size-4 text-[#C40E61]" />
                Ảnh Đại Diện
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    avatarFile: e.target.files?.[0] || null,
                  }))
                }
                className="bg-white border-gray-300 text-gray-900 text-xs focus-visible:ring-[#C40E61]"
              />
              <p className="text-[11px] text-gray-500">PNG/JPG, tối đa 5MB.</p>
            </div>
            <div className="grid gap-2">
              <Label className="text-gray-900 flex items-center gap-2">
                <Shield className="size-4 text-[#C40E61]" />
                Vai Trò
              </Label>
              <Select
                value={editForm.role}
                onValueChange={(v) =>
                  setEditForm((f) => ({ ...f, role: v as AdminRole }))
                }
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 text-gray-900">
                  <SelectItem value="movie_admin">Quản Trị Phim</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={async () => {
                  const errs: typeof editErrors = {};
                  if (!validateUsername(editForm.username)) {
                    errs.username =
                      "Tên người dùng phải có 3-32 ký tự (chữ cái, số, _ .)";
                  }
                  if (!validateEmail(editForm.email)) {
                    errs.email = "Định dạng email không hợp lệ";
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
                className="bg-[#C40E61] hover:bg-[#C40E61]/90 text-white"
                disabled={isUpdatingAdmin}
              >
                {isUpdatingAdmin ? (
                  "Đang lưu..."
                ) : (
                  <>
                    <Save className="mr-2 size-4" />
                    Lưu Thay Đổi
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-between rounded-md bg-white p-3 text-center border border-gray-300 shadow-sm">
            <div className="text-center flex items-center gap-2 mx-auto">
              <Film className="size-5 text-[#C40E61]" />
              <div>
                <p className="text-xs text-gray-500">Phim Đã Thêm</p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedAdmin.stats?.movies_added || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
            <Label className="text-gray-900 flex items-center gap-2">
              <KeyRound className="size-4 text-[#C40E61]" />
              Đặt Lại Mật Khẩu
            </Label>
            <div className="space-y-3">
              <div className="relative">
                <Input
                  type={showEditPassword ? "text" : "password"}
                  placeholder="Mật khẩu mới"
                  value={editForm.newPassword}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full bg-white border-gray-300 text-gray-900 pr-10 focus-visible:ring-[#C40E61]"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword((s) => !s)}
                  className="absolute inset-y-0 right-3 inline-flex items-center justify-center text-gray-500 hover:text-gray-900"
                  aria-label={
                    showEditPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
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
                <p className="text-xs text-red-600">{resetPasswordError}</p>
              )}
              <div className="flex justify-end">
                <Button
                  onClick={async () => {
                    if (!validatePassword(editForm.newPassword)) {
                      setResetPasswordError(
                        "Mật khẩu phải có ≥8 ký tự và bao gồm chữ hoa, chữ thường, số, ký tự đặc biệt"
                      );
                      return;
                    }
                    await resetAdminPassword({
                      id: selectedAdmin.id,
                      body: { newPassword: editForm.newPassword },
                    }).unwrap();
                  }}
                  className="bg-[#C40E61] hover:bg-[#C40E61]/90 text-white"
                  disabled={isResettingPassword}
                >
                  {isResettingPassword ? (
                    "Đang cập nhật..."
                  ) : (
                    <>
                      <KeyRound className="mr-2 size-4" />
                      Cập Nhật Mật Khẩu
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
            <div>
              <Label className="text-base text-gray-900 flex items-center gap-2">
                <Power className="size-4 text-[#C40E61]" />
                Trạng Thái Tài Khoản
              </Label>
              <p className="text-xs text-gray-500">
                Người dùng có thể đăng nhập hoặc bị tạm ngưng.
              </p>
            </div>
            <Switch
              checked={selectedAdmin.is_active}
              onCheckedChange={() =>
                requestToggle(selectedAdmin.id, !selectedAdmin.is_active)
              }
              className="data-[state=checked]:bg-[#C40E61]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-[#C40E61] hover:bg-[#C40E61]/90 text-white"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
