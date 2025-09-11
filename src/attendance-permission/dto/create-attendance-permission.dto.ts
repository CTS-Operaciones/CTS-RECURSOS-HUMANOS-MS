import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import {
  ATTENDANCE_PERMISSION_TYPE,
  STATUS_VACATIONS_PERMISSION,
} from 'cts-entities';

import { ICreateAttendancePermission } from '../../common';

export class CreateAttendancePermissionDto
  implements ICreateAttendancePermission
{
  @IsEnum(ATTENDANCE_PERMISSION_TYPE)
  @IsNotEmpty()
  permission_type: ATTENDANCE_PERMISSION_TYPE;

  @IsNotEmpty()
  @IsDate()
  start_date: Date;

  @IsNotEmpty()
  @IsDate()
  end_date: Date;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsEnum(STATUS_VACATIONS_PERMISSION)
  @IsOptional()
  status: STATUS_VACATIONS_PERMISSION = STATUS_VACATIONS_PERMISSION.PENDING;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  requested_at: number;
}
