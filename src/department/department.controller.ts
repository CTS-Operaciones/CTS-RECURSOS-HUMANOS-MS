import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';

import { DepartmentService } from './department.service';

import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';
import { PaginationDto } from 'src/common';

@Controller({ path: 'department', version: '1' })
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.departmentService.findAll(pagination);
  }

  @Get(':term')
  findOne(
    @Param('term') term: string,
    @Query()
    { relations }: FindOneRelationsDto,
  ) {
    return this.departmentService.findOne({ term, relations });
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.remove(id);
  }

  @Delete('restore/:id')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.restore(id);
  }
}
