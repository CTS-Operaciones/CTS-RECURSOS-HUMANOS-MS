import { PartialType } from '@nestjs/mapped-types';
import {
  CreateBondDto,
  CreateTypeBondDto,
  CreateDescriptionBondDto,
} from './create-bond.dto';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class UpdateBondDto extends PartialType(CreateBondDto) {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  id: number;
}

export class UpdateTypeBondDto extends PartialType(CreateTypeBondDto) {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  id: number;
}

export class UpdateDescriptionBondDto extends PartialType(
  CreateDescriptionBondDto,
) {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  id: number;
}
