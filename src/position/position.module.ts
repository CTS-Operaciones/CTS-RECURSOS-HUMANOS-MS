import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PositionService } from './position.service';
import { PositionController } from './position.controller';
import { PositionEntity } from './entities/position.entity';

import { DepartmentModule } from '../department/department.module';
import { SalaryEntity } from './entities/salary.entity';

const entities = [PositionEntity, SalaryEntity];

const servicesImport = [DepartmentModule];

@Module({
  imports: [TypeOrmModule.forFeature(entities), ...servicesImport],
  controllers: [PositionController],
  providers: [PositionService],
  exports: [PositionService],
})
export class PositionModule {}
