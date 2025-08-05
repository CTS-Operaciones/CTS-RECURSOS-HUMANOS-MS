import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PositionEntity, SalaryEntity, DepartmentEntity } from 'cts-entities';
import {
  DataSource,
  FindManyOptions,
  FindTreeOptions,
  In,
  IsNull,
  QueryRunner,
  Repository,
  TreeRepository,
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
  restoreResult,
  runInTransaction,
  updateResult,
} from '../common';

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(PositionEntity)
    private readonly positionRepository: Repository<PositionEntity>,
    @InjectRepository(PositionEntity)
    private readonly positionRepo: TreeRepository<PositionEntity>,
    @InjectRepository(SalaryEntity)
    private readonly salaryRepository: Repository<SalaryEntity>,
    private readonly dataSource: DataSource,
    private readonly departmentService: DepartmentService,
  ) {}

  async create(createPositionDto: CreatePositionDto) {
    try {
      return runInTransaction(this.dataSource, async (queryRunner) => {
        const {
          salary,
          department_id,
          parent = undefined,
          ...payload
        } = createPositionDto;
        const { salary_in_words, amount } = salary;

        if (parent) {
          const {
            salary: _,
            department,
            ...boos
          } = await this.findOne({
            term: parent,
            relations: true,
          });

          payload['parent'] = { id: boos.id };
          payload['department'] = department;
        } else if (department_id) {
          const department = await this.departmentService.findOneByTerm({
            term: department_id,
          });

          payload['department'] = department;
        } else {
          throw new ErrorManager(msgError('NO_GET_PARAM'));
        }

        const salaryCrated = await this.findOrCreateSalary(queryRunner, {
          amount,
          salary_in_words,
        });

        const position = await createResult(
          this.positionRepo,
          {
            ...payload,
            salary: salaryCrated,
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

  // TODO: #7 Paginar
  async findAll(
    pagination: PaginationRelationsDto,
  ): Promise<IPaginationResult<PositionEntity>> {
    try {
      const options: FindTreeOptions = {};

      if (pagination.relations) {
        options.relations = ['department', 'salary'];
      }

      const positionsBoos = await this.positionRepo.findTrees(options);

      return {
        limit: 0,
        page: 0,
        totalPages: 0,
        totalResult: 0,
        data: positionsBoos,
      };
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
          parent: true,
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

  async update({ id, ...updatePositionDto }: UpdatePositionDto) {
    try {
      return runInTransaction(this.dataSource, async (queryRunner) => {
        const { name, salary, department_id, parent } = updatePositionDto;

        const {
          department,
          salary: _salary,
          parent: _parent,
          ...position
        } = await this.findOne({ term: id, relations: true });

        if (department_id && department.id !== department_id) {
          position['department'] = await this.departmentService.findOneByTerm({
            term: department_id,
          });
        }

        if (salary && salary?.amount !== salary.amount) {
          position['salary'] = await this.findOrCreateSalary(queryRunner, {
            amount: salary?.amount || 0,
            salary_in_words: salary?.salary_in_words || '',
          });
        }

        if (parent && parent !== _parent?.id) {
          position['parent'] = await this.findOne({
            term: parent,
          });
        }

        Object.assign(position, {
          name,
        });

        const result = await createResult(
          this.positionRepo,
          position,
          PositionEntity,
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
