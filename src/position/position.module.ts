import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PositionEntity, SalaryEntity } from 'cts-entities';

import { PositionService } from './position.service';
import { PositionController } from './position.controller';

import { DepartmentModule } from '../department/department.module';

const entities = [PositionEntity, SalaryEntity];

const servicesImport = [DepartmentModule];

@Module({
  imports: [TypeOrmModule.forFeature(entities), ...servicesImport],
  controllers: [PositionController],
  providers: [PositionService],
  exports: [PositionService],
})
export class PositionModule {}
