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
import {
  ATTENDANCE_PERMISSION_TYPE,
  STATUS_VACATIONS_PERMISSION,
} from 'cts-entities';

import { ICreateAttendancePermission, ToBoolean } from '../../common';

export class CreateAttendancePermissionDto implements ICreateAttendancePermission {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  employee_id: number;

  @IsEnum(ATTENDANCE_PERMISSION_TYPE)
  @IsNotEmpty()
  permission_type: ATTENDANCE_PERMISSION_TYPE;

  @IsNotEmpty()
  @IsDate()
  start_date: Date;

  @IsNotEmpty()
  @IsDate()
  end_date: Date;

  @IsOptional()
  @IsString()
  time_start?: string = '00:00:00';

  @IsOptional()
  @IsString()
  time_end?: string = '00:00:00';

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('required_justified')
  required_justified: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('required_presences')
  required_presences: boolean = false;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsNotEmpty()
  @IsNumber()
  requested_at: number = 0;
}

export class SetStatusOfPermissionDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  id: number;

  @IsEnum(STATUS_VACATIONS_PERMISSION)
  @IsNotEmpty()
  status: STATUS_VACATIONS_PERMISSION;

  @IsString()
  @IsNotEmpty()
  approved_by: string;

  @IsString()
  @IsNotEmpty()
  approved_at: string;
}

export class AddJustificationDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  id: number;

  @IsBoolean()
  @IsNotEmpty()
  @Type(() => Boolean)
  @ToBoolean('justification')
  justification: boolean;
}
