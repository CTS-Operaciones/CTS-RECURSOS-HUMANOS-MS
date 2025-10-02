import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmploymentRecordEntity } from "cts-entities";

import { BankModule } from "../bank/bank.module";
import { ContractModule } from "../contract/contract.module";
import { PositionModule } from "../position/position.module";

import { NatsModule } from "../common";

const entities = [EmploymentRecordEntity];

const servicesImport = [NatsModule, PositionModule, BankModule, ContractModule];

@Module({
  imports: [...servicesImport, TypeOrmModule.forFeature(entities)],
  controllers: [],
  providers: [],
  exports: [],
})
export class EmploymentRecordModule { }