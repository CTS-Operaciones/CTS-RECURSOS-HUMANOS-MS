import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IFindOne } from '../interfaces';

export class FindOneDto implements Partial<Omit<IFindOne, 'relations'>> {
  @ApiProperty({ type: String || Number, required: true })
  @IsString()
  @IsNotEmpty()
  term: string | number;
}

export class FindOneRelationsDto implements Partial<Omit<IFindOne, 'term'>> {
  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  relations?: boolean;
}

export class FindOneWhitTermAndRelationDto implements IFindOne {
  @ApiProperty({ type: String || Number, required: true })
  @IsString()
  @IsNotEmpty()
  term: string | number;

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  relations?: boolean;
}
