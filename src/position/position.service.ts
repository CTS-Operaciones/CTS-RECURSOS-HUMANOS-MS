import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PositionEntity } from './entities/position.entity';
import {
  FindManyOptions,
  FindOneOptions,
  Repository,
  UpdateResult,
} from 'typeorm';
import { DepartmentService } from 'src/department/department.service';
import { CreatePositionDto, UpdatePositionDto } from './dto';
import {
  createResult,
  deleteResult,
  ErrorManager,
  findOneByTerm,
  IPaginationsResult,
  PaginationDto,
  paginationResult,
  restoreResult,
  updateResult,
} from 'src/common';
import { DepartmentEntity } from 'src/department/entities/department.entity';

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(PositionEntity)
    private readonly positionRepository: Repository<PositionEntity>,
    private readonly departmentService: DepartmentService,
  ) {}

  async create(createPositionDto: CreatePositionDto): Promise<PositionEntity> {
    try {
      const { name, salary, salary_in_words, department_id } =
        createPositionDto;

      const department = await this.departmentService.findOne({
        term: department_id,
      });

      return await createResult(
        this.positionRepository,
        {
          name,
          salary,
          salary_in_words,
          department_id: department,
        },
        PositionEntity,
      );
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<IPaginationsResult<PositionEntity>> {
    try {
      const options: FindManyOptions<PositionEntity> = {};

      if (pagination.relations) {
        options.relations = {
          department_id: true,
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
    id,
    relations = false,
  }: {
    id: string | number;
    relations?: boolean;
  }): Promise<PositionEntity> {
    try {
      const searchField: keyof PositionEntity = 'name';
      const options: FindOneOptions<PositionEntity> = {};

      if (relations) {
        options.relations = {
          department_id: true,
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

  async update(
    id: number,
    updatePositionDto: UpdatePositionDto,
  ): Promise<UpdateResult> {
    try {
      const { name, salary, salary_in_words, department_id } =
        updatePositionDto;

      const position = await this.findOne({ id, relations: true });

      let department = position.department_id;

      if (department_id && department.id !== department_id) {
        department = await this.departmentService.findOne({
          term: department_id,
        });
      }

      Object.assign(position, {
        name,
        salary,
        salary_in_words,
        department_id: department,
      });

      const result = await updateResult(this.positionRepository, id, position);

      return result;
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
