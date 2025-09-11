import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendancePermission } from 'cts-entities';

import { AttendancePermissionService } from './attendance-permission.service';
import { AttendancePermissionController } from './attendance-permission.controller';

const entities = TypeOrmModule.forFeature([AttendancePermission]);

@Module({
  imports: [entities],
  controllers: [AttendancePermissionController],
  providers: [AttendancePermissionService],
})
export class AttendancePermissionModule {}
