import { uploadManyUnsigned } from "@/services/uploadUnsigned";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET;
function isFileLike(v) {
  return v instanceof File || (v && typeof v === "object" && "name" in v);
}


export async function attachIdentityUrlsFromUploads(
  guestForms,
  { cloudName, preset, folder }
) {
  const frontUploads = [];
  const backUploads = [];
  const frontMap = []; 
  const backMap = [];

  guestForms.forEach((g, gi) => {
    // FRONT
    if (
      !g.is_child &&
      g.identity_url_front &&
      isFileLike(g.identity_url_front)
    ) {
      frontUploads.push(g.identity_url_front);
      frontMap.push({ guestIndex: gi });
    }
    // BACK
    if (!g.is_child && g.identity_url_back && isFileLike(g.identity_url_back)) {
      backUploads.push(g.identity_url_back);
      backMap.push({ guestIndex: gi });
    }
  });


  const [frontRes, backRes] = await Promise.all([
    frontUploads.length
      ? uploadManyUnsigned(frontUploads, {
          cloudName: cloudName,
          uploadPreset: preset,
          folder: folder || "homestay/uploads",
        })
      : Promise.resolve([]),
    backUploads.length
      ? uploadManyUnsigned(backUploads, {
          cloudName: cloudName,
          uploadPreset: preset,
          folder: folder || "homestay/uploads",
        })
      : Promise.resolve([]),
  ]);

  const mapped = guestForms.map((g) => ({ ...g }));

  frontRes.forEach((r, i) => {
    const { guestIndex } = frontMap[i];
    mapped[guestIndex].identity_url_front = r.url; 
  });


  backRes.forEach((r, i) => {
    const { guestIndex } = backMap[i];
    mapped[guestIndex].identity_url_back = r.url;
  });

  return mapped.map((g) => ({
    ...g,
    identity_url_front:
      typeof g.identity_url_front === "string"
        ? g.identity_url_front
        : g.is_child
        ? null
        : g.identity_url_front && !isFileLike(g.identity_url_front)
        ? null
        : g.identity_url_front,
    identity_url_back:
      typeof g.identity_url_back === "string"
        ? g.identity_url_back
        : g.is_child
        ? null
        : g.identity_url_back && !isFileLike(g.identity_url_back)
        ? null
        : g.identity_url_back,
  }));
}
