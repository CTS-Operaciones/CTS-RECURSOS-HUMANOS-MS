import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { BondEntity, BondHasEmployee } from 'cts-entities';

import { CreateBondDto, UpdateBondDto } from './dto';

import {
  createResult,
  deleteResult,
  findOneByTerm,
  paginationResult,
  restoreResult,
  updateResult,
  ErrorManager,
  PaginationRelationsDto,
} from '../common';
import { TypesBondService } from './type.bond.service';
import { DescriptionBondService } from './description.bond.service';
import { EmployeeService } from '../employee/employee.service';

@Injectable()
export class BondsService {
  constructor(
    @InjectRepository(BondHasEmployee)
    private readonly bondHasEmployeeRepository: Repository<BondHasEmployee>,
    @InjectRepository(BondEntity)
    private readonly bondRepository: Repository<BondEntity>,
    private readonly typesBondService: TypesBondService,
    private readonly descriptionBondService: DescriptionBondService,
    private readonly employeeService: EmployeeService,
  ) {}
  async create(createBondDto: CreateBondDto) {
    try {
      const {
        amount,
        description_id,
        type_id,
        date_assigned,
        date_limit,
        employee_id,
      } = createBondDto;

      const description_bonds =
        await this.descriptionBondService.findOne(description_id);

      const type_bonds = await this.typesBondService.findOne(type_id);

      const employee = await this.employeeService.getItem({
        term: employee_id,
      });

      const result = await createResult(
        this.bondHasEmployeeRepository,
        {
          employee,
          date_assigned,
          date_limit,
          bond: {
            amount,
            description_id: description_bonds,
            type_id: type_bonds,
          },
        },
        BondHasEmployee,
      );

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findAll(pagination: PaginationRelationsDto) {
    try {
      const { relations, ..._pagination } = pagination;
      const options: FindManyOptions<BondEntity> = {};

      if (relations) {
        options.relations = {
          description_id: true,
          type_id: true,
          bondHasEmployee: {
            employee: true,
          },
        };
      }

      const result = await paginationResult(this.bondRepository, {
        ..._pagination,
        options,
      });

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findOne(id: number) {
    try {
      const options: FindOneOptions<BondEntity> = {
        relations: {
          description_id: true,
          type_id: true,
          bondHasEmployee: {
            employee: true,
          },
        },
      };

      const result = await findOneByTerm({
        repository: this.bondRepository,
        term: id,
        options,
      });

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async update(id: number, updateBondDto: UpdateBondDto) {
    try {
      const { amount, description_id, type_id } = updateBondDto;

      const bond = await this.findOne(id);

      if (description_id && bond.description_id.id !== description_id) {
        bond.description_id =
          await this.descriptionBondService.findOne(description_id);
      }

      if (type_id && bond.type_id.id !== type_id) {
        bond.type_id = await this.typesBondService.findOne(type_id);
      }

      const result = await updateResult(this.bondRepository, id, {
        ...bond,
        amount,
      });

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async remove(id: number) {
    try {
      const bond = await this.findOne(id);
      const result = await deleteResult(this.bondRepository, id);

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async restore(id: number) {
    try {
      const result = await restoreResult(this.bondRepository, id);

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }
}
