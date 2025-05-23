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
import { ApiTags } from '@nestjs/swagger';

import { DepartmentService } from './department.service';

import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';
import {
  FindOneRelationsDto,
  FindOneWhitTermAndRelationDto,
  PaginationDto,
} from '../common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@ApiTags('Departments')
@Controller({ path: 'department', version: '1' })
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @MessagePattern('create-department')
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @MessagePattern('find-all-department')
  findAll(@Payload() pagination: PaginationDto) {
    return this.departmentService.findAll(pagination);
  }

  @MessagePattern('find-one-department')
  findOne(@Payload() findOneRelationsDto: FindOneWhitTermAndRelationDto) {
    return this.departmentService.findOne(findOneRelationsDto);
  }

  @MessagePattern('update-department')
  update(@Payload() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentService.update(updateDepartmentDto);
  }

  @MessagePattern('remove-department')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.remove(id);
  }

  @MessagePattern('restore-department')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.restore(id);
  }
}
