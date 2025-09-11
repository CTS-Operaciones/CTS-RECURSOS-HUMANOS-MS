import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { DismissalEntity, EmployeeEntity } from 'cts-entities';

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
    @InjectRepository(DismissalEntity)
    private readonly dismissalsRepository: Repository<DismissalEntity>,
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

      const employee = await this.employeeService.getItem({
        term: employee_id,
      });

      const result = await createResult(
        this.dismissalsRepository,
        { reason, date, comment, employee },
        DismissalEntity,
      );

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  findAll(paginationDto: PaginationRelationsDto) {
    try {
      const { relations, ...pagination } = paginationDto;

      const options: FindManyOptions<DismissalEntity> = {};

      if (relations) {
        options.relations = {
          employee: true,
        };
      }

      const result = paginationResult(this.dismissalsRepository, {
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
      const options: FindOneOptions<DismissalEntity> = {};

      if (relations) {
        options.relations = {
          employee: true,
        };
      }

      const result = await findOneByTerm({
        repository: this.dismissalsRepository,
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
        this.dismissalsRepository,
        { ...dismissal, reason, date, comment },
        DismissalEntity,
      );

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async remove(id: number) {
    try {
      return await this.dismissalsRepository.delete(id);
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }
}
