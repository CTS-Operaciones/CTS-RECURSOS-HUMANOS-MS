import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeContractEntity } from 'cts-entities';

import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';

const entities = [TypeContractEntity];

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}
