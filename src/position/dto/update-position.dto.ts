import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

import { CreatePositionDto } from './create-position.dto';

export class UpdatePositionDto extends PartialType(CreatePositionDto) {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  id: number;
}
