import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

import { CreateTypeContractDto } from './create-typeContract.dto';

export class UpdateTypeContractDto extends PartialType(CreateTypeContractDto) {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  id: number;
}
