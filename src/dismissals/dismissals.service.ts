import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { EmploymentRecordEntity, EmployeeEntity } from 'cts-entities';

import { CreateDismissalDto, UpdateDismissalDto } from './dto';
import {
  createResult,
  ErrorManager,
  findOneByTerm,
  PaginationRelationsDto,
  paginationResult,
} from '../common';
import { EmployeeService } from '../employee/employee.service';

@Injectable()
export class DismissalsService {
  constructor(
    @InjectRepository(EmploymentRecordEntity)
    private readonly employmentRecordRepository: Repository<EmploymentRecordEntity>,
    private readonly employeeService: EmployeeService,
  ) {}

  async create(createDismissalDto: CreateDismissalDto) {
    try {
      const {
        employee: employee_id,
        reason,
        date,
        comment = '',
      } = createDismissalDto;

      const { employmentRecord, ...employee } =
        await this.employeeService.getItem({
          term: employee_id,
          relations: true,
        });

      Object.assign(employmentRecord, {
        reason,
        date_end: date,
      });

      const result = await createResult(
        this.employmentRecordRepository,
        { ...employmentRecord[0], reason, date_end: date, comment },
        EmploymentRecordEntity,
      );

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  findAll(paginationDto: PaginationRelationsDto) {
    try {
      const { relations, ...pagination } = paginationDto;

      const options: FindManyOptions<EmploymentRecordEntity> = {};

      if (relations) {
        options.relations = {
          employee: true,
        };
      }

      const result = paginationResult(this.employmentRecordRepository, {
        ...pagination,
        options,
      });

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findOne(id: number, relations: boolean = false) {
    try {
      const options: FindOneOptions<EmploymentRecordEntity> = {};

      if (relations) {
        options.relations = {
          employee: true,
        };
      }

      const result = await findOneByTerm({
        repository: this.employmentRecordRepository,
        term: id,
        options,
      });

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async update({ id, ...updateDismissalDto }: UpdateDismissalDto) {
    try {
      const { employee, reason, date, comment } = updateDismissalDto;

      const dismissal = await this.findOne(id, true);

      if (employee && dismissal.employee.id !== employee) {
        dismissal.employee = await this.employeeService.getItem({
          term: employee,
        });
      }

      const result = await createResult(
        this.employmentRecordRepository,
        { ...dismissal, reason, date_end: date, comment },
        EmploymentRecordEntity,
      );

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async remove(id: number) {
    try {
      return await this.employmentRecordRepository.delete(id);
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }
}
