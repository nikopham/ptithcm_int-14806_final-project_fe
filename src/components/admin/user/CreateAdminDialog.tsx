import type { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { User as UserIcon, Eye, EyeOff, Plus, ImageIcon, Mail, Lock, Shield, UserPlus } from "lucide-react";

type AdminRole = "movie_admin" | "comment_admin" | "super_admin";

type CreateForm = {
  username: string;
  email: string;
  password: string;
  role: AdminRole;
  avatarFile: File | null;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createForm: CreateForm;
  setCreateForm: Dispatch<SetStateAction<CreateForm>>;
  createErrors: { username?: string; email?: string; password?: string };
  showPassword: boolean;
  setShowPassword: Dispatch<SetStateAction<boolean>>;
  isCreating: boolean;
  handleSaveNewAdmin: () => Promise<void> | void;
}

export default function CreateAdminDialog(props: Props) {
  const {
    open,
    onOpenChange,
    createForm,
    setCreateForm,
    createErrors,
    showPassword,
    setShowPassword,
    isCreating,
    handleSaveNewAdmin,
  } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-300 text-gray-900 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <UserPlus className="size-5 text-[#C40E61]" />
            Tạo Quản Trị Viên Mới
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Thiết lập thông tin đăng nhập và vai trò cho nhân viên mới.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-gray-300 bg-gray-100 shadow-sm">
              {createForm.avatarFile ? (
                <img
                  src={URL.createObjectURL(createForm.avatarFile)}
                  className="h-full w-full object-cover"
                  alt="Xem trước ảnh đại diện"
                />
              ) : (
                <UserIcon className="h-full w-full p-4 text-gray-400" />
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
                setCreateForm({
                  ...createForm,
                  avatarFile: e.target.files?.[0] || null,
                })
              }
              className="bg-white border-gray-300 text-gray-900 text-xs focus-visible:ring-[#C40E61]"
            />
            <p className="text-[11px] text-gray-500">PNG/JPG, tối đa 5MB.</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username" className="text-gray-900 flex items-center gap-2">
              <UserIcon className="size-4 text-[#C40E61]" />
              Tên Người Dùng
            </Label>
            <Input
              id="username"
              value={createForm.username}
              onChange={(e) =>
                setCreateForm({ ...createForm, username: e.target.value })
              }
              className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C40E61]"
            />
            {createErrors.username && (
              <p className="text-xs text-red-600">{createErrors.username}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-gray-900 flex items-center gap-2">
              <Mail className="size-4 text-[#C40E61]" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={createForm.email}
              onChange={(e) =>
                setCreateForm({ ...createForm, email: e.target.value })
              }
              className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C40E61]"
            />
            {createErrors.email && (
              <p className="text-xs text-red-600">{createErrors.email}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-gray-900 flex items-center gap-2">
              <Lock className="size-4 text-[#C40E61]" />
              Mật Khẩu
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900 pr-10 focus-visible:ring-[#C40E61]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-900"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {createErrors.password && (
              <p className="text-xs text-red-600">{createErrors.password}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label className="text-gray-900 flex items-center gap-2">
              <Shield className="size-4 text-[#C40E61]" />
              Vai Trò
            </Label>
            <Select
              value={createForm.role}
              onValueChange={(v) =>
                setCreateForm({ ...createForm, role: v as AdminRole })
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
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSaveNewAdmin}
            className="bg-[#C40E61] hover:bg-[#C40E61]/90 text-white"
            disabled={isCreating}
          >
            {isCreating ? (
              "Đang tạo..."
            ) : (
              <>
                <Plus className="mr-2 size-4" />
                Tạo Quản Trị Viên
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
