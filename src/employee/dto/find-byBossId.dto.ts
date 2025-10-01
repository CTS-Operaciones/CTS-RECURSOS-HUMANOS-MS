import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class FindByBossIdDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  boss_id: number;
}