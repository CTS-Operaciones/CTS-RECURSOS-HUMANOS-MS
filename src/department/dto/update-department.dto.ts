import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

import { CreateDepartmentDto } from './create-department.dto';

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  id: number;
}
