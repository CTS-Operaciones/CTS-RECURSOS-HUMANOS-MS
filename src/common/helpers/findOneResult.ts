import { Repository, Like, FindOptionsWhere, FindOneOptions } from 'typeorm';
import { ErrorManager, msgError } from '../utils';

export async function findOneByTerm<T>({
  repository,
  term,
  searchField = null,
  options = {},
}: {
  repository: Repository<T>;
  term: string | number;
  searchField?: keyof T extends string ? keyof T : never;
  options?: FindOneOptions<T>;
}): Promise<T | null> {
  const { where = {}, relations = {}, select = {} } = options || {};
  const optionsFindOne: FindOneOptions<T> = {
    where,
    relations,
    select,
  };

  if (!isNaN(Number(term))) {
    optionsFindOne.where = {
      ...optionsFindOne.where,
      id: term,
    } as unknown as FindOptionsWhere<T>;
  } else if (typeof term === 'string' && searchField !== null) {
    optionsFindOne.where = {
      ...optionsFindOne.where,
      [searchField]: Like(`%${term}%`),
    } as FindOptionsWhere<T>;
  } else {
    throw new ErrorManager({
      message: msgError('NOT_FOUND', term),
      type: 'NOT_FOUND',
    });
  }

  const result: T | null = await repository.findOne(optionsFindOne);

  if (!result) {
    throw new ErrorManager({
      message: msgError('NO_WITH_TERM', term),
      type: 'NOT_FOUND',
    });
  }

  return result;
}

export async function validateExistence<T>({
  repository,
  options,
  id = null,
}: {
  repository: Repository<T>;
  options: FindOneOptions<T>;
  id?: number | null;
}): Promise<boolean> {
  try {
    const result = await repository.findOne(options);

    if (id && result && id !== result['id']) {
      throw new ErrorManager({
        message: msgError('REGISTER_EXIST'),
        type: 'AMBIGUOUS',
      });
    } else if (result) {
      throw new ErrorManager({
        message: msgError('REGISTER_EXIST'),
        type: 'NOT_FOUND',
      });
    }

    return false;
  } catch (error) {
    throw ErrorManager.createSignatureError(error);
  }
}
