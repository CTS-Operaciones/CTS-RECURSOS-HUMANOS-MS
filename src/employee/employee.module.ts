import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeEntity, EmployeeHasPositions } from 'cts-entities';

import { EmployeeService } from './employee.service';
import { EmployeeHasPositionService } from './employeeHasPosition.service';
import {
  AsignedPositionsController,
  EmployeeController,
} from './employee.controller';
import { PositionModule } from '../position/position.module';
import { BankModule } from '../bank/bank.module';

const entities = [EmployeeEntity, EmployeeHasPositions];

const servicesImport = [PositionModule, BankModule];

@Module({
  imports: [TypeOrmModule.forFeature(entities), ...servicesImport],
  controllers: [AsignedPositionsController, EmployeeController],
  providers: [EmployeeService, EmployeeHasPositionService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
