import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacationEntity } from 'cts-entities';

import { VacationController } from './vacation.controller';
import { VacationService } from './vacation.service';
import { EmployeeModule } from '../employee/employee.module';

const entities = TypeOrmModule.forFeature([VacationEntity]);

const services = [EmployeeModule];
@Module({
  imports: [entities, ...services],
  controllers: [VacationController],
  providers: [VacationService],
  exports: [],
})
export class VacationModule {}
