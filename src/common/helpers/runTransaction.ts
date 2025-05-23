import { DataSource, QueryRunner } from 'typeorm';
import { ErrorManager } from '../utils';

export const runInTransaction = async <T>(
  dataSource: DataSource,
  operation: (queryRunner: QueryRunner) => Promise<T>,
): Promise<T> => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const result = await operation(queryRunner);
    await queryRunner.commitTransaction();
    return result;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw ErrorManager.createSignatureError(error);
  } finally {
    await queryRunner.release();
  }
};
