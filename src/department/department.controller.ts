import { Controller, Body, Param, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { DepartmentService } from './department.service';

import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';
import {
  FindOneWhitTermAndRelationDto,
  PaginationRelationsDto,
} from '../common';

@Controller({ path: 'department', version: '1' })
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @MessagePattern('create-department')
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @MessagePattern('find-all-department')
  findAll(@Payload() pagination: PaginationRelationsDto) {
    return this.departmentService.findAll(pagination);
  }

  @MessagePattern('find-one-department')
  findOne(@Payload() findOneRelationsDto: FindOneWhitTermAndRelationDto) {
    return this.departmentService.findOneByTerm(findOneRelationsDto);
  }

  @MessagePattern('update-department')
  update(@Payload() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentService.update(updateDepartmentDto);
  }

  @MessagePattern('remove-department')
  remove(@Payload() { id }: { id: number }) {
    return this.departmentService.remove(id);
  }

  @MessagePattern('restore-department')
  restore(@Payload() { id }: { id: number }) {
    return this.departmentService.restore(id);
  }
}
