import axios from "./axiosInstance";
import {
  setProvinces,
  setLoading,
  setError,
} from "@/features/province/provinceSlice";

export const fetchProvinces = async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await axios.get("/provinces");
    
    const list = res.data.data.provinces;

    dispatch(setProvinces(list));
    return list;
  } catch (err) {
    const msg =
      err.response?.data?.message || "Không thể lấy danh sách tỉnh/thành";
    dispatch(setError(msg));
    console.error("Fetch provinces error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};
