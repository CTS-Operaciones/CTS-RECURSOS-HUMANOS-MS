import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { IFindByIds } from '../interfaces';
import { Type } from 'class-transformer';
import { ToBoolean } from '../decorators';

export class FindByIdsDto implements IFindByIds {
  @IsArray({ each: true })
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  @ArrayNotEmpty()
  ids: number[];

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('deletes')
  deletes?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('relations')
  relations?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('allRelations')
  allRelations?: boolean = false;
}
