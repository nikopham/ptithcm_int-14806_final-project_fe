import { useState, useEffect } from "react";

/**
 * Hook `useDebounce`
 *
 * Hook này nhận một giá trị (ví dụ: 'query' từ ô input) và
 * chỉ trả về giá trị đó sau khi người dùng ngừng gõ
 * trong một khoảng thời gian (delay).
 *
 * @param value Giá trị cần trì hoãn (ví dụ: state 'query')
 * @param delay Thời gian trì hoãn (milisecond, ví dụ: 500ms)
 * @returns Giá trị đã được trì hoãn
 */
export function useDebounce<T>(value: T, delay: number): T {
  // State nội bộ để lưu giá trị đã trì hoãn
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(
    () => {
      // 1. Thiết lập một "đồng hồ đếm ngược" (timer)
      const handler = setTimeout(() => {
        // 3. Khi hết giờ, cập nhật state nội bộ
        setDebouncedValue(value);
      }, delay);

      // 2. Hàm dọn dẹp (cleanup)
      // Nếu 'value' hoặc 'delay' thay đổi (người dùng gõ phím mới)
      // trước khi timer kết thúc, hủy timer cũ đi.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Chỉ chạy lại effect nếu value hoặc delay thay đổi
  );

  return debouncedValue;
}
