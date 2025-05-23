import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigDataSource } from './common';
import { EmployeeModule } from './employee/employee.module';
import { PositionModule } from './position/position.module';
import { DepartmentModule } from './department/department.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...ConfigDataSource }),
    EmployeeModule,
    PositionModule,
    DepartmentModule,
  ],
})
export class AppModule {}
