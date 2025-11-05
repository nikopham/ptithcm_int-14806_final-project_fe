import axios from "./axiosInstance";
import {
  setSignature,
  setLoading,
  setError,
} from "@/features/cloudinary/uploadSlice";
import axiosOriginal from "axios";

export const getUploadSignature = async (dispatch, body = {}) => {
  try {
    dispatch(setLoading(true));

    const res = await axios.post("/cloudinary/signature", body);
    const data = res.data?.data;

    if (!data?.signature || !data?.timestamp) {
      const msg = "Dữ liệu chữ ký không hợp lệ từ máy chủ";
      dispatch(setError(msg));
      throw new Error(msg);
    }

    dispatch(setSignature(data));
    return data;
  } catch (err) {
    const msg =
      err.response?.data?.message || "Không thể tạo chữ ký upload, thử lại sau";
    dispatch(setError(msg));
    console.error("Get upload signature error:", msg);
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const uploadFileWithSignature = async (file, sig, options = {}) => {
  const { cloudName, apiKey, signature, timestamp, folder } = sig || {};
  if (!cloudName || !apiKey || !signature || !timestamp) {
    throw new Error("Thiếu thông tin chữ ký upload");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  if (folder) form.append("folder", folder);
  if (options.public_id) form.append("public_id", options.public_id);
  if (options.eager) form.append("eager", options.eager);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  const res = await axiosOriginal.post(url, form, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: false,
    onUploadProgress: (evt) => {
      if (typeof options.onProgress === "function" && evt.total) {
        const pct = Math.round((evt.loaded * 100) / evt.total);
        options.onProgress(pct);
      }
    },
  });

  return res.data;
};

export async function uploadIdentityImages(files, dispatch, options = {}) {
  if (!files?.length) return [];

  const folder = options.folder || "homestay/uploads";
  const sig = await getUploadSignature(dispatch, { folder });

  const results = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const res = await uploadFileWithSignature(file, sig, {
      public_id: options.publicIdPrefix
        ? `${options.publicIdPrefix}_${Date.now()}_${i}`
        : undefined,
      onProgress: (pct) => options.onProgressEach?.(i, pct),
    });

    results.push({
      url: res.secure_url,
      public_id: res.public_id,
      width: res.width,
      height: res.height,
      bytes: res.bytes,
    });
  }
  return results;
}

export function appendIdentityImagesToFD(fd, uploaded) {
  uploaded.forEach((img) => {
    fd.append("identity_image_urls", img.url);
    fd.append("identity_image_public_ids", img.public_id);
  });
}