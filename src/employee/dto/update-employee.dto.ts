import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeDto } from './create-employee.dto';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  id: number;
}
