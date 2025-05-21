import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PositionService } from './position.service';
import { CreatePositionDto, UpdatePositionDto } from './dto';
import { PaginationDto, FindOneRelationsDto } from '../../common/dto';

@ApiTags('Position')
@Controller({ path: 'position', version: '1' })
export class PositionController {
  constructor(private readonly positionsService: PositionService) {}

  @Post()
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionsService.create(createPositionDto);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.positionsService.findAll(pagination);
  }

  @Get(':term')
  findOne(
    @Param('term') id: string,
    @Query() { relations }: FindOneRelationsDto,
  ) {
    return this.positionsService.findOne({ id, relations });
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePositionDto: UpdatePositionDto,
  ) {
    return this.positionsService.update(id, updatePositionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.positionsService.remove(id);
  }

  @Delete('restore/:id')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.positionsService.restore(id);
  }
}
