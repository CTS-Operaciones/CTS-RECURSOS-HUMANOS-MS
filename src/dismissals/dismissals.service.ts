import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { EmploymentRecordEntity, msgError } from 'cts-entities';

import {
  createResult,
  ErrorManager,
  findOneByTerm,
  PaginationRelationsDto,
  paginationResult,
  runInTransaction,
} from '../common';
import { CreateDismissalDto, CreateBulkDismissalDto, UpdateDismissalDto } from './dto';
import { EmployeeService } from '../employee/employee.service';

@Injectable()
export class DismissalsService {
  constructor(
    @InjectRepository(EmploymentRecordEntity)
    private readonly employmentRecordRepository: Repository<EmploymentRecordEntity>,
    private readonly employeeService: EmployeeService,
    private readonly dataSource: DataSource,
  ) { }

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

  async createBulk(createBulkDismissalDto: CreateBulkDismissalDto) {
    try {
      const { employees, reason, date, comment = '' } = createBulkDismissalDto;

      return await runInTransaction(this.dataSource, async (queryRunner) => {
        const results: EmploymentRecordEntity[] = [];

        for (const employee_id of employees) {
          const { employmentRecord } = await this.employeeService.getItem({
            term: employee_id
          });

          if (!employmentRecord || !employmentRecord[0]) {
            throw new ErrorManager({
              code: 'NOT_FOUND',
              message: msgError('NO_WITH_TERM', employee_id),
            });
          }

          if (!employmentRecord[0].typeContract) {
            throw new ErrorManager({
              code: 'NOT_FOUND',
              message: msgError('NO_WITH_TERM', employee_id),
            });
          }

          if (employmentRecord[0].typeContract.isAutomatic !== false) {
            throw new ErrorManager({
              code: 'NOT_ACCEPTABLE',
              message: msgError('MSG', 'No se puede despedir a un empleado con contrato fijo'),
            });
          }

          // Obtener el registro de empleo actual para actualizarlo
          const currentEmploymentRecord = employmentRecord[0];

          // Actualizar el employment_record con date_end, reason y comment
          // Esto activa el trigger que marcará el empleado como DISMISSAL
          const result = await createResult(
            this.employmentRecordRepository,
            {
              ...currentEmploymentRecord,
              reason,
              date_end: date,
              comment,
            },
            EmploymentRecordEntity,
            queryRunner,
          );

          results.push(result);
        }

        return results;
      });
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
