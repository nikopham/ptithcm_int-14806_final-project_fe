import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { Role } from "@/router/role";

interface AuthState {
  isAuth: boolean;
  roles: Role[];
}

const initialState: AuthState = { isAuth: false, roles: ["super_admin"] };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginDemo: (state) => {
      state.isAuth = true;
      state.roles = [Role.VIEWER];
    },
    logout: (state) => initialState,
    setRoles: (state, action: PayloadAction<Role[]>) => {
      state.roles = action.payload;
    },
  },
});

export const { loginDemo, logout, setRoles } = authSlice.actions;
export default authSlice.reducer;
