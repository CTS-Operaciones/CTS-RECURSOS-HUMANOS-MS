import { ObjectLiteral, QueryRunner, Repository, UpdateResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { ErrorManager, msgError } from '../utils';

export async function updateResult<T extends ObjectLiteral>(
  repository: Repository<T>,
  id: number,
  data: Partial<T>,
  queryRunner?: QueryRunner,
): Promise<UpdateResult> {
  const repo = queryRunner
    ? queryRunner.manager.getRepository(repository.metadata.target)
    : repository;

  const updateData = await repo.update(id, data as QueryDeepPartialEntity<T>);

  if (updateData.affected === 0) {
    throw new ErrorManager({
      message: msgError('UPDATE_NOT_FOUND', id),
      code: 'NOT_MODIFIED',
    });
  }

  return updateData;
}
