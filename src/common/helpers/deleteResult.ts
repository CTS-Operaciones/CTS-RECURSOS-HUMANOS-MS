import { Repository, UpdateResult } from 'typeorm';
import { ErrorManager, msgError } from '../utils';

export async function deleteResult<T>(
  repository: Repository<T>,
  id: number,
): Promise<UpdateResult> {
  const deleteRegister = await repository.softDelete(id);

  if (deleteRegister.affected === 0) {
    throw new ErrorManager({
      message: msgError('DELETE_NOT_FOUND', id),
      type: 'NOT_FOUND',
    });
  }

  return deleteRegister;
}

export async function restoreResult<T>(repository: Repository<T>, id: number) {
  const restoreRegister = await repository.restore(id);

  if (restoreRegister.affected === 0) {
    throw new ErrorManager({
      message: msgError('NOT_FOUND'),
      type: 'NOT_FOUND',
    });
  }

  return restoreRegister;
}
