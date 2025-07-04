import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

import { ICreateTypeContract } from '../../common';

export class CreateTypeContractDto implements ICreateTypeContract {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  @Transform(({ obj }) => Boolean(obj?.isAutomatic === 'true'))
  isAutomatic: boolean;
}
