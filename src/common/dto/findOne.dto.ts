import { OmitType } from '@nestjs/mapped-types';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

import { IFindOne } from '../interfaces';

export class FindOneWhitTermAndRelationDto implements IFindOne {
  @IsString()
  @IsNotEmpty()
  term: string | number;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ obj }) => Boolean(obj?.relations === 'true'))
  relations?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ obj }) => Boolean(obj?.deletes === 'true'))
  deletes?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ obj }) => Boolean(obj?.allRelations === 'true'))
  allRelations?: boolean;
}

export class FindOneDeleteRelationsDto extends OmitType(
  FindOneWhitTermAndRelationDto,
  ['term'] as const,
) {
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ obj }) => Boolean(obj?.relations === 'true'))
  relations?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ obj }) => Boolean(obj?.deletes === 'true'))
  deletes?: boolean;
}

export class FindOneDto extends OmitType(FindOneWhitTermAndRelationDto, [
  'relations',
  'deletes',
] as const) {
  @IsString()
  @IsNotEmpty()
  term: string | number;
}

export class FindOneRelationsDto extends OmitType(FindOneWhitTermAndRelationDto, [
  'term',
  'deletes',
] as const) {
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ obj }) => Boolean(obj?.relations === 'true'))
  relations?: boolean;
}

export class FindOneDeleteDto extends OmitType(FindOneWhitTermAndRelationDto, [
  'term',
  'relations',
] as const) {
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ obj }) => Boolean(obj?.deletes === 'true'))
  deletes?: boolean;
}
