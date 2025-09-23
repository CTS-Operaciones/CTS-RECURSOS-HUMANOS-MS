import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { AttendancePermissionService } from './attendance-permission.service';
import {
  CreateAttendancePermissionDto,
  SetStatusOfPermissionDto,
  UpdateAttendancePermissionDto,
} from './dto';
import { PaginationRelationsDto } from 'src/common';

@Controller()
export class AttendancePermissionController {
  constructor(
    private readonly attendancePermissionService: AttendancePermissionService,
  ) {}

  @MessagePattern('attendancePermission.create')
  create(
    @Payload() createAttendancePermissionDto: CreateAttendancePermissionDto,
  ) {
    return this.attendancePermissionService.create(
      createAttendancePermissionDto,
    );
  }

  @MessagePattern('attendancePermission.setStatusOfPermission')
  setStatusOfPermission(payload: SetStatusOfPermissionDto) {
    return this.attendancePermissionService.setStatusOfPermission(payload);
  }

  @MessagePattern('attendancePermission.findAll')
  findAll(@Payload() pagination: PaginationRelationsDto) {
    return this.attendancePermissionService.findAll(pagination);
  }

  @MessagePattern('attendancePermission.findOne')
  findOne(@Payload() id: number) {
    return this.attendancePermissionService.findOne(id);
  }

  @MessagePattern('attendancePermission.update')
  update(
    @Payload() updateAttendancePermissionDto: UpdateAttendancePermissionDto,
  ) {
    return this.attendancePermissionService.update(
      updateAttendancePermissionDto,
    );
  }

  @MessagePattern('attendancePermission.remove')
  remove(@Payload() id: number) {
    return this.attendancePermissionService.remove(id);
  }
}
