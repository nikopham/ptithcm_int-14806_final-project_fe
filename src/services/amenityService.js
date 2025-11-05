import axios from "./axiosInstance";
import {
  setAmenities,
  setLoading,
  setError,
} from "@/features/amenity/amenitySlice";

export const fetchAmenities = async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const res = await axios.get("/amenities");

    const list = res.data.data.amenities;

    dispatch(setAmenities(list));
    return list;
  } catch (err) {
    const msg =
      err.response?.data?.message || "Không thể lấy danh sách tiện ích";
    dispatch(setError(msg));
    console.error("Fetch amenities error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};
