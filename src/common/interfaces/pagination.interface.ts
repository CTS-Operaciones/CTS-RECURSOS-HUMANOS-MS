import { FindManyOptions } from 'typeorm';

export interface IPagination {
  page?: number;
  limit?: number;
  all?: boolean;
  relations?: boolean;
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

export interface IRelationsEnable {
  relations?: boolean;
}

export interface IPaginateDto extends IRelationsEnable {
  page?: number;
  limit?: number;
  all?: boolean;
}

export interface IPaginationDto<T> extends Omit<IPaginateDto, 'relations'> {
  options?: FindManyOptions<T>;
}
