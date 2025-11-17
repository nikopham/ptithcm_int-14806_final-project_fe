export interface ServiceResult<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
}
