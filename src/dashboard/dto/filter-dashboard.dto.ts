import { Transform, Type } from "class-transformer";
import { IsBoolean, IsDate, IsEnum, IsInt, IsOptional } from "class-validator";

import { parseLocalDate } from "../../common";

export enum GroupByPeriod {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR'
}

export class FilterDashboardDto { 
  @IsDate()
  @IsOptional()
  @Transform(parseLocalDate)
  startDate?: Date;

  @IsDate()
  @IsOptional()
  @Transform(parseLocalDate)
  endDate?: Date;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isDismissal?: boolean;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  headquarterId?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  projectId?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  positionId?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  departmentId?: number;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  includeEmployeesList?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  hasBonds?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  hasActiveBonds?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  hasExpiredBonds?: boolean;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  bondTypeId?: number;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  showPendingVacations?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  showPendingPermissions?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  includeChartData?: boolean;

  @IsEnum(GroupByPeriod)
  @IsOptional()
  groupBy?: GroupByPeriod = GroupByPeriod.MONTH;
}