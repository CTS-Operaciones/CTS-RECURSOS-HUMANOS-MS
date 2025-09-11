import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { AttendancePermission } from 'cts-entities';

import {
  CreateAttendancePermissionDto,
  UpdateAttendancePermissionDto,
} from './dto';
import {
  createResult,
  deleteResult,
  ErrorManager,
  findOneByTerm,
  msgError,
  PaginationRelationsDto,
  paginationResult,
  updateResult,
} from '../common';

@Injectable()
export class AttendancePermissionService {
  constructor(
    @InjectRepository(AttendancePermission)
    private readonly attendancePermissionRepository: Repository<AttendancePermission>,
  ) {}

  async create(createAttendancePermissionDto: CreateAttendancePermissionDto) {
    try {
      const { permission_type, start_date, end_date, reason, status } =
        createAttendancePermissionDto;

      if (end_date < start_date) {
        throw new ErrorManager({
          code: 'NOT_ACCEPTABLE',
          message: msgError(
            'MSG',
            'La fecha de fin debe ser mayor a la de inicio',
          ),
        });
      }

      const attendancePermission = await createResult(
        this.attendancePermissionRepository,
        {
          permission_type,
          start_date,
          end_date,
          reason,
          status,
        },
        AttendancePermission,
      );

      return attendancePermission;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findAll(pagination: PaginationRelationsDto) {
    try {
      const { relations, ..._pagination } = pagination;
      const options: FindManyOptions<AttendancePermission> = {};

      if (relations) {
        options.relations = {
          employee_id: true,
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
          employee_id: true,
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

  async update(updateAttendancePermissionDto: UpdateAttendancePermissionDto) {
    try {
      const { id, permission_type, start_date, end_date, reason, status } =
        updateAttendancePermissionDto;

      const attendancePermission = await this.findOne(id);

      Object.assign(attendancePermission, {
        permission_type,
        start_date,
        end_date,
        reason,
        status,
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
