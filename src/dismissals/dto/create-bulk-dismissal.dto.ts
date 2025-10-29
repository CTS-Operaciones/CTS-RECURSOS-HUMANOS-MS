import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateBulkDismissalDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  employees: number[];

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsDate()
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsOptional()
  comment?: string;
}

