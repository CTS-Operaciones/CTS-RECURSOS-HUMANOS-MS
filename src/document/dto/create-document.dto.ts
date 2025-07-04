import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';
import { ICreateDocument, IFileSend } from '../../common';

export class CreateDocumentDto implements ICreateDocument {
  @IsString()
  //@IsUrl()
  @IsNotEmpty()
  url_file: string;

  @IsNumber()
  @IsOptional()
  size?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  type: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  employee: number;
}

export class FileSendDto implements IFileSend {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  type: number;

  @IsString()
  @IsNotEmpty()
  file: string;
}