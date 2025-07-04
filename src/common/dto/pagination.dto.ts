import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

import { IPaginateFilter, IPagination } from '../interfaces';
import { STATUS, STATUS_EMPLOYEE } from '../constants';

export class PaginationDto implements IPagination {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ obj }) => Boolean(obj?.all === 'true'))
  all?: boolean = false;
}

export class PaginationRelationsDto extends PaginationDto {
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ obj }) => Boolean(obj?.relations === 'true'))
  relations?: boolean;
}

export class PaginationFilterStatusDto<T>
  extends PaginationRelationsDto
  implements IPaginateFilter<T>
{
  @IsEnum([...Object.values(STATUS), ...Object.values(STATUS_EMPLOYEE)])
  @IsOptional()
  status?: T extends { status: infer U } ? U : never;
}
