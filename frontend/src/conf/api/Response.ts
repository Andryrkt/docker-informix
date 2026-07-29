export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  total_pages: number;
  resultat: number;
}
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
