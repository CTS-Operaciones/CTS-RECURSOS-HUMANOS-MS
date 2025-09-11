import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigDataSource } from 'cts-entities';

import { BankModule } from './bank/bank.module';
import { ContractModule } from './contract/contract.module';
import { EmployeeModule } from './employee/employee.module';
import { DepartmentModule } from './department/department.module';
import { DocumentModule } from './document/document.module';
import { PositionModule } from './position/position.module';
import { HolidayModule } from './holiday/holiday.module';
import { VacationModule } from './vacation/vacation.module';
<<<<<<< HEAD
import { AttendancePermissionModule } from './attendance-permission/attendance-permission.module';
=======
import { DismissalsModule } from './dismissals/dismissals.module';
import { BondsModule } from './bonds/bonds.module';
>>>>>>> 138053fa8ba73633ad55fd7f44b7c6befb7ff733

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...ConfigDataSource }),
    BankModule,
    BondsModule,
    ContractModule,
    DepartmentModule,
    DismissalsModule,
    DocumentModule,
    EmployeeModule,
    PositionModule,
    HolidayModule,
    VacationModule,
    AttendancePermissionModule,
  ],
})
export class AppModule {}
