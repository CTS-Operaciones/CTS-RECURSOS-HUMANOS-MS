import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  EmployeeEntity,
  EmployeeHasPositions,
  EmploymentRecordEntity,
} from 'cts-entities';

import { EmployeeService } from './employee.service';
import { EmployeeHasPositionService } from './employeeHasPosition.service';
import {
  AsignedPositionsController,
  EmployeeController,
} from './employee.controller';
import { PositionModule } from '../position/position.module';
import { BankModule } from '../bank/bank.module';

import { NatsModule } from '../common';
import { ContractModule } from '../contract/contract.module';

const entities = [EmployeeEntity, EmploymentRecordEntity, EmployeeHasPositions];

const servicesImport = [NatsModule, PositionModule, BankModule, ContractModule];

@Module({
  imports: [TypeOrmModule.forFeature(entities), ...servicesImport],
  controllers: [AsignedPositionsController, EmployeeController],
  providers: [EmployeeService, EmployeeHasPositionService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
