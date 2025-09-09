import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BondEntity,
  BondHasStaff,
  DescriptionBondEntity,
  TypesBondEntity,
} from 'cts-entities';

import { BondsService } from './bonds.service';
import { DescriptionBondService } from './description.bond.service';
import { TypesBondService } from './type.bond.service';
import { BondsController } from './bonds.controller';
import { EmployeeModule } from '../employee/employee.module';

const entities = TypeOrmModule.forFeature([
  BondEntity,
  TypesBondEntity,
  DescriptionBondEntity,
  BondHasStaff,
]);

const services = [EmployeeModule];
@Module({
  imports: [entities, ...services],
  controllers: [BondsController],
  providers: [BondsService, TypesBondService, DescriptionBondService],
})
export class BondsModule {}
