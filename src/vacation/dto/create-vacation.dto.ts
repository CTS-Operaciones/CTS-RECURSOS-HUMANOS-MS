import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { STATUS_VACATIONS_PERMISSION, ToBoolean } from 'cts-entities';

import {
  ICreateVacation,
  IDatesRange,
  PaginationRelationsDto,
} from '../../common';

export class DatesRangeDto implements IDatesRange {
  @IsNotEmpty()
  @IsDate()
  start: Date;

  @IsNotEmpty()
  @IsDate()
  end: Date;
}

export class CreateVacationDto implements ICreateVacation {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  employee: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DatesRangeDto)
  dateRange: DatesRangeDto[];

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
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

export class SetStatusOfVacationDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  id: number;

  @IsEnum(STATUS_VACATIONS_PERMISSION)
  @IsNotEmpty()
  status: STATUS_VACATIONS_PERMISSION;
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