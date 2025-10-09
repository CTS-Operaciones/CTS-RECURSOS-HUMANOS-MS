import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { STATUS_VACATIONS_PERMISSION, ToBoolean } from 'cts-entities';

import { ICreateVacation, PaginationRelationsDto } from '../../common';

export class CreateVacationDto implements ICreateVacation {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  employee: number;

  @IsNotEmpty()
  @IsDate()
  startDate: Date;

  @IsNotEmpty()
  @IsDate()
  endDate: Date;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  requested_day: number;

  @IsEnum(STATUS_VACATIONS_PERMISSION)
  @IsNotEmpty()
  status: STATUS_VACATIONS_PERMISSION = STATUS_VACATIONS_PERMISSION.PENDING;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  comment?: string;
}

export class FindHistoryByEmployeeDto extends PaginationRelationsDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  employee_id: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @ToBoolean('relations')
  relations?: boolean = false;
}