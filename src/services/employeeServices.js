import {
  setEmployeeDetail,
  setEmployees,
  setError,
  setLoading,
} from "@/features/employee/employeeSlice";
import axios from "./axiosInstance";
import qs from "qs";

export const searchEmployees = async (dispatch, params) => {
  try {
    dispatch(setLoading(true));

    const query = qs.stringify(params, { skipNulls: true });
    const res = await axios.get(`/employees?${query}`);

    const { employees, pagination } = res.data.data;

    dispatch(setEmployees({ employees, pagination }));
    return { employees, pagination };
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

export const getEmployeeDetailByAccountId = async (dispatch, accountId) => {
  try {
    dispatch(setLoading(true));

    if (!accountId) {
      const msg = "Thiếu accountId";
      dispatch(setError(msg));
      throw new Error(msg);
    }

    const res = await axios.get(`/employees/${accountId}`);

    const employee = res?.data?.data;

    dispatch(setEmployeeDetail(employee));

    return employee;
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Không thể lấy chi tiết nhân viên, vui lòng thử lại";
    dispatch(setError(msg));
    console.error("Get employee detail error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const editEmployee = async (dispatch, payload) => {
  try {
    dispatch(setLoading(true));

    if (!payload?.account_id) {
      const msg = "Thiếu account_id";
      dispatch(setError(msg));
      throw new Error(msg);
    }

    const res = await axios.patch("/employees/edit", payload);
    const data = res?.data?.data;

    const employee = data?.employee;

    if (!employee) {
      const msg = "Phản hồi máy chủ không hợp lệ";
      dispatch(setError(msg));
      throw new Error(msg);
    }

    dispatch(setEmployeeDetail(employee));

    return res.data;
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Không thể cập nhật nhân viên, vui lòng thử lại";
    dispatch(setError(msg));
    console.error("Edit employee error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const createEmployee = async (dispatch, payload) => {
  try {
    dispatch(setLoading(true));

    const res = await axios.post("/employees/create", payload);
    return res.data;
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Không thể cập nhật nhân viên, vui lòng thử lại";
    dispatch(setError(msg));
    console.error("Edit employee error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const deleteAccount = async (dispatch, payload) => {
  try {
    dispatch(setLoading(true));

    const res = await axios.post("/employees/delete", payload);

    const result = res?.data;
    if (!result?.success) {
      const msg = result?.message;
      dispatch(setError(msg));
      throw new Error(msg);
    }
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Không thể xóa tài khoản, vui lòng thử lại";
    dispatch(setError(msg));
    console.error("Delete account error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};
