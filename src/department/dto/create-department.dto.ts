import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { IDepartment } from '../../../common/interfaces';

export class CreateDepartmentDto implements IDepartment {
  @ApiProperty({
    type: String,
    description: 'Name of the department',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    type: String,
    description: 'Abreviation of the department',
    minLength: 1,
    maxLength: 10,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(10)
  abreviation?: string;
}
