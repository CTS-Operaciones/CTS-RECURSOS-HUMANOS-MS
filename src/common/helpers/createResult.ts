import { ClassConstructor, plainToClass } from 'class-transformer';
import { DeepPartial, ObjectLiteral, QueryRunner, Repository } from 'typeorm';

export async function createResult<T extends ObjectLiteral>(
  repository: Repository<T>,
  data: DeepPartial<T>,
  classType: ClassConstructor<T>,
  queryRunner?: QueryRunner,
): Promise<T> {
  const repo: Repository<T> = queryRunner
    ? queryRunner.manager.getRepository(repository.metadata.target)
    : repository;

  const addRegister = repo.create(data);
  const saveRegister = await repo.save(addRegister);

  return plainToClass(classType, saveRegister);
}
