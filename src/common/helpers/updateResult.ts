import { Repository, UpdateResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { ErrorManager, msgError } from '../utils';

export async function updateResult<T>(
  repository: Repository<T>,
  id: number,
  data: Partial<T>,
): Promise<UpdateResult> {
  const updateData = await repository.update(
    id,
    data as QueryDeepPartialEntity<T>,
  );

  if (updateData.affected === 0) {
    throw new ErrorManager({
      message: msgError('UPDATE_NOT_FOUND', id),
      type: 'NOT_MODIFIED',
    });
  }

  return updateData;
}
