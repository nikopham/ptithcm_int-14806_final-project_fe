// src/utils/filterUtils.js

export const FILTERS_KEY = "movieFilters";

// Hàm LẤY params từ storage
export const getParamsFromStorage = () => {
  try {
    const stored = localStorage.getItem(FILTERS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
};

// Hàm SET params vào storage
export const setParamsInStorage = (params) => {
  // Loại bỏ các giá trị 'undefined' trước khi lưu
  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null)
  );
  localStorage.setItem(FILTERS_KEY, JSON.stringify(cleanedParams));
};
