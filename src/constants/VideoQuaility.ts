// src/constants/VideoQuality.ts

/**
 * Chất lượng video
 */
export enum VideoQuality {
  FOUR_K = "4K",
  TWO_K = "2K",
  FULL_HD = "1080P",
  HD = "720P",
  SD = "480P",
  LOW = "360P",
}

// Cách sử dụng trong TypeScript:
// const myQuality = VideoQuality.FULL_HD;
// console.log(myQuality); // In ra "1080P"
