export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function errorResponse(message: string): ApiResponse {
  return {
    success: false,
    message,
  };
}