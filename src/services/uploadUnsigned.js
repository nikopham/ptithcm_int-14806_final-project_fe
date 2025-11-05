import axiosOriginal from "axios";

export async function uploadFileUnsigned(file, cfg) {
  const { cloudName, uploadPreset, folder, onProgress } = cfg;
  if (!cloudName || !uploadPreset) {
    throw new Error("Thiếu cloudName hoặc uploadPreset");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", uploadPreset);
  if (folder) form.append("folder", folder);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
  const res = await axiosOriginal.post(url, form, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: false,
    onUploadProgress: (evt) => {
      if (typeof onProgress === "function" && evt.total) {
        onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });
  return res.data; 
}

export async function uploadManyUnsigned(files, cfg) {
  if (!files?.length) return [];
  const tasks = files.map((file, i) =>
    uploadFileUnsigned(file, {
      ...cfg,
      onProgress: (pct) => cfg.onProgressEach?.(i, pct),
    }).then((r) => ({
      url: r.secure_url,
      public_id: r.public_id,
      width: r.width,
      height: r.height,
      bytes: r.bytes,
    }))
  );
  return Promise.all(tasks);
}

export function appendIdentityImagesToFD(fd, uploaded) {
  uploaded.forEach((img) => {
    fd.append("identity_image_urls", img.url);
    fd.append("identity_image_public_ids", img.public_id);
  });
}
