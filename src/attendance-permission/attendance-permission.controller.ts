import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { AttendancePermissionService } from './attendance-permission.service';
import {
  AddJustificationDto,
  CreateAttendancePermissionDto,
  FilterDateDto,
  FindHistoryByEmployeeDto,
  SetStatusOfPermissionDto,
  UpdateAttendancePermissionDto,
} from './dto';
import { RelationsDto } from '../common';

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

  @MessagePattern('attendancePermission.addJustificationPresence')
  addJustificationPresence(@Payload() payload: AddJustificationDto) {
    return this.attendancePermissionService.addJustificationPresence(payload);
  }

  @MessagePattern('attendancePermission.findAll')
  findAll(@Payload() pagination: FilterDateDto) {
    return this.attendancePermissionService.findAll(pagination);
  }

  @MessagePattern('attendancePermission.findHistoryByEmployee')
  findHistoryByEmployee(@Payload() payload: FindHistoryByEmployeeDto) {
    return this.attendancePermissionService.findHistoryByEmployee(payload);
  }

  @MessagePattern('attendancePermission.findOne')
  findOne(
    @Payload() { id, relations }: { id: number; relations: RelationsDto },
  ) {
    return this.attendancePermissionService.findOne(id, relations.relations);
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
