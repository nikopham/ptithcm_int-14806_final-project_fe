import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useGetMeQuery,
  useUpdateUserProfileMutation,
  useChangePasswordUserProfileMutation,
} from "@/features/user/userApi";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

export default function AccountPage() {
  const isAuth = useSelector((s: RootState) => s.auth.isAuth);
  const skipVerify = useSelector((s: RootState) => s.auth.skipVerify);
  const { data: me, isLoading: isMeLoading, refetch } = useGetMeQuery(undefined, {
    skip: !isAuth || skipVerify,
  });
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateUserProfileMutation();
  const [changePassword, { isLoading: isChangingPwd }] =
    useChangePasswordUserProfileMutation();

  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const authId = me?.id;
  const hasPassword = me?.hasPassword ?? false;

  const validateUsername = (v: string) =>
    /^[A-Za-z0-9_. ]{3,32}$/.test(v.trim());
  const validateStrongPassword = (v: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(v);

  useEffect(() => {
    if (me) {
      setUsername(me.username || "");
    }
  }, [me]);

  const avatarPreview = useMemo(() => {
    if (avatarFile) return URL.createObjectURL(avatarFile);
    return me?.avatarUrl || "";
  }, [avatarFile, me?.avatarUrl]);

  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarFile(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!me?.id || !authId) return;

    // Skip update if nothing changed
    const usernameTrimmed = username.trim();
    const initialUsername = (me?.username || "").trim();
    const hasAvatarChange = !!avatarFile;
    const hasUsernameChange = usernameTrimmed !== initialUsername;
    if (!hasAvatarChange && !hasUsernameChange) {
      toast.info("Không có thay đổi để cập nhật");
      return;
    }

    const errs = {
      username: validateUsername(username)
        ? null
        : "Tên người dùng phải từ 3-32 ký tự (chữ cái, số, _ và khoảng trắng .)",
    };
    setUsernameError(errs.username);
    if (errs.username) {
      toast.error("Vui lòng sửa lỗi xác thực");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("id", authId);
      formData.append("username", usernameTrimmed);
      if (avatarFile) formData.append("avatar", avatarFile);
      await updateProfile(formData).unwrap();
      toast.success("Đã cập nhật hồ sơ");
      setAvatarFile(null);
      await refetch();
    } catch {
      toast.error("Không thể cập nhật hồ sơ");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me?.id || !authId) return;
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận không khớp");
      return;
    }
    if (!validateStrongPassword(newPassword)) {
      setPasswordError(
        "Mật khẩu phải ≥8 ký tự và bao gồm chữ hoa, chữ thường, số, ký tự đặc biệt"
      );
      toast.error("Vui lòng sử dụng mật khẩu mạnh hơn");
      return;
    }
    try {
      await changePassword({
        id: authId!,
        currentPw: oldPassword,
        newPw: newPassword,
        reNewPw: confirmPassword,
      }).unwrap();
      toast.success("Đã đổi mật khẩu");

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError(null);
      await refetch();
    } catch {
      toast.error("Không thể đổi mật khẩu");
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-10 py-10 space-y-10 min-h-full">
      {/* heading */}
      <div>
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Tài Khoản</h1>
        <p className="text-sm text-gray-500">Cập nhật thông tin tài khoản của bạn</p>
      </div>

      {/* ---------- form body ---------- */}
      <div className="flex flex-col-reverse gap-10 md:grid md:grid-cols-[1fr_auto]">
        {/* ——— left column ——— */}
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Email</label>
            <Input value={me?.email || ""} type="email" disabled className="bg-gray-100 border-gray-300 text-gray-900" />
          </div>

          {/* display name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Tên Hiển Thị
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-white border-gray-300 text-gray-900"
            />
            {usernameError && (
              <p className="text-xs" style={{ color: "#C40E61" }}>{usernameError}</p>
            )}
          </div>

          {/* update btn */}
          <Button
            type="submit"
            disabled={isUpdating || isMeLoading}
            className="text-white hover:opacity-90"
            style={{ backgroundColor: "#C40E61" }}
          >
            {isUpdating ? "Đang cập nhật..." : "Cập Nhật Hồ Sơ"}
          </Button>

          {/* change password */}
          <div className="mt-8 space-y-4 rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">
              Đổi Mật Khẩu
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {hasPassword && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Mật Khẩu Hiện Tại
                  </label>
                  <div className="relative">
                    <Input
                      type={showOldPwd ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="pr-10 bg-white border-gray-300 text-gray-900"
                    />
                    <button
                      type="button"
                      aria-label={
                        showOldPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                      title={showOldPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      onClick={() => setShowOldPwd((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                    >
                      {showOldPwd ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
              <div
                className={
                  hasPassword ? "space-y-4" : "sm:col-span-2 space-y-2"
                }
              >
                <label className="text-sm font-medium text-gray-900">
                  Mật Khẩu Mới
                </label>
                <div className="relative">
                  <Input
                    type={showNewPwd ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10 bg-white border-gray-300 text-gray-900"
                  />
                  <button
                    type="button"
                    aria-label={showNewPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    title={showNewPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    onClick={() => setShowNewPwd((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                  >
                    {showNewPwd ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-gray-900">
                  Xác Nhận Mật Khẩu Mới
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPwd ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10 bg-white border-gray-300 text-gray-900"
                  />
                  <button
                    type="button"
                    aria-label={
                      showConfirmPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                    }
                    title={showConfirmPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    onClick={() => setShowConfirmPwd((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                  >
                    {showConfirmPwd ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            {passwordError && (
              <p className="text-xs" style={{ color: "#C40E61" }}>{passwordError}</p>
            )}
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={isChangingPwd || isMeLoading}
                onClick={handleChangePassword}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                {isChangingPwd ? "Đang đổi..." : "Đổi Mật Khẩu"}
              </Button>
            </div>
          </div>
        </form>

        {/* ——— avatar column ——— */}
        <div className="flex flex-col items-center gap-3 md:pt-2">
          <img
            src={avatarPreview}
            className="h-32 w-32 rounded-full border-2 border-gray-300 object-cover"
          />
          <div className="flex items-center gap-2">
            <label className="cursor-pointer rounded border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-100 bg-white">
              Chọn Ảnh Đại Diện
              <input
                type="file"
                accept="image/*"
                onChange={onPickAvatar}
                className="hidden"
              />
            </label>
            {avatarFile && (
              <Button
                variant="ghost"
                className="text-xs text-gray-500 hover:text-[#C40E61]"
                onClick={() => setAvatarFile(null)}
              >
                Xóa
              </Button>
            )}
          </div>
          <span className="text-xs text-gray-500">JPG, PNG tối đa 5MB</span>
        </div>
      </div>
    </section>
  );
}
