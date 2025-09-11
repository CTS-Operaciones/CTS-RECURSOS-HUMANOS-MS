import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

import { CreateAttendancePermissionDto } from './create-attendance-permission.dto';

export class UpdateAttendancePermissionDto extends PartialType(
  CreateAttendancePermissionDto,
) {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  id: number;
}
