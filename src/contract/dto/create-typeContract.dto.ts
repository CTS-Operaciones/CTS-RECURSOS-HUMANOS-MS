import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

import { ICreateTypeContract, ToBoolean } from '../../common';

export class CreateTypeContractDto implements ICreateTypeContract {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @ToBoolean('isAutomatic')
  isAutomatic: boolean;
}
