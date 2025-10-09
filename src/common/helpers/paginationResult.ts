import { Repository, FindManyOptions, ObjectLiteral } from 'typeorm';
import { IPaginationDto, IPaginationResult } from '../interfaces';

export async function paginationResult<T extends ObjectLiteral>(
  repository: Repository<T>,
  pagination: IPaginationDto<T>,
): Promise<IPaginationResult<T>> {
  const { limit = 10, page = 1, all = false, options = {} } = pagination;
  const skip = page > 0 ? (page - 1) * limit : 0;

  const _options: FindManyOptions<T> = {
    ...options,
    order:
      options.order ??
      ({ id: 'ASC' } as unknown as FindManyOptions<T>['order']),
  };

  if (!all) {
    _options.take = limit;
    _options.skip = skip;
  }

  const [data, totalResult] = await repository.findAndCount(_options);

  const totalPages = all ? 1 : Math.ceil(totalResult / limit);

  return {
    page: Number(all ? 1 : page),
    limit: Number(all ? totalResult : limit),
    totalResult,
    totalPages,
    data,
  };
}
