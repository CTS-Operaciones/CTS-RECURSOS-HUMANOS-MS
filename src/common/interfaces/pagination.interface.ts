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

export interface IPaginateFilter<T> {
  status?: T extends { status: infer U } ? U : never;
}
