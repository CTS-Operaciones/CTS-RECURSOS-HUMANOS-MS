import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { CreateEmployeeDto, EmploymentRecordDto } from './create-employee.dto';

export class UpdateEmployeeDto extends PartialType(
  OmitType(CreateEmployeeDto, ['contract'] as const),
) {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  id: number;
}

export class UpdateEmployeeContractDto extends PartialType(
  EmploymentRecordDto,
) {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  id: number;
}
