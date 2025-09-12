import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

import { IPaginateFilter, IPagination } from '../interfaces';
import { ToBoolean } from '../decorators';
import {
  BLOOD_TYPE,
  GENDER,
  NACIONALITY_EMPLOYEE,
  STATUS_CIVIL,
  STATUS_EMPLOYEE,
} from 'cts-entities';

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
  @ToBoolean('all')
  all?: boolean = false;
}

export class PaginationRelationsDto extends PaginationDto {
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('relations')
  relations?: boolean;
}

export class RelationsDto {
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('relations')
  relations?: boolean = false;
}

export class PaginationFilterStatusEmployeeDto<T>
  extends PaginationRelationsDto
  implements IPaginateFilter<T>
{
  @IsEnum([...Object.values(STATUS_EMPLOYEE)])
  @IsOptional()
  status?: T extends { status: infer U } ? U : never;
}

export class FilterEnumsDto<T> extends PaginationFilterStatusEmployeeDto<T> {
  @IsEnum([...Object.values(NACIONALITY_EMPLOYEE)])
  @IsOptional()
  nacionality?: T extends { nacionality: infer U } ? U : never;

  @IsEnum([...Object.values(BLOOD_TYPE)])
  @IsOptional()
  blood?: T extends { blood: infer U } ? U : never;

  @IsEnum([...Object.values(GENDER)])
  @IsOptional()
  gener?: T extends { blood: infer U } ? U : never;

  @IsEnum([...Object.values(STATUS_CIVIL)])
  @IsOptional()
  statusCivil?: T extends { blood: infer U } ? U : never;
}

export class FilterRelationsDto<T> extends FilterEnumsDto<T> {
  @IsString()
  @IsOptional()
  name: string | undefined = undefined;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('staff')
  staff?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('position')
  position?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('contract')
  contract?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('account')
  account?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('bank')
  bank?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('documents')
  documents?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('dismissal')
  dismissal?: boolean = false;

  // @IsNumber()
  // @IsPositive()
  // @IsOptional()
  // bond?: number = 0;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('bonds')
  bonds?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('presence')
  presence?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('vacation')
  vacation?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('permission')
  permission: boolean = false;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  department_id?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  position_id?: number;

  @IsDate()
  @IsOptional()
  birthdayStart?: Date;

  @IsDate()
  @IsOptional()
  birthdayEnd?: Date;

  @IsDate()
  @IsOptional()
  registerStart?: Date;

  @IsDate()
  @IsOptional()
  registerEnd?: Date;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  project_id?: number;
}
