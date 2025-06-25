import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { DepartmentEntity } from 'cts-entities';

import {
  createResult,
  deleteResult,
  ErrorManager,
  findOneByTerm,
  FindOneWhitTermAndRelationDto,
  IPaginationResult,
  PaginationRelationsDto,
  paginationResult,
  restoreResult,
  updateResult,
} from '../common';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
  ) {}

  async create(
    createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentEntity> {
    try {
      const { name, abreviation } = createDepartmentDto;

      const result = await createResult(
        this.departmentRepository,
        {
          name,
          abreviation,
        },
        DepartmentEntity,
      );

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findAll(
    pagination: PaginationRelationsDto,
  ): Promise<IPaginationResult<DepartmentEntity>> {
    try {
      const options: FindManyOptions<DepartmentEntity> = {};

      if (pagination.relations) {
        options.relations = {
          positions: true,
        };
      }

      const result = await paginationResult(this.departmentRepository, {
        ...pagination,
        options,
      });

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findOneByTerm({
    term,
    relations = false,
  }: FindOneWhitTermAndRelationDto): Promise<DepartmentEntity> {
    try {
      const searchField: keyof DepartmentEntity = 'name';
      const options: FindOneOptions<DepartmentEntity> = {};

      if (relations) {
        options.relations = {
          positions: true,
        };
      }

      const result = await findOneByTerm({
        repository: this.departmentRepository,
        term,
        searchField,
        options,
      });

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findOneById({
    term,
    relations = false,
  }: FindOneWhitTermAndRelationDto): Promise<DepartmentEntity> {
    try {
      const options: FindOneOptions<DepartmentEntity> = {};

      if (relations) {
        options.relations = {
          positions: true,
        };
      }

      const result = await findOneByTerm({
        repository: this.departmentRepository,
        term,
        options,
      });

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async update(updateDepartmentDto: UpdateDepartmentDto) {
    try {
      const { id, ...rest } = updateDepartmentDto;
      const deparment = await this.findOneById({ term: id });

      Object.assign(deparment, rest);

      const result = await updateResult(
        this.departmentRepository,
        id,
        deparment,
      );

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async remove(id: number) {
    try {
      return await deleteResult(this.departmentRepository, id);
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async restore(id: number) {
    try {
      return await restoreResult(this.departmentRepository, id);
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }
}
