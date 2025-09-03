import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { STATUS_VACATIONS_PERMISSION } from 'cts-entities';

import { ICreateVacation } from '../../common';

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
