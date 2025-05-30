import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { CreateTypeDocumentDto } from './create-typeDocument.dto';

export class UpdateTypeDocumentDto extends PartialType(CreateTypeDocumentDto) {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  id: number;
}
