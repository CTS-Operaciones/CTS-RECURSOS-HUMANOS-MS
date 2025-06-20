import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeEntity, EmployeeHasPositions } from 'cts-entities';

import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { PositionModule } from '../position/position.module';
import { BankModule } from '../bank/bank.module';

const entities = [EmployeeEntity, EmployeeHasPositions];

const servicesImport = [PositionModule, BankModule];

@Module({
  imports: [TypeOrmModule.forFeature(entities), ...servicesImport],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
