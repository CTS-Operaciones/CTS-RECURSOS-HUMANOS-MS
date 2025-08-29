import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  DeepPartial,
  FindOneOptions,
  Repository,
  UpdateResult,
} from 'typeorm';
import {
  EmployeeEntity,
  EmployeeHasPositions,
  EmailEntity,
  STATUS_EMPLOYEE,
  PositionEntity,
  StaffEntity,
  BondHasStaff,
} from 'cts-entities';

import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';

import { PositionService } from '../position/position.service';
import { BankService } from '../bank/bank.service';

import {
  col,
  createResult,
  deleteResult,
  ErrorManager,
  FilterRelationsDto,
  findOneByTerm,
  FindOneWhitTermAndRelationDto,
  IPaginationResult,
  msgError,
  restoreResult,
  runInTransaction,
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
    pagination: FilterRelationsDto<EmployeeEntity>,
  ): Promise<IPaginationResult<EmployeeEntity>> {
    try {
      const {
        status = STATUS_EMPLOYEE.ACTIVE,
        bank,
        contract,
        documents,
        position,
        staff,
        bonds,
        account,
        //bond,
        nacionality,
        gener,
        blood,
        statusCivil,
        dismissal,
        presence,
        vacation,
        relations = false,
        all = false,
        limit = 10,
        page = 1,
      } = pagination;

      const skip = page > 0 ? (page - 1) * limit : 0;

      const employeeAlias = 'employee',
        employeeHasPositionAlias = 'ehp',
        positionAlias = 'position',
        documentsAlias = 'documents',
        salaryAlias = 'salary',
        deparmentAlias = 'department',
        typeContractAlias = 'typeContract',
        bankAlias = 'bank',
        emailAlias = 'email',
        staffAlias = 'staff',
        bondsHasStaffAlias = 'bondsHasStaff',
        bondAlias = 'bond',
        dismissalAlias = 'dismissal';

      const employeesQuery =
        this.employeeRepository.createQueryBuilder(employeeAlias);

      if (relations || position || staff || bonds) {
        employeesQuery.leftJoinAndSelect(
          `${col<EmployeeEntity>(employeeAlias, 'employeeHasPosition')}`,
          employeeHasPositionAlias,
        );

        if (relations || account) {
          employeesQuery.leftJoinAndSelect(
            `${col<EmployeeEntity>(employeeAlias, 'email_cts')}`,
            emailAlias,
          );
        }

        if (relations || position)
          employeesQuery
            .leftJoinAndSelect(
              `${col<EmployeeHasPositions>(employeeHasPositionAlias, 'position_id')}`,
              positionAlias,
            )
            .leftJoinAndSelect(
              `${col<PositionEntity>(positionAlias, 'salary')}`,
              salaryAlias,
            )
            .leftJoinAndSelect(
              `${col<PositionEntity>(positionAlias, 'department')}`,
              deparmentAlias,
            );

        if (relations || staff || bonds || dismissal || presence || vacation) {
          employeesQuery.leftJoinAndSelect(
            `${col<EmployeeHasPositions>(employeeHasPositionAlias, 'staff')}`,
            staffAlias,
          );

          if (relations || bonds) {
            employeesQuery
              .leftJoinAndSelect(
                `${col<StaffEntity>(staffAlias, 'bondHasStaff')}`,
                bondsHasStaffAlias,
              )
              .leftJoinAndSelect(
                `${col<BondHasStaff>(bondsHasStaffAlias, 'bond')}`,
                bondAlias,
              );
          }

          if (relations || dismissal) {
            employeesQuery.leftJoinAndSelect(
              `${col<StaffEntity>(staffAlias, 'dismissals')}`,
              dismissalAlias,
            );
          }
        }
      }

      if (relations || documents) {
        employeesQuery.leftJoinAndSelect(
          `${col<EmployeeEntity>(employeeAlias, 'document')}`,
          documentsAlias,
        );
      }

      if (relations || bank) {
        employeesQuery.leftJoinAndSelect(
          `${col<EmployeeEntity>(employeeAlias, 'bank')}`,
          bankAlias,
        );
      }

      if (relations || contract) {
        employeesQuery.leftJoinAndSelect(
          `${col<EmployeeEntity>(employeeAlias, 'typeContract')}`,
          typeContractAlias,
        );
      }

      if (status) {
        employeesQuery.where(
          `${col<EmployeeEntity>(employeeAlias, 'status')} = :status`,
          {
            status,
          },
        );
      }

      if (nacionality) {
        employeesQuery.andWhere(
          `${col<EmployeeEntity>(employeeAlias, 'nacionality')} = :nacionality`,
          {
            nacionality,
          },
        );
      }

      if (gener) {
        employeesQuery.andWhere(
          `${col<EmployeeEntity>(employeeAlias, 'gender')} = :gener`,
          {
            gener,
          },
        );
      }

      if (blood) {
        employeesQuery.andWhere(
          `${col<EmployeeEntity>(employeeAlias, 'blood_type')} = :blood`,
          {
            blood,
          },
        );
      }

      if (statusCivil) {
        employeesQuery.andWhere(
          `${col<EmployeeEntity>(employeeAlias, 'status_civil')} = :statusCivil`,
          {
            statusCivil,
          },
        );
      }

      if (!all) {
        employeesQuery.limit(limit).offset(skip);
      }

      const [result, totalResult] = await employeesQuery.getManyAndCount();

      const totalPages = all ? 1 : Math.ceil(totalResult / limit);

      return {
        page: Number(all ? 1 : page),
        limit: Number(all ? totalResult : limit),
        totalResult,
        totalPages,
        data: result,
      };
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
        const { bank, employeeHasPosition, email_cts, ...employee } =
          await this.getItem({
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
          if (account.email && account.email !== email_cts?.email) {
            email_cts.email = account.email;

            // TODO: Notificar a Soporte del Cambio en el Email
          }
        }

        // TODO: #6 Validar que se pueda eliminar la cuenta al desactivar

        Object.assign(employee, {
          ...data,
          bank,
        });

        const result = await createResult(
          this.employeeRepository,
          {
            email_cts,
            ...employee,
          },
          EmployeeEntity,
          queryRunner,
        );

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
      const employee = await this.getItem({
        term: id,
        allRelations: true,
      });

      if (
        employee.employeeHasPosition.some((ehp) =>
          ehp.staff.some((s) => s.available === true),
        )
      ) {
        throw new ErrorManager({
          code: 'NOT_ACCEPTABLE',
          message: msgError('REGISTER_NOT_DELETE_ALLOWED', id),
        });
      }

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
