import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigDataSource } from 'cts-entities';

import { EmployeeModule } from './employee/employee.module';
import { PositionModule } from './position/position.module';
import { DepartmentModule } from './department/department.module';
import { DocumentModule } from './document/document.module';
import { BankModule } from './bank/bank.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...ConfigDataSource }),
    EmployeeModule,
    PositionModule,
    DepartmentModule,
    DocumentModule,
    BankModule,
  ],
})
export class AppModule {}
