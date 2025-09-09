import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { IDismissalCreate } from '../../common';

export class CreateDismissalDto implements IDismissalCreate {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  employee: number;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsDate()
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsOptional()
  comment?: string;
}
