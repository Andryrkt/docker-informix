export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  totalPages: number;
  resultat: number;
}
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
