import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PositionEntity,
  SalaryEntity,
  DepartmentEntity,
  HeadquartersPositionQuota,
  EmployeeHasPositions,
  StaffEntity,
} from 'cts-entities';
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
  col,
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
    @InjectRepository(HeadquartersPositionQuota)
    private readonly headquartersPositionQuotaRepository: Repository<HeadquartersPositionQuota>,
  ) {}

  async create(createPositionDto: CreatePositionDto) {
    try {
      const {
        salary,
        department_id,
        parent = undefined,
        required_boss = false,
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
        throw new ErrorManager({
          code: 'NOT_FOUND',
          message: msgError('NO_GET_PARAM'),
        });
      }

      return runInTransaction(this.dataSource, async (queryRunner) => {
        const salaryCrated = await this.findOrCreateSalary(queryRunner, {
          amount,
          salary_in_words,
        });

        const position = await createResult(
          this.positionRepo,
          {
            ...payload,
            salary: salaryCrated,
            requiredBoss: required_boss,
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

  async getPositionsByHeadquarter(hqId: number) {
    const positionAlias = 'position',
      employeeHasPositionAlias = 'ehp',
      staffAlias = 'staff';

    const quotas = await this.headquartersPositionQuotaRepository.find({
      select: { id: true, position_id: true, max_employee: true },
      where: { headquarters: { id: hqId } },
    });

    const positionIds = quotas.map((q) => q.position_id);

    if (positionIds.length === 0) return [];

    const positionsWithStaff = await this.positionRepo
      .createQueryBuilder(positionAlias)
      .leftJoin(
        col<PositionEntity>(positionAlias, 'employeeHasPosition'),
        employeeHasPositionAlias,
      )
      .leftJoin(
        col<EmployeeHasPositions>(employeeHasPositionAlias, 'staff'),
        staffAlias,
        `${col<StaffEntity>(staffAlias, 'headquarter')} = :hqId`,
        { hqId },
      )
      .select([
        col<PositionEntity>(positionAlias, 'id'),
        col<PositionEntity>(positionAlias, 'name'),
        col<PositionEntity>(positionAlias, 'parent'),
        `COUNT(${col<StaffEntity>(staffAlias, 'id')}) > 0 AS "hasStaff"`,
      ])
      .whereInIds(positionIds)
      .groupBy(col<PositionEntity>(positionAlias, 'id'))
      .getRawMany();

    const positionIdSet = new Set(positionIds);
    const parentHasStaffMap = new Map<number, boolean>();
    positionsWithStaff.forEach((p) => {
      parentHasStaffMap.set(p.position_id, p.hasStaff);
    });

    return positionsWithStaff.map((p) => {
      const validParentId =
        p.parentId && positionIdSet.has(p.parentId) ? p.parentId : null;

      return {
        id: p.position_id,
        name: p.position_name,
        parentId: validParentId,
        hasStaff: p.hasStaff,
        visible: validParentId
          ? parentHasStaffMap.get(validParentId) || false
          : true, // visible solo si parent válido tiene staff
      };
    });
  }

  async findAllPlainresponse(pagination: PaginationRelationsDto) {
    try {
      const { relations, ..._pagination } = pagination;
      const options: FindManyOptions<PositionEntity> = {};

      if (relations) {
        options.relations = {
          department: true,
          salary: true,
        };
      }

      const positions = await paginationResult(this.positionRepository, {
        ..._pagination,
        options,
      });

      return positions;
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
        const { name, salary, department_id, parent, required_boss } =
          updatePositionDto;

        const {
          department,
          salary: _salary,
          parent: _parent,
          ...position
        } = await this.findOne({ term: id, relations: true });

        if (name && name !== position.name) {
          position['name'] = name;
        }

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

        position['requiredBoss'] =
          required_boss !== undefined
            ? required_boss
            : position['requiredBoss'];

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
      const position = await this.findOne({
        term: id,
        allRelations: true,
      });

      if (position?.employeeHasPosition?.length > 0) {
        throw new ErrorManager({
          code: 'NOT_ACCEPTABLE',
          message: msgError('REGISTER_NOT_DELETE_ALLOWED', id),
        });
      }

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
