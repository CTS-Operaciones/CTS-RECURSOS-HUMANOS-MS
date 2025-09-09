import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { BondsService } from './bonds.service';
import { TypesBondService } from './type.bond.service';
import { DescriptionBondService } from './description.bond.service';

import {
  CreateBondDto,
  CreateDescriptionBondDto,
  CreateTypeBondDto,
  UpdateBondDto,
  UpdateDescriptionBondDto,
  UpdateTypeBondDto,
} from './dto';
import { PaginationDto, PaginationRelationsDto } from '../common';

@Controller({ path: 'bond', version: '1' })
export class BondsController {
  constructor(
    private readonly bondsService: BondsService,
    private readonly typesBondService: TypesBondService,
    private readonly descriptionBondService: DescriptionBondService,
  ) {}

  // Types Bond
  @MessagePattern('bond.type.create')
  createType(@Payload() createTypeBondDto: CreateTypeBondDto) {
    return this.typesBondService.create(createTypeBondDto);
  }

  @MessagePattern('bond.type.findAll')
  findAllTypes(@Payload() pagination: PaginationDto) {
    return this.typesBondService.findAll(pagination);
  }

  @MessagePattern('bond.type.findOne')
  findOneType(@Payload() { id }: { id: number }) {
    return this.typesBondService.findOne(id);
  }

  @MessagePattern('bond.type.update')
  updateType(@Payload() updateTypeBondDto: UpdateTypeBondDto) {
    return this.typesBondService.update(
      updateTypeBondDto.id,
      updateTypeBondDto,
    );
  }

  @MessagePattern('bond.type.remove')
  removeType(@Payload() { id }: { id: number }) {
    return this.typesBondService.remove(id);
  }

  @MessagePattern('bond.type.restore')
  restoreType(@Payload() { id }: { id: number }) {
    return this.typesBondService.restore(id);
  }

  // Description Bond

  @MessagePattern('bond.description.create')
  createDescription(
    @Payload() createDescriptionBondDto: CreateDescriptionBondDto,
  ) {
    return this.descriptionBondService.create(createDescriptionBondDto);
  }

  @MessagePattern('bond.description.findAll')
  findAllDescriptions(@Payload() pagination: PaginationDto) {
    return this.descriptionBondService.findAll(pagination);
  }

  @MessagePattern('bond.description.findOne')
  findOneDescription(@Payload() { id }: { id: number }) {
    return this.descriptionBondService.findOne(id);
  }

  @MessagePattern('bond.description.update')
  updateDescription(
    @Payload() updateDescriptionBondDto: UpdateDescriptionBondDto,
  ) {
    return this.descriptionBondService.update(
      updateDescriptionBondDto.id,
      updateDescriptionBondDto,
    );
  }

  @MessagePattern('bond.description.remove')
  removeDescription(@Payload() { id }: { id: number }) {
    return this.descriptionBondService.remove(id);
  }

  @MessagePattern('bond.description.restore')
  restoreDescription(@Payload() { id }: { id: number }) {
    return this.descriptionBondService.restore(id);
  }

  // Bond
  @MessagePattern('bond.create')
  create(@Payload() createBondDto: CreateBondDto) {
    return this.bondsService.create(createBondDto);
  }

  @MessagePattern('bond.findAll')
  findAll(@Payload() pagination: PaginationRelationsDto) {
    return this.bondsService.findAll(pagination);
  }

  @MessagePattern('bond.findOne')
  findOne(@Payload() { id }: { id: number }) {
    return this.bondsService.findOne(id);
  }

  @MessagePattern('bond.update')
  update(@Payload() updateBondDto: UpdateBondDto) {
    return this.bondsService.update(updateBondDto.id, updateBondDto);
  }

  @MessagePattern('bond.remove')
  remove(@Payload() { id }: { id: number }) {
    return this.bondsService.remove(id);
  }

  @MessagePattern('bond.restore')
  restore(@Payload() { id }: { id: number }) {
    return this.bondsService.restore(id);
  }
}
