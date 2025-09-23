import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendancePermission } from 'cts-entities';

import { AttendancePermissionService } from './attendance-permission.service';
import { AttendancePermissionController } from './attendance-permission.controller';
import { EmployeeModule } from '../employee/employee.module';

const entities = TypeOrmModule.forFeature([AttendancePermission]);

const services = [EmployeeModule];

@Module({
  imports: [entities, ...services],
  controllers: [AttendancePermissionController],
  providers: [AttendancePermissionService],
})
export class AttendancePermissionModule {}
