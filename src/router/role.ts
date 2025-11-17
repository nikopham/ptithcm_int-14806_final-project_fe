import { GlobalConstant } from "@/constants/GlobalConstant";

export enum Role {
  VIEWER = GlobalConstant.ROLE_VIEWER,
  MOVIE_ADMIN = GlobalConstant.ROLE_MOVIE_ADMIN,
  COMMENT_ADMIN = GlobalConstant.ROLE_COMMENT_ADMIN,
  SUPER_ADMIN = GlobalConstant.ROLE_SUPER_ADMIN,
}
