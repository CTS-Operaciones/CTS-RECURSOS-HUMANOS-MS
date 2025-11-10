import { IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ToBoolean } from 'cts-entities';

import { PaginationRelationsDto } from '../../common';

export class FilterPositionDto extends PaginationRelationsDto {
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('isExternal')
  isExternal?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('forProductionReport')
  forProductionReport?: boolean = false;
}
