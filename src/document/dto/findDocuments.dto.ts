import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { PaginationRelationsDto } from '../../common';

export class FindDocumentsDto extends PaginationRelationsDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  employee_id: number;
}
