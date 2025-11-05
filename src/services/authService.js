import axios from "./axiosInstance";
import {
  logout,
  setCredentials,
  setError,
  setLoading,
} from "../features/auth/authSlice";
import { actionTypes } from "@/constants/actionTypes";

export const loginUser = async (dispatch, email, password) => {
  try {
    dispatch(setLoading(true));

    await axios.post("/auth/login", { email, password });

    const res = await axios.get("/auth/me", { withCredentials: true });

    dispatch(setCredentials(res.data.data));

    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || "Đăng nhập thất bại";
    dispatch(setError(msg));
    console.error("Login error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};
export const registerUser = async (dispatch, email, password, fullName) => {
  try {
    dispatch(setLoading(true));

    const res = await axios.post("/auth/register", {
      action: actionTypes.CUSTOMER.REGISTER_SUBMIT_INFO,
      payload: {
        customerRegisterInfo: {
          email,
          password,
          fullName,
        },
      },
    });

    const { otpSessionId, customerRegisterInfo } = res.data.data;

    return { otpSessionId, customerRegisterInfo };
  } catch (err) {
    const msg = err.response?.data?.message || "Đăng ký thất bại";
    dispatch(setError(msg));
    console.error("Register error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const verifyRegisterCode = async (
  dispatch,
  otpSessionId,
  verifyCode,
  customerRegisterInfo
) => {
  try {
    dispatch(setLoading(true));

    const res = await axios.post("/auth/register", {
      action: actionTypes.CUSTOMER.VERIFY_REGISTER_CODE,
      payload: {
        otpSessionId,
        verifyCode,
        customerRegisterInfo,
      },
    });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || "Xác minh mã OTP thất bại";
    dispatch(setError(msg));
    console.error("Verify OTP error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const logoutUser = async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await axios.post("/auth/logout", null, {
      withCredentials: true,
    });

    dispatch(logout());
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || "Đăng xuất thất bại";
    dispatch(setError(msg));
    console.error("Logout error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const submitResetPwInfo = async (dispatch, email, options = {}) => {
  try {
    dispatch(setLoading(true));

    const endpoint = options.endpoint || "/auth/reset-pw";
    const res = await axios.post(endpoint, {
      action: actionTypes.CUSTOMER.RESET_PW_SUBMIT_INFO,
      payload: { email },
    });

    const { otpSessionId } = res?.data?.data || {};
    if (!otpSessionId) {
      const msg = "Phản hồi máy chủ không hợp lệ";
      dispatch(setError(msg));
      throw new Error(msg);
    }

    return { otpSessionId };
  } catch (err) {
    const msg =
      err?.response?.data?.message || "Gửi yêu cầu khôi phục mật khẩu thất bại";
    dispatch(setError(msg));
    console.error("submitResetPwInfo error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const verifyResetPwCode = async (
  dispatch,
  otpSessionId,
  verifyCode,
  options = {}
) => {
  try {
    dispatch(setLoading(true));

    const endpoint = options.endpoint || "/auth/reset-pw";
    const res = await axios.post(endpoint, {
      action: actionTypes.CUSTOMER.VERIFY_RESET_PW_CODE,
      payload: { otpSessionId, verifyCode },
    });
    return res?.data;
  } catch (err) {
    const msg =
      err?.response?.data?.message || "Xác minh mã khôi phục thất bại";
    dispatch(setError(msg));
    console.error("verifyResetPwCode error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateAccountStatus = async (dispatch, accountId, status) => {
  try {
    dispatch(setLoading(true));

    if (!accountId || !["active", "inactive"].includes(status)) {
      const msg = "Thiếu accountId hoặc trạng thái không hợp lệ";
      dispatch(setError(msg));
      throw new Error(msg);
    }

    const res = await axios.patch("/auth/status", {
      accountId,
      status,
    });

    return res.data;
  } catch (err) {
    const msg =
      err.response?.data?.message || "Cập nhật trạng thái tài khoản thất bại";
    dispatch(setError(msg));
    console.error("Update account status error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchMe = async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await axios.get("/auth/me", { withCredentials: true }); 
    console.log(res.data.data);
    
    
    dispatch(setCredentials(res?.data?.data));
    return res.data;
  } catch (err) {
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      dispatch(logout());
    } else {
      const msg =
        err.response?.data?.message || "Không thể xác thực phiên đăng nhập";
      dispatch(setError(msg));
      console.error("fetchMe error:", msg);
    }
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};
