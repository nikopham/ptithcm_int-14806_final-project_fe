import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";

interface ErrorModalState {
  isOpen: boolean;
  title: string;
  message: string;
  code: string | number | null;
}

const initialState: ErrorModalState = {
  isOpen: false,
  title: "Thông báo",
  message: "",
  code: null,
};

interface ShowErrorPayload {
  message: string;
  code?: string | number | null;
  title?: string;
}

export const errorModalSlice = createSlice({
  name: "errorModal",
  initialState,
  reducers: {
    // Action để hiển thị modal với nội dung lỗi
    showErrorModal: (state, action: PayloadAction<ShowErrorPayload>) => {
      state.isOpen = true;
      state.title = action.payload.title || "Thông báo";
      state.message = action.payload.message;
      state.code = action.payload.code || null;
    },
    // Action để ẩn modal
    hideErrorModal: (state) => {
      state.isOpen = false;
      state.message = "";
      state.code = null;
    },
  },
});

export const { showErrorModal, hideErrorModal } = errorModalSlice.actions;

// Selectors để component có thể lấy dữ liệu
export const selectErrorModal = (state: RootState) => state.errorModal;

export default errorModalSlice.reducer;
