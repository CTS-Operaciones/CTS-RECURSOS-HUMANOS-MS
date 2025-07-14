import { FindManyOptions, In, ObjectLiteral, Repository } from 'typeorm';

import { ErrorManager } from '../utils';

export const findManyIn = async <T extends ObjectLiteral>({
  repository,
  options = {},
}: {
  repository: Repository<T>;
  options?: FindManyOptions<T>;
}) => {
  try {
    const { where = {}, relations = {}, select = {} } = options || {};
    const optionsFindMany: FindManyOptions<T> = {
      where,
      relations,
      select,
    };

    return await repository.find(optionsFindMany);
  } catch (error) {
    throw ErrorManager.createSignatureError(error);
  }
};
