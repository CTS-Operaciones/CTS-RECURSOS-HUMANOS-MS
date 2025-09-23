import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmploymentRecordEntity } from 'cts-entities';

import { DismissalsService } from './dismissals.service';
import { DismissalsController } from './dismissals.controller';
import { EmployeeModule } from '../employee/employee.module';

const entities = TypeOrmModule.forFeature([EmploymentRecordEntity]);

const services = [EmployeeModule];
@Module({
  imports: [entities, ...services],
  controllers: [DismissalsController],
  providers: [DismissalsService],
})
export class DismissalsModule {}
