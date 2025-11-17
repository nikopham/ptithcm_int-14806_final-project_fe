// (Hãy đảm bảo bạn đã import `Role` enum, ví dụ: import { Role } from "@/router/role";)
// (Hãy đảm bảo bạn đã import `Badge`, ví dụ: import { Badge } from "@/components/ui/badge";)

import { GlobalConstant } from "@/constants/GlobalConstant";
import { Role } from "@/router/role";

export const getRoleName = (role: Role | string): string => {
  switch (role) {
    case GlobalConstant.SUPER_ADMIN:
      return "Super Admin";
    case GlobalConstant.MOVIE_ADMIN:
      return "Movie Admin";
    case GlobalConstant.COMMENT_ADMIN:
      return "Comment Admin";
    case GlobalConstant.VIEWER:
      return "Viewer";
    default:
      return "Unknown Role";
  }
};
/**
 * Trả về class Tailwind cho từng role
 */
const getRoleBadgeClass = (role: Role | string): string => {
  // style cơ bản cho badge
  const baseStyle = "border-none text-xs font-medium ml-2";

  switch (role) {
    case Role.SUPER_ADMIN:
      return `${baseStyle} bg-red-600 hover:bg-red-700 text-white`;
    case Role.MOVIE_ADMIN:
      return `${baseStyle} bg-blue-600 hover:bg-blue-700 text-white`;
    case Role.COMMENT_ADMIN:
      return `${baseStyle} bg-yellow-500 hover:bg-yellow-600 text-black`;
    case Role.VIEWER:
      return `${baseStyle} bg-zinc-600 hover:bg-zinc-700 text-white`;
    default:
      return `${baseStyle} bg-gray-200 text-black`;
  }
};
export default getRoleBadgeClass;