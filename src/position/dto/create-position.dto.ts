import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ToBoolean } from 'cts-entities';

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
  @IsOptional()
  department_id?: number = undefined;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  parent?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @ToBoolean('required_boss')
  required_boss?: boolean = false;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @ToBoolean('isExternal')
  isExternal?: boolean = false;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @ToBoolean('forProductionReport')
  forProductionReport?: boolean = undefined;

  @IsOptional()
  @IsNumber()
  processOrder?: number | null = null;
}
