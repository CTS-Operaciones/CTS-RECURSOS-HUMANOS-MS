import {
  ArrayNotEmpty,
  IsArray,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProductionOrderItemDto {
  @IsNumber()
  @Min(1)
  positionId: number;

  @IsNumber()
  @Min(1)
  processOrder: number;
}

export class UpdateProductionOrderDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProductionOrderItemDto)
  positions: ProductionOrderItemDto[];
}

