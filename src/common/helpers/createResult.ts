import { ClassConstructor, plainToClass } from 'class-transformer';
import { DeepPartial, ObjectLiteral, Repository } from 'typeorm';

export async function createResult<T extends ObjectLiteral>(
  repository: Repository<T>,
  data: DeepPartial<T>,
  classType: ClassConstructor<T>,
): Promise<T> {
  const addRegister = repository.create(data);
  const saveRegister = await repository.save(addRegister);

  return plainToClass(classType, saveRegister);
}
