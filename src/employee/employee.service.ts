import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  Repository,
  UpdateResult,
} from 'typeorm';

import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';

import { EmployeeEntity } from './entities/employee.entity';
import { PositionService } from '../position/position.service';

import {
  createResult,
  deleteResult,
  ErrorManager,
  findOneByTerm,
  FindOneWhitTermAndRelationDto,
  IPaginationDto,
  PaginationFilterStatusDto,
  paginationResult,
  restoreResult,
  updateResult,
} from '../common';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepository: Repository<EmployeeEntity>,
    private readonly positionService: PositionService,
  ) {}

  public async createItem(payload: CreateEmployeeDto): Promise<EmployeeEntity> {
    try {
      const {
        names,
        first_last_name,
        second_last_name,
        date_birth,
        email,
        telephone,
        address,
        gender,
        curp,
        rfc,
        nss,
        ine_number,
        alergy,
        emergency_contact,
        nacionality,
        status,
        blood_type,
        status_civil,
        position_id,
      } = payload;

      const position = await this.positionService.findOne({
        term: position_id,
      });

      const employee = await createResult(
        this.employeeRepository,
        {
          names,
          first_last_name,
          second_last_name,
          date_birth,
          email,
          telephone,
          address,
          gender,
          curp,
          rfc,
          nss,
          ine_number,
          alergy,
          emergency_contact,
          nacionality,
          status,
          blood_type,
          status_civil,
          position_id: position,
        },
        EmployeeEntity,
      );

      return employee;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  public async getItems(
    pagination: PaginationFilterStatusDto<EmployeeEntity>,
  ): Promise<IPaginationDto<EmployeeEntity>> {
    try {
      const options: FindManyOptions<EmployeeEntity> = {};

      if (pagination.status) {
        options.where = { ...options.where, status: pagination.status };
      }

      if (pagination.relations) {
        options.relations = {
          position_id: true,
        };
      }

      const result = await paginationResult(this.employeeRepository, {
        ...pagination,
        options,
      });

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  public async getItem({
    term,
    relations = false,
  }: FindOneWhitTermAndRelationDto): Promise<EmployeeEntity> {
    try {
      const options: FindOneOptions<EmployeeEntity> = {};

      if (relations) {
        options.relations = {
          position_id: true,
        };
      }

      const result = await findOneByTerm({
        repository: this.employeeRepository,
        term,
        options,
      });

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  public async updateItem({
    id,
    ...payload
  }: UpdateEmployeeDto): Promise<UpdateResult> {
    try {
      const employee = await this.getItem({ term: id });

      Object.assign(employee, payload);

      const result = await updateResult(this.employeeRepository, id, employee);

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  public async deleteItem(id: number): Promise<UpdateResult> {
    try {
      const result = await deleteResult(this.employeeRepository, id);
      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  public async restoreItem(id: number): Promise<UpdateResult> {
    try {
      const result = await restoreResult(this.employeeRepository, id);
      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }
}
