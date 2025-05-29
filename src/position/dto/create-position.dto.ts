import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ICreatePosition, ISalary } from '../../common';

export class CreateSalaryDto implements ISalary {
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  salary_in_words: string;
}

export class CreatePositionDto implements ICreatePosition {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ValidateNested()
  @Type(() => CreateSalaryDto)
  @IsNotEmpty()
  salary: CreateSalaryDto;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @Min(1)
  department_id: number;
}
