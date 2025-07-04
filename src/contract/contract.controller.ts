import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { ContractService } from './contract.service';
import { CreateTypeContractDto, UpdateTypeContractDto } from './dto';
import { FindOneDto, PaginationDto } from '../common';

@Controller({ path: 'typeContract', version: '1' })
export class ContractController {
  constructor(private readonly typeContractService: ContractService) {}

  @MessagePattern('createTypeContract')
  async create(@Payload() createTypeContractDto: CreateTypeContractDto) {
    return await this.typeContractService.create(createTypeContractDto);
  }

  @MessagePattern('findAllTypeContract')
  async findAll(@Payload() pagination: PaginationDto) {
    return await this.typeContractService.findAll(pagination);
  }

  @MessagePattern('findOneTypeContract')
  async findOne(@Payload() findOne: FindOneDto) {
    return await this.typeContractService.findOne(findOne);
  }

  @MessagePattern('updateTypeContract')
  async updated(@Payload() updateTypeContractDto: UpdateTypeContractDto) {
    return await this.typeContractService.updated(updateTypeContractDto);
  }
}
