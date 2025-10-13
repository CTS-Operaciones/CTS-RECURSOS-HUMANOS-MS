import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { STATUS_VACATIONS_PERMISSION, VacationEntity } from 'cts-entities';

import {
  createResult,
  deleteResult,
  ErrorManager,
  findOneByTerm,
  msgError,
  paginationResult,
  updateResult,
} from '../common';
import {
  CreateVacationDto,
  DatesRangeDto,
  FindHistoryByEmployeeDto,
  SetStatusOfVacationDto,
  UpdateVacationDto,
} from './dto';
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
        dateRange,
        requested_day,
        status,
        comment = undefined,
        reason = undefined,
      } = createVacationDto;

      const { employmentRecord } = await this.employeeService.getItem({
        term: employee,
      });

      const activeContract = employmentRecord[0];

      if (!activeContract) {
        throw new ErrorManager({
          code: 'BAD_REQUEST',
          message: msgError('MSG', 'El empleado no tiene un contrato activo'),
        });
      }

      const daysRequested = await this.calculateBusinessDays(dateRange);

      if (daysRequested > activeContract.vacations_days!) {
        throw new ErrorManager({
          code: 'BAD_REQUEST',
          message: msgError('MSG', 'Días de vacaciones insuficientes'),
        });
      }

      if (daysRequested > employmentRecord[0].vacations_days!) {
        throw new ErrorManager({
          code: 'BAD_REQUEST',
          message: msgError('MSG', 'Días de vacaciones insuficientes'),
        });
      }

      const result = await createResult(
        this.vacationRepository,
        {
          employmentRecord: activeContract,
          rangeDates: dateRange,
          requested_day: daysRequested,
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

  async setStatusOfVacation(payload: SetStatusOfVacationDto) {
    try {
      const { id, status } = payload;
      const vacation = await this.findOne(id);

      Object.assign(vacation, { status });

      const result = await updateResult(this.vacationRepository, id, vacation);

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

  async findHistoryByEmployee({
    employee_id,
    relations,
    ..._pagination
  }: FindHistoryByEmployeeDto) {
    try {
      const options: FindOneOptions<VacationEntity> = {
        where: { employmentRecord: { employee: { id: employee_id } } },
        order: { created_at: 'DESC' },
      };

      if (relations) {
        options.relations = {
          employmentRecord: { employee: true },
        };
      }

      const pagination = {
        ..._pagination,
        options,
      };

      const vacationHistory = await paginationResult(
        this.vacationRepository,
        pagination,
      );

      return vacationHistory;
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

  private async calculateBusinessDays(
    dateRange: DatesRangeDto | DatesRangeDto[],
  ): Promise<number> {
    const dateRanges = Array.isArray(dateRange) ? dateRange : [dateRange];

    let totalBusinessDays = 0;

    const holidays = await this.holidayService.findAll({ all: true });
    const holidayDates = holidays.data.map((h) =>
      typeof h.holiday_date === 'string'
        ? h.holiday_date
        : h.holiday_date.toISOString().split('T')[0],
    );

    for (const range of dateRanges) {
      const { start, end } = range;
      const current = new Date(start);

      while (current <= end) {
        const currentDateStr = current.toISOString().split('T')[0];
        const day = current.getDay();

        if (day !== 0 && day !== 6 && !holidayDates.includes(currentDateStr)) {
          totalBusinessDays++;
        }
        current.setDate(current.getDate() + 1);
      }
    }

    return totalBusinessDays;
  }
}
