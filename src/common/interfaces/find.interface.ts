import { FindManyOptions, FindOptionsRelations } from 'typeorm';

export interface IPaginationsResult<T> {
  page: number;
  limit: number;
  totalResult: number;
  totalPages: number;
  data: T[];
}

export interface IPaginateDto extends IRelationsEnable {
  page?: number;
  limit?: number;
  all?: boolean;
}

export interface IFindOne extends IRelationsEnable {
  term: string | number;
}

export interface IRelationsEnable {
  relations?: boolean;
}

export interface IPaginationDto<T> extends Omit<IPaginateDto, 'relations'> {
  options?: FindManyOptions<T>;
}
