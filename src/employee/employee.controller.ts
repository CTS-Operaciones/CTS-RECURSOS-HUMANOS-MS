import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmployeeEntity } from 'cts-entities';
import { plainToClass } from 'class-transformer';

import { EmployeeService } from './employee.service';
import {
  AddEmploymentRecordDto,
  BulkUpdateEmployeeHasPositionsDto,
  CreateEmployeeDto,
  CreateEmployeeHasPositionDto,
  CreateEmployeeOnlyDto,
  FindByBossIdDto,
  UpdateEmployeeContractDto,
  UpdateEmployeeDto,
  UpdateEmployeeHasPositionsDto,
} from './dto';

import { FilterRelationsDto, FindOneWhitTermAndRelationDto } from '../common';
import { EmployeeHasPositionService } from './employeeHasPosition.service';

@Controller({ path: 'employee', version: '1' })
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @MessagePattern('create-employee')
  create(@Payload() payload: CreateEmployeeDto) {
    return this.employeeService.createItem(payload);
  }

  @MessagePattern('employee.create-only-employee')
  createEmployee(@Payload() payload: CreateEmployeeOnlyDto) {
    return this.employeeService.create(payload);
  }

  @MessagePattern('employee.create-employee-contract')
  addContract(@Payload() payload: AddEmploymentRecordDto) {
    return this.employeeService.addContract(payload);
  }

  @MessagePattern('findAll-employees')
  getItems(@Payload() pagination: FilterRelationsDto<EmployeeEntity>) {
    return this.employeeService.getItems(pagination);
  }

  @MessagePattern('findByBossId-employees')
  getItemsByBossId(@Payload() { boss_id }: FindByBossIdDto) {
    return this.employeeService.getItemsByBossId(boss_id);
  }

  @MessagePattern('find-one-employee')
  getItem(
    @Payload()
    payload: object,
  ) {
    const dto = plainToClass(FindOneWhitTermAndRelationDto, payload);

    return this.employeeService.getItem(dto);
  }

  @MessagePattern('update-employee')
  updateItem(@Payload() payload: UpdateEmployeeDto) {
    return this.employeeService.updateItem(payload);
  }

  @MessagePattern('update-employee-contract')
  updateEmployeeContract(@Payload() payload: UpdateEmployeeContractDto) {
    return this.employeeService.updateEmployeeContract(payload);
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

  @MessagePattern('create-asignedPositions')
  createEmployeeHasPosition(@Payload() payload: CreateEmployeeHasPositionDto) {
    return this.employeeHasPostionService.create(payload);
  }

  @MessagePattern('update-asignedPositions')
  updateEmployeeHasPosition(
    @Payload()
    payload: UpdateEmployeeHasPositionsDto,
  ) {
    return this.employeeHasPostionService.updateEmployeeHasPositions(payload);
  }

  @MessagePattern('bulk-update-asignedPositions')
  bulkUpdateEmployeeHasPosition(
    @Payload()
    payload: BulkUpdateEmployeeHasPositionsDto,
  ) {
    return this.employeeHasPostionService.bulkUpdateEmployeeHasPositions(payload);
  }

  @MessagePattern('findByEmployeeId-asignedPositions')
  findPositionsById(
    @Payload()
    { term, relations, allRelations, deletes }: FindOneWhitTermAndRelationDto,
  ) {
    return this.employeeHasPostionService.findOneByEmployeeId({
      term,
      relations,
      allRelations,
      deletes,
    });
  }

  @MessagePattern('verifyEmployeeHasPosition-asignedPositions')
  verifyEmployeeHasPosition(
    @Payload() { id, relations = false }: { id: number; relations: boolean },
  ) {
    return this.employeeHasPostionService.verifyEmployeeHasPosition(
      id,
      relations,
    );
  }

  @MessagePattern('deleteEmployeeHasPosition-asignedPositions')
  deleteEmployeeHasPosition(@Payload() { id }: { id: number }) {
    return this.employeeHasPostionService.deletePositions(id);
  }
}
