import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmployeeEntity } from 'cts-entities';

import { EmployeeService } from './employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';

import {
  FindOneWhitTermAndRelationDto,
  PaginationFilterStatusDto,
} from '../common';
import { EmployeeHasPositionService } from './employeeHasPosition.service';

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
  getItem(
    @Payload()
    { term, relations, allRelations, deletes }: FindOneWhitTermAndRelationDto,
  ) {
    return this.employeeService.getItem({
      term,
      relations,
      allRelations,
      deletes,
    });
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

@Controller({ path: 'asignedPositions', version: '1' })
export class AsignedPositionsController {
  constructor(
    private readonly employeeHasPostionService: EmployeeHasPositionService,
  ) {}

  // FIXME: #5 Validar Tipado del payload
  @MessagePattern('asignedPositionsFindByEmployeeId')
  findPositionsById(
    @Payload()
    { term, relations, allRelations, deletes }: FindOneWhitTermAndRelationDto,
  ) {
    console.log({ term, relations, allRelations, deletes });
    return this.employeeHasPostionService.findOneByEmployeeId({
      term,
      relations,
      allRelations,
      deletes,
    });
  }

  @MessagePattern('verifyEmployeeHasPosition')
  verifyEmployeeHasPosition(@Payload() { id }: { id: number }) {
    return this.employeeHasPostionService.verifyEmployeeHasPosition(id);
  }

  @MessagePattern('deleteEmployeeHasPosition')
  deleteEmployeeHasPosition(@Payload() { id }: { id: number }) {
    return this.employeeHasPostionService.deletePositions(id);
  }
}
