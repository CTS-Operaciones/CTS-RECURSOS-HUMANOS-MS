import { ObjectLiteral, QueryRunner, Repository, UpdateResult } from 'typeorm';
import { ErrorManager, msgError } from '../utils';

export async function deleteResult<T extends ObjectLiteral>(
  repository: Repository<T>,
  id: number,
): Promise<UpdateResult> {
  const deleteRegister = await repository.softDelete(id);

  if (deleteRegister.affected === 0) {
    throw new ErrorManager({
      message: msgError('DELETE_NOT_FOUND', id),
      code: 'NOT_FOUND',
    });
  }

  return deleteRegister;
}

export async function restoreResult<T extends ObjectLiteral>(
  repository: Repository<T>,
  id: number,
  queryRunner?: QueryRunner,
) {
  const repo = queryRunner
    ? queryRunner.manager.getRepository(repository.metadata.target)
    : repository;

  const restoreRegister = await repo.restore(id);

  if (restoreRegister.affected === 0) {
    throw new ErrorManager({
      message: msgError('NOT_FOUND'),
      code: 'NOT_FOUND',
    });
  }

  return restoreRegister;
}
