import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  Repository,
  UpdateResult,
} from 'typeorm';
import {
  EmployeeEntity,
  EmployeeHasPositions,
  EmailEntity,
} from 'cts-entities';

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
import { EmployeeHasPositionService } from './employeeHasPosition.service';
import { ContractService } from '../contract/contract.service';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepository: Repository<EmployeeEntity>,
    private readonly positionService: PositionService,
    private readonly employeeHasPostionService: EmployeeHasPositionService,
    private readonly bankService: BankService,
    private readonly typeContractService: ContractService,
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
        year_old,
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
        typeContract,
        account,
      } = payload;

      return await runInTransaction(this.dataSource, async (queryRunner) => {
        const position = await this.positionService.findManyByIds({
          ids: position_id,
        });

        const bank = bank_id && (await this.bankService.findOne(bank_id));

        const _typeContract = await this.typeContractService.findOne({
          term: typeContract,
        });

        let _email: DeepPartial<EmailEntity> | undefined = undefined;

        if (account.email) {
          _email = {
            email: account.email,
            required_access: account.register,
          };
        }

        const employee = await createResult(
          this.employeeRepository,
          {
            date_register,
            names,
            first_last_name,
            second_last_name,
            date_birth,
            year_old,
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
            typeContract: _typeContract,
            email_cts: _email && _email,
          },
          EmployeeEntity,
          queryRunner,
        );

        const employeeHasPosition = await this.employeeHasPostionService.create(
          employee,
          position,
          queryRunner,
        );

        return {
          ...employee,
          position: employeeHasPosition.map((item) => item.id),
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
      const { relations, status, ..._pagination } = pagination;
      const options: FindManyOptions<EmployeeEntity> = {};

      if (status) {
        options.where = { ...options.where, status: pagination.status };
      }

      if (relations) {
        options.relations = {
          employeeHasPosition: {
            position_id: true,
            staff: { headquarter: true },
          },
          bank: true,
          email_cts: true,
        };
      }

      const result = await paginationResult(this.employeeRepository, {
        ..._pagination,
        options,
      });

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  public async getItem({
    term,
    relations,
    deletes,
    allRelations,
  }: FindOneWhitTermAndRelationDto): Promise<EmployeeEntity> {
    try {
      const options: FindOneOptions<EmployeeEntity> = {};

      if (relations || allRelations) {
        options.relations = {
          bank: true,
          employeeHasPosition: {
            position_id: true,
          },
          typeContract: true,
          email_cts: true,
        };
      }

      if (allRelations) {
        options.relations = {
          ...options.relations,
          employeeHasPosition: {
            position_id: true,
            staff: { bondHasStaff: true, headquarter: true },
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

  public async updateItem({ id, ...payload }: UpdateEmployeeDto) {
    const { position_id, bank_id, typeContract, account, ...data } = payload;
    try {
      return await runInTransaction(this.dataSource, async (queryRunner) => {
        const { bank, employeeHasPosition, ...employee } = await this.getItem({
          term: id,
          relations: true,
        });

        if (position_id) {
          await this.employeeHasPostionService.updatePosition({
            queryRunner,
            position_id,
            employee: employee as EmployeeEntity,
            positionService: this.positionService,
          });
        }

        if (bank_id) {
          const newBank = await this.bankService.findOne(bank_id);

          if (bank && bank.id !== bank_id) {
            Object.assign(bank, newBank);
          }
        }

        if (typeContract) {
          const newTypeContract = await this.typeContractService.findOne({
            term: typeContract,
          });

          if (typeContract && employee.typeContract.id !== typeContract) {
            Object.assign(employee.typeContract, newTypeContract);
          }
        }

        if (account && account.email) {
          if (account.email && account.email !== employee.email_cts?.email) {
            Object.assign(employee.email_cts.email, account.email);
          }
        }

        // TODO: #6 Validar que se pueda eliminar la cuenta al desactivar

        Object.assign(employee, {
          ...data,
          bank,
        });

        const result = await updateResult(
          this.employeeRepository,
          id,
          employee,
        );

        // TODO: Notificar a Soporte del Cambio en el Email

        return result;
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  public async findPositionsById({
    term,
    deletes,
    relations,
  }: FindOneWhitTermAndRelationDto) {
    try {
      const options: FindOneOptions<EmployeeHasPositions> = {};

      if (relations) {
        options.relations = {
          employee_id: true,
          position_id: true,
        };
      }

      const employeeHasPostion = await findOneByTerm({
        repository: this.employeeRepository,
        term,
        options: {},
      });

      return employeeHasPostion;
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
