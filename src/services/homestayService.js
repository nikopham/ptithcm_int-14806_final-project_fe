import axios from "./axiosInstance";
import qs from "qs";
import {
  setHomestays,
  setLoading,
  setError,
} from "@/features/homestay/homestaySlice";
const toYMD = (d) =>
  d instanceof Date
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`
    : d;

export const searchHomestays = async (dispatch, params) => {
  try {
    dispatch(setLoading(true));

    const query = qs.stringify(params, { skipNulls: true });

    const res = await axios.get(`/homestays/search?${query}`);

    const { homestays, pagination } = res.data.data;

    dispatch(setHomestays({ homestays, pagination }));
    return { homestays, pagination };
  } catch (err) {
    const msg =
      err.response?.data?.message || "Không thể tìm homestay, thử lại sau";
    dispatch(setError(msg));
    console.error("Search homestays error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};
export const searchHomestaysAdmin = async (
  dispatch,
  params = {},
  options = {}
) => {
  try {
    dispatch(setLoading(true));

    const p = { ...params };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    p.dateFrom = toYMD(today);
    p.dateTo = toYMD(tomorrow);

    if (Array.isArray(p.communeIds)) {
      p.communeIds = p.communeIds.filter(Boolean).join(",");
    }

    if (typeof p.isMaintain === "boolean") p.isMaintain = String(p.isMaintain);

    const endpoint = options.endpoint || "/homestays/admin/search";
    const query = qs.stringify(p, { skipNulls: true, addQueryPrefix: true });

    const res = await axios.get(`${endpoint}${query}`);
    const { homestays, pagination } = res.data.data;

    dispatch(setHomestays({ homestays, pagination }));
    return { homestays, pagination };
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Không thể tìm homestay (admin), thử lại sau";
    dispatch(setError(msg));
    console.error("Search homestays admin error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};
export const toggleMaintainStatus = async (
  dispatch,
  params = {},
  options = {}
) => {
  try {
    dispatch(setLoading(true));

    const { homestay_id, value } = params || {};
    if (!homestay_id) {
      const msg = "Thiếu homestay_id";
      dispatch(setError(msg));
      throw new Error(msg);
    }

    const endpoint = options.endpoint || "/homestays/maintain/toggle";
    const payload = {
      homestay_id,
      ...(typeof value !== "undefined" ? { value } : {}),
    };

    const res = await axios.patch(endpoint, payload);
    const data = res?.data?.data;

    if (!data || typeof data.is_maintain !== "boolean") {
      const msg = "Phản hồi máy chủ không hợp lệ";
      dispatch(setError(msg));
      throw new Error(msg);
    }

    return data;
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Không thể cập nhật trạng thái bảo trì, thử lại sau";
    dispatch(setError(msg));
    console.error("toggleMaintainStatus error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const getHomestayDetailById = async (dispatch, id, options = {}) => {
  try {
    dispatch(setLoading(true));

    if (!id) {
      const msg = "Thiếu homestay_id";
      dispatch(setError(msg));
      throw new Error(msg);
    }

    const base = options.endpoint || "/homestays/admin/detail";
    const res = await axios.get(`${base}/${id}`);
    const detail = res?.data?.data;

    if (!detail || !detail._id) {
      const msg = "Phản hồi máy chủ không hợp lệ";
      dispatch(setError(msg));
      throw new Error(msg);
    }

    return detail;
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Không thể lấy chi tiết homestay, thử lại sau";
    dispatch(setError(msg));
    console.error("getHomestayDetailById error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateHomestay = async (dispatch, payload, options = {}) => {
  try {
    dispatch(setLoading(true));

    if (!payload?.homestay_id) {
      const msg = "Thiếu homestay_id";
      dispatch(setError(msg));
      throw new Error(msg);
    }

    const endpoint = options.endpoint || "/homestays/update";

    const res = await axios.post(`${endpoint}`, payload);
    console.log(res.data);

    const updated = res?.data;
    if (!res?.data?.success) {
      const msg = "Phản hồi máy chủ không hợp lệ";
      dispatch(setError(msg));
      throw new Error(updated);
    }

    return updated;
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      "Không thể cập nhật homestay, thử lại sau";
    dispatch(setError(msg));
    console.error("updateHomestay error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const createHomestay = async (dispatch, payload, options = {}) => {
  try {
    dispatch(setLoading(true));

    const endpoint = options.endpoint || "/homestays/create";

    const res = await axios.post(`${endpoint}`, payload);
    console.log(res.data);

    const updated = res?.data;
    if (!res?.data?.success) {
      const msg = "Phản hồi máy chủ không hợp lệ";
      dispatch(setError(msg));
      throw new Error(updated);
    }

    return updated;
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      "Không thể tạo homestay, thử lại sau";
    dispatch(setError(msg));
    console.error("create homestay error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};
export const deleteHomestay = async (dispatch, payload) => {
  try {
    dispatch(setLoading(true));

    const res = await axios.post("/homestays/delete", payload);

    const result = res?.data;
    if (!result?.success) {
      const msg = result?.message;
      dispatch(setError(msg));
      throw new Error(msg);
    }
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Không thể xóa homestay, vui lòng thử lại";
    dispatch(setError(msg));
    console.error("Delete homestay error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};
