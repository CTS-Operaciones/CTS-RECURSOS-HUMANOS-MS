import { OmitType, PartialType } from '@nestjs/mapped-types';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsPositive, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreateEmployeeDto,
  EmployeeHasPositionDto,
  EmploymentRecordDto,
} from './create-employee.dto';

export class UpdateEmployeeDto extends PartialType(
  OmitType(CreateEmployeeDto, ['contract', 'status'] as const),
) {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  id: number;
}

export class UpdateEmployeeContractDto extends PartialType(
  OmitType(EmploymentRecordDto, ['employee_has_position'] as const),
) {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  id: number;
}

export class UpdateEmployeeHasPositionsDto extends EmployeeHasPositionDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  id: number;
}

export class BulkUpdateEmployeeHasPositionsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpdateEmployeeHasPositionsDto)
  positions: UpdateEmployeeHasPositionsDto[];
}