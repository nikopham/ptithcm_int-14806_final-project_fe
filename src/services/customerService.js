import axios from "./axiosInstance";
import qs from "qs";
import {
  setCustomers,
  setLoading,
  setError,
} from "@/features/customer/customerSlice.js";

export const searchCustomers = async (dispatch, params) => {
  try {
    dispatch(setLoading(true));

    const query = qs.stringify(params, { skipNulls: true });
    const res = await axios.get(`/customers?${query}`);

    const { customers, pagination } = res.data.data;

    dispatch(setCustomers({ customers, pagination }));
    return { customers, pagination };
  } catch (err) {
    const msg =
      err.response?.data?.message || "Không thể tìm khách hàng, thử lại sau";
    dispatch(setError(msg));
    console.error("Search customers error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const getCustomerByAccountId = async (dispatch, accountId, options = {}) => {
  try {
    dispatch(setLoading(true));

    const endpoint = options.endpoint || `/customers/by-account/${accountId}`;
    const res = await axios.get(endpoint);

    const data = res?.data;
    if (!data?.success) {
      const msg = "Phản hồi máy chủ không hợp lệ";
      dispatch(setError(msg));
      throw new Error(msg);
    }
   
    return data;
  } catch (err) {
    const msg =
      err?.response?.data?.message || "Không thể đổi lấy thông tin customer";
    dispatch(setError(msg));
    console.error("get customer info error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateCustomer = async (dispatch, accountId, payload, options = {}) => {
  try {
    dispatch(setLoading(true));

    const endpoint = options.endpoint || `/customers/update/${accountId}`;
    const res = await axios.patch(endpoint, payload);

    const data = res?.data;
    if (!data?.success) {
      const msg = "Phản hồi máy chủ không hợp lệ";
      dispatch(setError(msg));
      throw new Error(msg);
    }

    return data;
  } catch (err) {
    const msg =
      err?.response?.data?.message || "Không thể cập nhật thông tin customer";
    dispatch(setError(msg));
    console.error("update customer info error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const changePassword = async (
  dispatch,
  accountId,
  payload,
  options = {}
) => {
  try {
    dispatch(setLoading(true));

    const endpoint = options.endpoint || `/customers/change-password/${accountId}`;
    const res = await axios.patch(endpoint, payload);

    const data = res?.data;
    if (!data?.success) {
      const msg = "Phản hồi máy chủ không hợp lệ";
      dispatch(setError(msg));
      throw new Error(msg);
    }

    return data;
  } catch (err) {
    const msg =
      err?.response?.data?.message || "Không thể cập nhật thông tin customer";
    dispatch(setError(msg));
    console.error("update customer info error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const changePasswordAuth = async (
  dispatch,
  accountId,
  payload,
  options = {}
) => {
  try {
    dispatch(setLoading(true));

    const endpoint =
      options.endpoint || `/auth/change-password/${accountId}`;
    const res = await axios.patch(endpoint, payload);

    const data = res?.data;
    if (!data?.success) {
      const msg = "Phản hồi máy chủ không hợp lệ";
      dispatch(setError(msg));
      throw new Error(msg);
    }

    return data;
  } catch (err) {
    const msg =
      err?.response?.data?.message || "Không thể cập nhật thông tin mật khẩu";
    dispatch(setError(msg));
    console.error("update password info error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

