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

      return await runInTransaction(this.dataSource, async (queryRunner) => {
        const { employmentRecord } = await this.employeeService.getItem({
          term: employee_id,
        });

        if (!employmentRecord || !employmentRecord[0]) {
          throw new ErrorManager({
            code: 'NOT_FOUND',
            message: msgError('NO_WITH_TERM', employee_id),
          });
        }

        // Verificar que el employmentRecord esté activo (date_end IS NULL)
        if (employmentRecord[0].date_end !== null) {
          throw new ErrorManager({
            code: 'NOT_ACCEPTABLE',
            message: msgError(
              'MSG',
              'El empleado ya tiene un registro de despido activo',
            ),
          });
        }

        // Obtener el registro de empleo activo
        const currentEmploymentRecord = employmentRecord[0];

        // Actualizar el employment_record con date_end, reason y comment
        // Esto activa el trigger SQL que automáticamente:
        // - Marca TODAS las employee_has_positions relacionadas como eliminadas
        // - Marca TODOS los staff relacionados como eliminados
        // - Cambia el estado del empleado a DISMISSAL
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

        return result;
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async createBulk(createBulkDismissalDto: CreateBulkDismissalDto) {
    try {
      const { employees, reason, date, comment = '' } = createBulkDismissalDto;

      // Eliminar IDs duplicados usando Set
      const uniqueEmployeeIds = Array.from(new Set(employees));

      return await runInTransaction(this.dataSource, async (queryRunner) => {
        const results: EmploymentRecordEntity[] = [];

        for (const employee_id of uniqueEmployeeIds) {
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

          // Obtener el registro de empleo activo (date_end IS NULL)
          // El empleado puede tener múltiples employmentRecords históricos,
          // pero getItem solo devuelve el activo según el where clause
          const currentEmploymentRecord = employmentRecord[0];

          // Actualizar el employment_record con date_end, reason y comment
          // Esto activa el trigger SQL que automáticamente:
          // - Marca TODAS las employee_has_positions relacionadas como eliminadas
          // - Marca TODOS los staff relacionados como eliminados
          // - Cambia el estado del empleado a DISMISSAL
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
