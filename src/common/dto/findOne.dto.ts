import { OmitType } from '@nestjs/mapped-types';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

import { IFindOne } from '../interfaces';
import { ToBoolean } from '../decorators';

export class FindOneWhitTermAndRelationDto implements IFindOne {
  @IsString()
  @IsNotEmpty()
  term: string | number;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('relations')
  relations?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('deletes')
  deletes?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('allRelations')
  allRelations?: boolean = false;
}

export class FindOneDeleteRelationsDto extends OmitType(
  FindOneWhitTermAndRelationDto,
  ['term'] as const,
) {
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('relations')
  relations?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('deletes')
  deletes?: boolean = false;
}

export class FindOneDto extends OmitType(FindOneWhitTermAndRelationDto, [
  'relations',
  'deletes',
] as const) {
  @IsString()
  @IsNotEmpty()
  term: string | number;
}

export class FindOneRelationsDto extends OmitType(
  FindOneWhitTermAndRelationDto,
  ['term', 'deletes'] as const,
) {
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('relations')
  relations?: boolean = false;
}

export class FindOneDeleteDto extends OmitType(FindOneWhitTermAndRelationDto, [
  'term',
  'relations',
] as const) {
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('deletes')
  deletes?: boolean = false;
}
