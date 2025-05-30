import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { IDepartment } from '../../common';

export class CreateDepartmentDto implements IDepartment {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(10)
  abreviation?: string;
}
