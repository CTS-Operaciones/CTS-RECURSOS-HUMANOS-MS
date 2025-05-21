import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { DepartmentEntity } from './entities/department.entity';

const entities = [DepartmentEntity];

const servicesImport = [];

@Module({
  imports: [TypeOrmModule.forFeature(entities), ...servicesImport],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
