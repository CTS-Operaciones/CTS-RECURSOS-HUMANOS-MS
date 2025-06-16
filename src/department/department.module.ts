import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentEntity } from 'cts-entities';

import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';

const entities = [DepartmentEntity];

const servicesImport = [];

@Module({
  imports: [TypeOrmModule.forFeature(entities), ...servicesImport],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
