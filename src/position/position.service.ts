import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PositionEntity, SalaryEntity, DepartmentEntity } from 'cts-entities';
import {
  DataSource,
  FindManyOptions,
  FindOneOptions,
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
  findOneByTerm,
  FindOneWhitTermAndRelationDto,
  IPaginationResult,
  ISalary,
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

        const department = await this.departmentService.findOne({
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
  async findAll(
    pagination: PaginationRelationsDto,
  ): Promise<IPaginationResult<PositionEntity>> {
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
  }: FindOneWhitTermAndRelationDto): Promise<PositionEntity> {
    try {
      const searchField: keyof PositionEntity = 'name';
      const options: FindOneOptions<PositionEntity> = {};

      if (relations) {
        options.relations = {
          department: true,
          salary: true,
        };
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

  async update({
    id,
    ...updatePositionDto
  }: UpdatePositionDto): Promise<UpdateResult> {
    try {
      return runInTransaction(this.dataSource, async (queryRunner) => {
        const { name, salary, department_id } = updatePositionDto;

        const position = await this.findOne({ term: id, relations: true });

        let department = position.department;
        if (department_id && department.id !== department_id) {
          department = await this.departmentService.findOne({
            term: department_id,
          });
        }

        let salaryNew = position.salary;
        if (salary?.amount !== salaryNew.amount) {
          salaryNew = await this.findOrCreateSalary(queryRunner, {
            amount: salary?.amount || 0,
            salary_in_words: salary?.salary_in_words || '',
          });
        }

        Object.assign(position, {
          name,
          salary: salaryNew,
          department,
        });

        const result = await updateResult(
          this.positionRepository,
          id,
          position,
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
