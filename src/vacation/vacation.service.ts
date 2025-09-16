import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOneOptions, Repository } from 'typeorm';
import { VacationEntity } from 'cts-entities';

import {
  createResult,
  deleteResult,
  ErrorManager,
  findOneByTerm,
  runInTransaction,
  updateResult,
} from '../common';
import { CreateVacationDto, UpdateVacationDto } from './dto';
import { EmployeeService } from '../employee/employee.service';

@Injectable()
export class VacationService {
  constructor(
    @InjectRepository(VacationEntity)
    private readonly vacationRepository: Repository<VacationEntity>,
    private readonly employeeService: EmployeeService,
  ) {}

  async create(createVacationDto: CreateVacationDto) {
    try {
      const {
        employee,
        endDate,
        startDate,
        requested_day,
        status,
        comment = undefined,
        reason = undefined,
      } = createVacationDto;

      const _employee = await this.employeeService.getItem({
        term: employee,
      });

      const result = await createResult(
        this.vacationRepository,
        {
          employmentRecord: { employee: _employee },
          endDate,
          startDate,
          requested_day,
          status,
          comment,
          reason,
        },
        VacationEntity,
      );

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findOne(id: number, relations: boolean = false) {
    try {
      const options: FindOneOptions<VacationEntity> = {};

      if (relations) {
        options.relations = {
          employmentRecord: { employee: true },
        };
      }

      const result = await findOneByTerm({
        repository: this.vacationRepository,
        term: id,
        options,
      });

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async update(updateVacationDto: UpdateVacationDto) {
    try {
      const { id, employee: _, ...rest } = updateVacationDto;

      const vacation = await this.findOne(id, false);

      Object.assign(vacation, rest);

      const result = await updateResult(this.vacationRepository, id, vacation);

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);
      return await deleteResult(this.vacationRepository, id);
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }
}
