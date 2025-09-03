import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

import { CreateVacationDto } from './create-vacation.dto';

export class UpdateVacationDto extends PartialType(CreateVacationDto) {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  id: number;
}
