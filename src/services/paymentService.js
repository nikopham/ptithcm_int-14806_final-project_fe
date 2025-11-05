import instance from "./axiosInstance";

export async function createVNPayUrl(payload) {
  try {
    const { data } = await instance.post("/payments/vnpay/create", payload);
    if (!data?.success) {
      throw new Error(data?.message || "Tạo URL VNPay thất bại");
    }
    return data?.data?.payUrl;
  } catch (err) {
    // Bóc tách lỗi từ axios
    const msg =
      err?.response?.data?.message || err?.message || "Tạo URL VNPay thất bại";
    throw new Error(msg);
  }
}
