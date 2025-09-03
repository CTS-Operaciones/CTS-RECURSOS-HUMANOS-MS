import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IHolidays } from 'cts-entities';

export class CreateHolidayDto implements IHolidays {
  @IsDate()
  @IsNotEmpty()
  holiday_date: Date;

  @IsOptional()
  @IsString()
  description?: string | undefined = '';
}
