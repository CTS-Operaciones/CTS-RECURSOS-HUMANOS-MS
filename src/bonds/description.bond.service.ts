import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository, UpdateResult } from 'typeorm';
import { DescriptionBondEntity } from 'cts-entities';

import { CreateDescriptionBondDto } from './dto/create-bond.dto';
import { UpdateDescriptionBondDto } from './dto/update-bond.dto';

import {
  PaginationDto,
  ErrorManager,
  createResult,
  deleteResult,
  findOneByTerm,
  paginationResult,
  restoreResult,
  updateResult,
  msgError,
} from '../common';

@Injectable()
export class DescriptionBondService {
  constructor(
    @InjectRepository(DescriptionBondEntity)
    private readonly descriptionBondService: Repository<DescriptionBondEntity>,
  ) {}

  async create(data: CreateDescriptionBondDto): Promise<DescriptionBondEntity> {
    try {
      const { description } = data;

      const descriptionBond = await createResult(
        this.descriptionBondService,
        { description },
        DescriptionBondEntity,
      );

      return descriptionBond;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }
  async findAll(pagination: PaginationDto) {
    try {
      const result = await paginationResult(this.descriptionBondService, {
        ...pagination,
      });

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findOne(
    id: number,
    relations: boolean = false,
  ): Promise<DescriptionBondEntity> {
    try {
      const options: FindOneOptions<DescriptionBondEntity> = {};

      if (relations) {
        options.relations = {
          bond_id: true,
        };
      }

      const result = await findOneByTerm({
        repository: this.descriptionBondService,
        term: id,
        options,
      });

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async update(
    id: number,
    data: UpdateDescriptionBondDto,
  ): Promise<UpdateResult> {
    try {
      const { description } = data;

      const result = await updateResult(this.descriptionBondService, id, {
        description,
      });

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async remove(id: number): Promise<UpdateResult> {
    try {
      const description = await this.findOne(id, true);

      if (description.bond_id.length > 0) {
        throw new ErrorManager({
          code: 'NOT_ACCEPTABLE',
          message: msgError('REGISTER_NOT_DELETE_ALLOWED', id),
        });
      }

      const result = await deleteResult(this.descriptionBondService, id);

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async restore(id: number): Promise<UpdateResult> {
    try {
      const result = await restoreResult(this.descriptionBondService, id);

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }
}
