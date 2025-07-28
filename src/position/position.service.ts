import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PositionEntity, SalaryEntity, DepartmentEntity } from 'cts-entities';
import {
  DataSource,
  FindManyOptions,
  In,
  IsNull,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';

import { DepartmentService } from '../department/department.service';
import { CreatePositionDto, UpdatePositionDto } from './dto';
import {
  createResult,
  deleteResult,
  ErrorManager,
  FindByIdsDto,
  findManyIn,
  findOneByTerm,
  FindOneWhitTermAndRelationDto,
  IPaginationResult,
  ISalary,
  msgError,
  PaginationRelationsDto,
  paginationResult,
  restoreResult,
  runInTransaction,
  updateResult,
} from '../common';

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(PositionEntity)
    private readonly positionRepository: Repository<PositionEntity>,
    @InjectRepository(SalaryEntity)
    private readonly salaryRepository: Repository<SalaryEntity>,
    private readonly dataSource: DataSource,
    private readonly departmentService: DepartmentService,
  ) {}

  async create(createPositionDto: CreatePositionDto) {
    try {
      return runInTransaction(this.dataSource, async (queryRunner) => {
        const { name, salary, department_id } = createPositionDto;
        const { salary_in_words, amount } = salary;

        const department = await this.departmentService.findOneByTerm({
          term: department_id,
        });

        const salaryCrated = await this.findOrCreateSalary(queryRunner, {
          amount,
          salary_in_words,
        });

        const position = await createResult(
          this.positionRepository,
          {
            name,
            salary: salaryCrated,
            department,
          },
          PositionEntity,
          queryRunner,
        );

        return {
          ...position,
          salary: {
            id: salaryCrated.id,
            amount: salary.amount,
            salary_in_words: salary.salary_in_words,
          },
        };
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findOrCreateSalary(
    queryRunner: QueryRunner,
    { amount, salary_in_words }: ISalary,
  ) {
    try {
      let salaryCrated = await queryRunner.manager.findOne(SalaryEntity, {
        where: { amount, deleted_at: IsNull() },
      });

      if (!salaryCrated) {
        salaryCrated = await createResult(
          this.salaryRepository,
          {
            amount,
            salary_in_words,
          },
          SalaryEntity,
          queryRunner,
        );
      }

      return salaryCrated;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findAll(pagination: PaginationRelationsDto) {
    try {
      const options: FindManyOptions<PositionEntity> = {};

      if (pagination.relations) {
        options.relations = {
          department: true,
          salary: true,
        };
      }

      return await paginationResult(this.positionRepository, {
        ...pagination,
        options,
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findOne({
    term: id,
    relations = false,
    deletes = false,
    allRelations = false,
  }: FindOneWhitTermAndRelationDto): Promise<PositionEntity> {
    try {
      let searchField: keyof PositionEntity = 'name';
      const options: FindManyOptions<PositionEntity> = {};

      if (relations || allRelations) {
        options.relations = {
          department: true,
          salary: true,
        };
      }

      if (allRelations) {
        options.relations = {
          ...options.relations,
          employeeHasPosition: {
            staff: true,
          },
        };
      }

      if (deletes) {
        options.withDeleted = true;
      }

      if (!isNaN(+id)) {
        options.where = { id: +id };
        searchField = 'id';
      }

      const result = await findOneByTerm({
        repository: this.positionRepository,
        term: id,
        searchField,
        options,
      });

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findManyByIds(findManyByIds: FindByIdsDto) {
    try {
      const { ids, deletes, relations, allRelations } = findManyByIds;
      const options: FindManyOptions<PositionEntity> = {};

      if (deletes) {
        options.withDeleted = true;
      }

      if (relations) {
        options.relations = {
          salary: true,
        };
      }

      if (allRelations) {
        options.relations = {
          ...options.relations,
          department: true,
        };
      }

      const positions = await findManyIn({
        repository: this.positionRepository,
        options: {
          ...options,
          where: { id: In(ids) },
        },
      });

      if (positions.length !== ids.length) {
        throw new ErrorManager({
          code: 'NOT_ACCEPTABLE',
          message: msgError('LENGTH_INCORRECT', {
            ids: ids.length,
            find: positions.length,
          }),
        });
      }

      return positions;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async update({
    id,
    ...updatePositionDto
  }: UpdatePositionDto): Promise<UpdateResult> {
    try {
      return runInTransaction(this.dataSource, async (queryRunner) => {
        const { name, salary, department_id } = updatePositionDto;

        const position = await this.findOne({ term: id, relations: true });

        let department = position[0].department;
        if (department_id && department.id !== department_id) {
          department = await this.departmentService.findOneByTerm({
            term: department_id,
          });
        }

        let salaryNew = position[0].salary;
        if (salary?.amount !== salaryNew.amount) {
          salaryNew = await this.findOrCreateSalary(queryRunner, {
            amount: salary?.amount || 0,
            salary_in_words: salary?.salary_in_words || '',
          });
        }

        Object.assign(position[0], {
          name,
          salary: salaryNew,
          department,
        });

        const result = await updateResult(
          this.positionRepository,
          id,
          position[0],
          queryRunner,
        );

        return result;
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async remove(id: number): Promise<UpdateResult> {
    try {
      const result = await deleteResult(this.positionRepository, id);

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async restore(id: number): Promise<UpdateResult> {
    try {
      const result = await restoreResult(this.positionRepository, id);

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }
}
