export interface IPagination {
  page?: number;
  limit?: number;
  all?: boolean;
}

export interface IPaginationResult<T> {
  page: number;
  limit: number;
  totalResult: number;
  totalPages: number;
  data: T[];
}
