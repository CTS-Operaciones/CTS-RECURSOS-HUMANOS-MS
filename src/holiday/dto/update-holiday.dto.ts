import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

import { CreateHolidayDto } from './create-holiday.dto';

export class UpdateHolidayDto extends PartialType(CreateHolidayDto) {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  id: number;
}
