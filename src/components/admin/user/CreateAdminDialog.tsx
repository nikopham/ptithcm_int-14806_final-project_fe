import { Dispatch, SetStateAction } from "react";
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
import { User as UserIcon, Eye, EyeOff } from "lucide-react";

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
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Admin</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Set credentials and role for the new staff member.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-zinc-700 bg-zinc-800">
              {createForm.avatarFile ? (
                <img
                  src={URL.createObjectURL(createForm.avatarFile)}
                  className="h-full w-full object-cover"
                  alt="Avatar preview"
                />
              ) : (
                <UserIcon className="h-full w-full p-4 text-zinc-500" />
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Avatar</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  avatarFile: e.target.files?.[0] || null,
                })
              }
              className="bg-zinc-950 border-zinc-700 text-xs"
            />
            <p className="text-[11px] text-zinc-500">PNG/JPG, up to 5MB.</p>
          </div>
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
            {createErrors.username && (
              <p className="text-xs text-red-400">{createErrors.username}</p>
            )}
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
            {createErrors.email && (
              <p className="text-xs text-red-400">{createErrors.email}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
                className="bg-zinc-950 border-zinc-700 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {createErrors.password && (
              <p className="text-xs text-red-400">{createErrors.password}</p>
            )}
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
                <SelectItem value="movie_admin">Quản Trị Phim</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="bg-zinc-800 hover:bg-zinc-700 text-white border-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveNewAdmin}
            className="bg-teal-600 hover:bg-teal-700 text-white"
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create Admin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
