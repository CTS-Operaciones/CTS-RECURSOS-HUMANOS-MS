import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

import { IFindOne } from '../interfaces';
import { OmitType } from '@nestjs/mapped-types';

export class FindOneWhitTermAndRelationDto implements IFindOne {
  @IsString()
  @IsNotEmpty()
  term: string | number;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  relations?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  deletes?: boolean;
}

export class FindOneDto extends OmitType(FindOneWhitTermAndRelationDto, [
  'relations',
] as const) {
  @IsString()
  @IsNotEmpty()
  term: string | number;
}

export class FindOneRelationsDto extends OmitType(
  FindOneWhitTermAndRelationDto,
  ['term'] as const,
) {
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  relations?: boolean;
}

export class FindOneDeleteDto extends OmitType(FindOneWhitTermAndRelationDto, [
  'term',
] as const) {
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  deletes?: boolean;
}
