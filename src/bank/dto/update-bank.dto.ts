import { PartialType } from '@nestjs/mapped-types';
import { CreateBankDto } from './create-bank.dto';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class UpdateBankDto extends PartialType(CreateBankDto) {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  id: number;
}
