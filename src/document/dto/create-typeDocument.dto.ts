import { IsNotEmpty, IsString } from 'class-validator';
import { ITypeDocument } from '../../common';

export class CreateTypeDocumentDto implements ITypeDocument {
  @IsString()
  @IsNotEmpty()
  type: string;
}
