import axios from "./axiosInstance";
import {
  setCommunes,
  setLoading,
  setError,
} from "@/features/commune/communeSlice";

export const fetchCommunesByProvinceId = async (dispatch, provinceId) => {
  try {
    dispatch(setLoading(true));

    const res = await axios.get("/communes", { params: { provinceId } });

    const list = res.data.data.communes;
    dispatch(setCommunes(list));

    return list;
  } catch (err) {
    const msg =
      err.response?.data?.message || "Không thể lấy danh sách xã/phường";
    dispatch(setError(msg));
    console.error("Fetch communes error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};