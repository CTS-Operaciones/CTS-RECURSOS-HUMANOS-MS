import {
  Controller,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { PositionService } from './position.service';
import { CreatePositionDto, UpdatePositionDto } from './dto';
import {
  FindOneWhitTermAndRelationDto,
  PaginationRelationsDto,
} from '../common';

@ApiTags('Positions')
@Controller({ path: 'position', version: '1' })
export class PositionController {
  constructor(private readonly positionsService: PositionService) {}

  @MessagePattern('create-position')
  create(@Payload() createPositionDto: CreatePositionDto) {
    return this.positionsService.create(createPositionDto);
  }

  @MessagePattern('find-all-positions')
  findAll(@Payload() pagination: PaginationRelationsDto) {
    return this.positionsService.findAll(pagination);
  }

  @MessagePattern('find-one-position')
  findOne(@Payload() findOneRelationsDto: FindOneWhitTermAndRelationDto) {
    return this.positionsService.findOne(findOneRelationsDto);
  }

  @MessagePattern('update-position')
  update(@Payload() updatePositionDto: UpdatePositionDto) {
    return this.positionsService.update(updatePositionDto);
  }

  @MessagePattern('remove-position')
  remove(@Payload('id', ParseIntPipe) id: number) {
    return this.positionsService.remove(id);
  }

  @MessagePattern('restore-position')
  restore(@Payload('id', ParseIntPipe) id: number) {
    return this.positionsService.restore(id);
  }
}
