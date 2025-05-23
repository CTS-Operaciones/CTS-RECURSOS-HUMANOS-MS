import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { ICreatePosition } from '../../common';

export class CreatePositionDto implements ICreatePosition {
  @ApiProperty({ type: String, description: 'Name of the position' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ type: Number, description: 'Salary of the position' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(0)
  salary: number;

  @ApiProperty({
    type: String,
    description: 'Salary in words of the position',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  salary_in_words: string;

  @ApiProperty({
    type: Number,
    description: 'Department id of the position',
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @Min(1)
  department_id: number;
}
