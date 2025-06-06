import { Controller, ParseIntPipe } from '@nestjs/common';

import { EmployeeService } from './employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';

import {
  FindOneWhitTermAndRelationDto,
  PaginationFilterStatusDto,
} from '../common';
import { EmployeeEntity } from './entities/employee.entity';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller({ path: 'employee', version: '1' })
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @MessagePattern('create-employee')
  create(@Payload() payload: CreateEmployeeDto) {
    return this.employeeService.createItem(payload);
  }

  @MessagePattern('findAll-employees')
  getItems(@Payload() pagination: PaginationFilterStatusDto<EmployeeEntity>) {
    return this.employeeService.getItems(pagination);
  }

  @MessagePattern('find-one-employee')
  getItem(@Payload() { term, relations }: FindOneWhitTermAndRelationDto) {
    return this.employeeService.getItem({ term, relations });
  }

  @MessagePattern('update-employee')
  updateItem(@Payload() payload: UpdateEmployeeDto) {
    return this.employeeService.updateItem(payload);
  }

  @MessagePattern('remove-employee')
  deleteItem(@Payload() { id }: { id: number }) {
    return this.employeeService.deleteItem(id);
  }

  @MessagePattern('restore-employee')
  restoreItem(@Payload() { id }: { id: number }) {
    return this.employeeService.restoreItem(id);
  }
}
