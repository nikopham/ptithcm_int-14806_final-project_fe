export interface ServiceResult<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}
