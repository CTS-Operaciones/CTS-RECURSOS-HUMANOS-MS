import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { IBondCreate, IDescriptionBond, ITypesBond } from '../../common';

export class CreateBondDto implements IBondCreate {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Min(1)
  employee_id: number;

  @IsNotEmpty()
  @IsDate()
  date_assigned: Date;

  @IsNotEmpty()
  @IsDate()
  date_limit: Date;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @IsPositive()
  @Min(0)
  amount: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Min(1)
  description_id: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Min(1)
  type_id: number;
}

export class CreateTypeBondDto implements ITypesBond {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type: string;
}

export class CreateDescriptionBondDto implements IDescriptionBond {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  description: string;
}
