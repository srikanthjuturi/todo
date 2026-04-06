export interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  data: T | null;
  timestamp: string;
  errors: string[] | null;
}
