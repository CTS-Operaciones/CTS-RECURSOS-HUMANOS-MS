import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import {
  ATTENDANCE_PERMISSION_TYPE,
  AttendancePermission,
  EmploymentRecordEntity,
  STATUS_VACATIONS_PERMISSION,
} from 'cts-entities';

import {
  AddJustificationDto,
  CreateAttendancePermissionDto,
  FilterDateDto,
  SetStatusOfPermissionDto,
  UpdateAttendancePermissionDto,
} from './dto';
import {
  createResult,
  deleteResult,
  ErrorManager,
  findOneByTerm,
  msgError,
  paginationResult,
  updateResult,
} from '../common';
import { EmployeeService } from '../employee/employee.service';

@Injectable()
export class AttendancePermissionService {
  constructor(
    @InjectRepository(AttendancePermission)
    private readonly attendancePermissionRepository: Repository<AttendancePermission>,
    private readonly employeeService: EmployeeService,
  ) {}

  async create(createAttendancePermissionDto: CreateAttendancePermissionDto) {
    try {
      const {
        employee_id,
        permission_type,
        start_date,
        end_date,
        reason,
        requested_at,
        time_end,
        time_start,
        required_justified,
        required_presences,
      } = createAttendancePermissionDto;

      if (end_date < start_date) {
        throw new ErrorManager({
          code: 'NOT_ACCEPTABLE',
          message: msgError(
            'MSG',
            'La fecha de fin debe ser mayor a la de inicio',
          ),
        });
      }

      if (
        permission_type === ATTENDANCE_PERMISSION_TYPE.HOURS &&
        (!time_start || !time_end)
      ) {
        throw new ErrorManager({
          code: 'NOT_ACCEPTABLE',
          message: msgError(
            'MSG',
            'Para permisos por horas, debe especificar las horas de validez de este',
          ),
        });
      } else if (
        permission_type === ATTENDANCE_PERMISSION_TYPE.HOURS &&
        time_end! <= time_start!
      ) {
        throw new ErrorManager({
          code: 'NOT_ACCEPTABLE',
          message: msgError(
            'MSG',
            'El horario de fin debe ser mayor al de inicio',
          ),
        });
      }

      const { employmentRecord } = await this.employeeService.getItem({
        term: employee_id,
      });

      await this.validateNotExistPermissionActive({
        employee_id: employmentRecord[0],
        start_date,
        end_date,
      });

      const attendancePermission = await createResult(
        this.attendancePermissionRepository,
        {
          permission_type,
          start_date,
          end_date,
          reason,
          status: STATUS_VACATIONS_PERMISSION.PENDING,
          employees: employmentRecord[0],
          requested_at,
          time_end,
          time_start,
          required_presences,
          required_justified,
        },
        AttendancePermission,
      );

      // TODO: #9 Enviar notificacion al jefé inmediato

      return attendancePermission;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async setStatusOfPermission(payload: SetStatusOfPermissionDto) {
    try {
      const { id, status, approved_at, approved_by } = payload;

      const attendancePermissions = await this.findOne(id);

      Object.assign(attendancePermissions, {
        status,
        approved_at,
        approved_by,
      });

      const result = await updateResult(
        this.attendancePermissionRepository,
        id,
        attendancePermissions,
      );

      // TODO: #9 Enviar notificacion al empleado(opcional)

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async addJustificationPresence(payload: AddJustificationDto) {
    try {
      const { id, justification } = payload;

      const attendancePermission = await this.findOne(id);

      if (!attendancePermission.required_justified) {
        throw new ErrorManager({
          code: 'NOT_ACCEPTABLE',
          message: msgError(
            'MSG',
            'No se puede agregar justificación a un permiso que no requiere justificación',
          ),
        });
      }

      Object.assign(attendancePermission, { justified: justification });

      const result = await updateResult(
        this.attendancePermissionRepository,
        id,
        attendancePermission,
      );

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findAll(pagination: FilterDateDto) {
    try {
      const { startDate, endDate, relations, ..._pagination } = pagination;
      const options: FindManyOptions<AttendancePermission> = {};

      if (startDate && endDate) {
        if (startDate > endDate)
          throw new ErrorManager({
            code: 'NOT_ACCEPTABLE',
            message: msgError(
              'MSG',
              'La fecha de fin debe ser mayor a la de inicio',
            ),
          });

        options.where = {
          start_date: MoreThanOrEqual(startDate),
          end_date: LessThanOrEqual(endDate),
        };
      }

      if (relations) {
        options.relations = {
          employees: true,
        };
      }

      const attendancePermission = await paginationResult(
        this.attendancePermissionRepository,
        { ..._pagination, options },
      );

      return attendancePermission;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findOne(id: number, relations: boolean = false) {
    try {
      const options: FindOneOptions<AttendancePermission> = {};

      if (relations) {
        options.relations = {
          employees: true,
        };
      }

      const attendancePermission = await findOneByTerm({
        repository: this.attendancePermissionRepository,
        term: id,
        options,
      });

      return attendancePermission;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async validateNotExistPermissionActive({
    employee_id,
    start_date,
    end_date,
  }: {
    employee_id: EmploymentRecordEntity;
    start_date: Date;
    end_date: Date;
  }) {
    try {
      const options: FindOneOptions<AttendancePermission> = {
        where: {
          employees: { id: employee_id.id },
          start_date: LessThanOrEqual(end_date),
          end_date: MoreThanOrEqual(start_date),
          status: Not(STATUS_VACATIONS_PERMISSION.REJECTED),
        },
      };

      const attendancePermission =
        await this.attendancePermissionRepository.find(options);

      if (attendancePermission.length > 0) {
        throw new ErrorManager({
          code: 'NOT_ACCEPTABLE',
          message: msgError(
            'MSG',
            'El empleado ya tiene un permiso de asistencia aprobado en esas fechas',
          ),
        });
      }
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async update(updateAttendancePermissionDto: UpdateAttendancePermissionDto) {
    try {
      const { id, permission_type, start_date, end_date, reason } =
        updateAttendancePermissionDto;

      const attendancePermission = await this.findOne(id);

      if (
        attendancePermission.status === STATUS_VACATIONS_PERMISSION.APPROVED
      ) {
        throw new ErrorManager({
          code: 'NOT_ACCEPTABLE',
          message: msgError(
            'MSG',
            'No se puede modificar un permiso que ya ha sido aprobado',
          ),
        });
      }

      Object.assign(attendancePermission, {
        permission_type,
        start_date,
        end_date,
        reason,
      });

      const result = await updateResult(
        this.attendancePermissionRepository,
        id,
        attendancePermission,
      );

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);

      const attendancePermission = await deleteResult(
        this.attendancePermissionRepository,
        id,
      );
      return attendancePermission;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }
}
