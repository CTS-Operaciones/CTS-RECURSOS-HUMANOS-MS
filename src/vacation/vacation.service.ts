import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { VacationEntity } from 'cts-entities';

import {
  createResult,
  deleteResult,
  ErrorManager,
  findOneByTerm,
  msgError,
  updateResult,
} from '../common';
import { CreateVacationDto, UpdateVacationDto } from './dto';
import { EmployeeService } from '../employee/employee.service';
import { HolidayService } from '../holiday/holiday.service';

@Injectable()
export class VacationService {
  constructor(
    @InjectRepository(VacationEntity)
    private readonly vacationRepository: Repository<VacationEntity>,
    private readonly employeeService: EmployeeService,
    private readonly holidayService: HolidayService,
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

      const activeContract = _employee.employmentRecord[0];

      if (!activeContract) {
        throw new ErrorManager({
          code: 'BAD_REQUEST',
          message: msgError('MSG', 'El empleado no tiene un contrato activo'),
        });
      }

      const daysRequested = await this.calculateBusinessDays(
        startDate,
        endDate,
      );

      if (daysRequested > activeContract.vacations_days!) {
        throw new ErrorManager({
          code: 'BAD_REQUEST',
          message: msgError('MSG', 'Días de vacaciones insuficientes'),
        });
      }

      if (daysRequested > _employee.employmentRecord[0].vacations_days!) {
        throw new ErrorManager({
          code: 'BAD_REQUEST',
          message: msgError('MSG', 'Días de vacaciones insuficientes'),
        });
      }

      const result = await createResult(
        this.vacationRepository,
        {
          employmentRecord: activeContract,
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

  private async calculateBusinessDays(start: Date, end: Date) {
    let count = 0;
    const current = new Date(start);

    const holidays = await this.holidayService.findAll({ all: true });

    const holidayDates = holidays.data.map(
      (h) => h.holiday_date.toISOString().split('T')[0],
    );

    while (current <= end) {
      const currentDateStr = current.toISOString().split('T')[0];
      const day = current.getDay();
      if (day !== 0 && day !== 6 && !holidayDates.includes(currentDateStr)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }
}
