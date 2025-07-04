import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigDataSource } from 'cts-entities';

import { BankModule } from './bank/bank.module';
import { ContractModule } from './contract/contract.module';
import { EmployeeModule } from './employee/employee.module';
import { DepartmentModule } from './department/department.module';
import { DocumentModule } from './document/document.module';
import { PositionModule } from './position/position.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...ConfigDataSource }),
    BankModule,
    ContractModule,
    DepartmentModule,
    DocumentModule,
    EmployeeModule,
    PositionModule,
  ],
})
export class AppModule {}
