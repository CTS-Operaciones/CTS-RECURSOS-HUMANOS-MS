import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindManyOptions,
  FindOneOptions,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { EmployeeEntity, EmployeeHasPositions } from 'cts-entities';

import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';

import { PositionService } from '../position/position.service';
import { BankService } from '../bank/bank.service';

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
  runInTransaction,
  updateResult,
} from '../common';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepository: Repository<EmployeeEntity>,
    @InjectRepository(EmployeeHasPositions)
    private readonly employeeHasPostion: Repository<EmployeeHasPositions>,
    private readonly positionService: PositionService,
    private readonly bankService: BankService,
    private readonly dataSource: DataSource,
  ) {}

  public async createItem(payload: CreateEmployeeDto): Promise<EmployeeEntity> {
    try {
      const {
        date_register,
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
        bank_id,
        number_account_bank,
      } = payload;
      return await runInTransaction(this.dataSource, async (queryRunner) => {
        const position = await this.positionService.findOne({
          term: position_id,
        });

        const bank = bank_id && (await this.bankService.findOne(bank_id));

        const employee = await createResult(
          this.employeeRepository,
          {
            date_register,
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
            number_account_bank: bank ? number_account_bank : undefined,
            bank: bank ? bank : undefined,
          },
          EmployeeEntity,
          queryRunner,
        );

        const { id, position_id: positionSave } = await createResult(
          this.employeeHasPostion,
          {
            employee_id: employee,
            position_id: position,
          },
          EmployeeHasPositions,
          queryRunner,
        );

        return {
          ...employee,
          position: { id, name: positionSave.name },
        };
      });
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
          employeeHasPosition: {
            position_id: true,
          },
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
    deletes = false,
  }: FindOneWhitTermAndRelationDto): Promise<EmployeeEntity> {
    try {
      const options: FindOneOptions<EmployeeEntity> = {};

      if (relations) {
        options.relations = {
          bank: true,
          employeeHasPosition: {
            position_id: true,
          },
        };
      }

      if (deletes) {
        options.withDeleted = true;
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
    const { position_id, ...payloadUpdate } = payload;
    const { bank_id, ...data } = payloadUpdate;
    try {
      return await runInTransaction(this.dataSource, async (queryRunner) => {
        const {
          bank,
          employeeHasPosition: _employeeHasPosition,
          ...employee
        } = await this.getItem({
          term: id,
          relations: true,
        });

        if (position_id) {
          await this.updatePosition({
            queryRunner,
            id,
            position_id,
            employee: employee as EmployeeEntity,
          });
        }

        if (bank_id) {
          const newBank = await this.bankService.findOne(bank_id);

          if (bank && bank.id !== bank_id) {
            Object.assign(bank, newBank);
          }
        }

        Object.assign(employee, {
          ...data,
          bank,
        });

        const result = await updateResult(
          this.employeeRepository,
          id,
          employee,
        );

        return result;
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  private async updatePosition({
    queryRunner,
    id,
    position_id,
    employee,
  }: {
    queryRunner: QueryRunner;
    id: number;
    position_id: number;
    employee: EmployeeEntity;
  }) {
    try {
      const employeeHasPosition = await this.employeeHasPostion.find({
        where: { employee_id: { id } },
        withDeleted: true,
        relations: { position_id: true },
      });

      const position = employeeHasPosition.find(
        (item) => item.position_id.id === position_id,
      );

      if (position) {
        await restoreResult(this.employeeHasPostion, position.id);

        this.deletePositionsOld(employeeHasPosition, position_id);
      } else {
        const newPosition = await this.positionService.findOne({
          term: position_id,
        });

        await createResult(
          this.employeeHasPostion,
          {
            employee_id: employee,
            position_id: newPosition,
          },
          EmployeeHasPositions,
          queryRunner,
        );

        this.deletePositionsOld(employeeHasPosition, position_id);
      }
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  private deletePositionsOld(
    employeeHasPosition: EmployeeHasPositions[],
    id: number,
  ) {
    employeeHasPosition.forEach(async (item) => {
      if (item.deleted_at || item.position_id.id === id) {
        return;
      }
      await deleteResult(this.employeeHasPostion, item.id);
    });
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
