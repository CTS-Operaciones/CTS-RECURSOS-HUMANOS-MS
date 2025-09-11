import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository, UpdateResult } from 'typeorm';
import { TypesBondEntity } from 'cts-entities';

import { CreateTypeBondDto } from './dto/create-bond.dto';
import { UpdateTypeBondDto } from './dto/update-bond.dto';
import {
  createResult,
  deleteResult,
  findOneByTerm,
  paginationResult,
  restoreResult,
  updateResult,
  PaginationDto,
  ErrorManager,
  msgError,
} from '../common';

@Injectable()
export class TypesBondService {
  constructor(
    @InjectRepository(TypesBondEntity)
    private readonly typeBondService: Repository<TypesBondEntity>,
  ) {}

  async create(data: CreateTypeBondDto) {
    try {
      const { type } = data;

      const typeBond = await createResult(
        this.typeBondService,
        { type },
        TypesBondEntity,
      );

      return typeBond;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }
  async findAll(pagination: PaginationDto) {
    try {
      const result = await paginationResult(this.typeBondService, {
        ...pagination,
      });

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findOne(id: number, relations: boolean = false) {
    try {
      const options: FindOneOptions<TypesBondEntity> = {};

      if (relations) {
        options.relations = {
          bond_id: true,
        };
      }

      const result = await findOneByTerm({
        repository: this.typeBondService,
        term: id,
        options,
      });

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async update(id: number, data: UpdateTypeBondDto): Promise<UpdateResult> {
    try {
      const { type } = data;

      const result = await updateResult(this.typeBondService, id, {
        type,
      });

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async remove(id: number): Promise<UpdateResult> {
    try {
      const type = await this.findOne(id, true);

      if (type.bond_id.length > 0) {
        throw new ErrorManager({
          code: 'NOT_ACCEPTABLE',
          message: msgError('REGISTER_NOT_DELETE_ALLOWED', id),
        });
      }

      const result = await deleteResult(this.typeBondService, id);

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async restore(id: number): Promise<UpdateResult> {
    try {
      const result = await restoreResult(this.typeBondService, id);

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }
}
