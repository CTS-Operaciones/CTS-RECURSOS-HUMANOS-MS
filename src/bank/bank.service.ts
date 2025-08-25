import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { BankEntity } from 'cts-entities';

import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import {
  createResult,
  deleteResult,
  ErrorManager,
  findOneByTerm,
  msgError,
  PaginationDto,
  paginationResult,
  restoreResult,
  updateResult,
} from 'src/common';

@Injectable()
export class BankService {
  constructor(
    @InjectRepository(BankEntity)
    private readonly bankRepository: Repository<BankEntity>,
  ) {}
  async create(createBankDto: CreateBankDto) {
    try {
      const { name } = createBankDto;

      const result = await createResult(
        this.bankRepository,
        { name },
        BankEntity,
      );

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findAll(pagination: PaginationDto) {
    try {
      return await paginationResult(this.bankRepository, pagination);
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findOne(id: number, relations: boolean = false) {
    try {
      const options: FindOneOptions<BankEntity> = {};

      if (relations) options.relations = { employees: true };

      const result = await findOneByTerm<BankEntity>({
        repository: this.bankRepository,
        term: id,
        options,
      });

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async update(updateBankDto: UpdateBankDto) {
    try {
      const { id, name } = updateBankDto;

      const result = await updateResult(this.bankRepository, id, { name });

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async remove(id: number) {
    try {
      const bank = await this.findOne(id, true);

      if (bank.employees.length > 0) {
        throw new ErrorManager({
          code: 'NOT_ACCEPTABLE',
          message: msgError('REGISTER_NOT_DELETE_ALLOWED', id),
        });
      }

      return await deleteResult(this.bankRepository, id);
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async restore(id: number) {
    try {
      return await restoreResult(this.bankRepository, id);
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }
}
