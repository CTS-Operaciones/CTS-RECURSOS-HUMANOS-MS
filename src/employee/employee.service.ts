import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  DeepPartial,
  FindOneOptions,
  IsNull,
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
  BondHasEmployee,
  Headquarters,
  Project,
  EmploymentRecordEntity,
  RespondeFindOneForClient,
  findMaxAndRegistered,
  BankEntity,
  AttendancePermission,
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
  NATS_SERVICE,
  HEADQUARTER_FIND_ONE,
  restoreResult,
  runInTransaction,
  sendAndHandleRpcExceptionPromise,
  STAFF_FIND_ONE,
} from '../common';
import { EmployeeHasPositionService } from './employeeHasPosition.service';
import { ContractService } from '../contract/contract.service';
import { ClientProxy } from '@nestjs/microservices';

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
    @Inject(NATS_SERVICE) private readonly clientProxy: ClientProxy,
  ) {}

  public async createItem(payload: CreateEmployeeDto): Promise<EmployeeEntity> {
    try {
      const {
        names,
        first_last_name,
        second_last_name,
        date_birth,
        year_old,
        curp,
        rfc,
        nss,
        ine_number,
        alergy,
        nacionality,
        status,
        blood_type,
        gender,
        contract,
      } = payload;

      const {
        date_register,
        telephone,
        address,
        email,
        emergency_contact,
        status_civil,
        bank_id,
        number_account_bank,
        typeContract,
        account,
        employee_has_position = [],
      } = contract;

      if (!employee_has_position.length) {
        throw new ErrorManager({
          code: 'BAD_REQUEST',
          message: msgError('NO_VALUE', 'employee_has_position'),
        });
      }

      let employeeHasPositionArray: EmployeeHasPositions[] = [];

      for (const item of employee_has_position) {
        const { headquarter_id, position_id, parent_id = null } = item;
        // Buscar position
        const positionEntity = await this.positionService.findOne({
          term: position_id,
        });

        // Buscar la sede
        const headquarterEntity: Headquarters =
          await sendAndHandleRpcExceptionPromise(
            this.clientProxy,
            HEADQUARTER_FIND_ONE,
            {
              id: headquarter_id,
              relations: true,
            },
          );

        // Validar el parent
        const { boss_staff_id, required_boss } = await findMaxAndRegistered({
          dataSource: this.dataSource,
          position_id,
          headquarter_id,
        });

        // Validar que si la posicion requiere un jefe y parent existe
        if (required_boss && !parent_id) {
          throw new ErrorManager({
            code: 'BAD_GATEWAY',
            message: msgError('PARENT_REQUIRED'),
          });
        }

        let parentStaff: StaffEntity | undefined = undefined;

        if (required_boss && parent_id && boss_staff_id.includes(parent_id)) {
          parentStaff = await sendAndHandleRpcExceptionPromise(
            this.clientProxy,
            STAFF_FIND_ONE,
            { id: parent_id },
          );
        } else if (
          (!required_boss && parent_id) ||
          (required_boss && !parent_id) ||
          (required_boss && parent_id && !boss_staff_id.includes(parent_id))
        ) {
          throw new ErrorManager({
            message: msgError('PARENT_NOT_VALID', boss_staff_id),
            code: 'NOT_FOUND',
          });
        }

        const staffEntity: StaffEntity = {} as StaffEntity;

        staffEntity.headquarter = headquarterEntity;
        if (parentStaff) {
          staffEntity.parent = parentStaff;
        }

        // Crear la entidad EmployeeHasPositions
        const employeeHasPosition: EmployeeHasPositions =
          {} as EmployeeHasPositions;
        employeeHasPosition.position_id = positionEntity;
        employeeHasPosition.staff = [staffEntity];

        employeeHasPositionArray.push(employeeHasPosition);
      }

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

      return await runInTransaction(this.dataSource, async (queryRunner) => {
        const employee = await createResult(
          this.employeeRepository,
          {
            names,
            first_last_name,
            second_last_name,
            date_birth,
            year_old,
            gender,
            curp,
            rfc,
            nss,
            ine_number,
            alergy,
            nacionality,
            status,
            blood_type,
            email_cts: _email && _email,
            employmentRecord: [
              {
                email,
                address,
                emergency_contact,
                date_register,
                telephone,
                bank: bank as BankEntity,
                number_account_bank: number_account_bank,
                status_civil,
                typeContract: _typeContract,
                employeeHasPosition: employeeHasPositionArray,
              },
            ],
          },
          EmployeeEntity,
          queryRunner,
        );

        return employee;
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
        name = undefined,
        status = STATUS_EMPLOYEE.ACTIVE,
        bank,
        contract,
        documents,
        position,
        staff,
        bonds,
        account,
        nacionality,
        gener,
        blood,
        statusCivil,
        presence,
        permission,
        vacation,
        department_id = undefined,
        position_id = undefined,
        birthdayStart = undefined,
        birthdayEnd = undefined,
        registerStart = undefined,
        registerEnd = undefined,
        project_id = undefined,
        relations = false,
        all = false,
        limit = 10,
        page = 1,
      } = pagination;

      const skip = page > 0 ? (page - 1) * limit : 0;

      const employeeAlias = 'employee',
        employmentRecordAlias = 'employmentRecord',
        employeeHasPositionAlias = 'ehp',
        positionAlias = 'position',
        documentsAlias = 'documents',
        salaryAlias = 'salary',
        deparmentAlias = 'department',
        typeContractAlias = 'typeContract',
        bankAlias = 'bank',
        emailAlias = 'email',
        staffAlias = 'staff',
        headquartersAlias = 'headquarter',
        projectAlias = 'project',
        bondsHasStaffAlias = 'bondsHasStaff',
        bondAlias = 'bond',
        vacationAlias = 'vacation',
        attendancePermissionsAlias = 'attendancePermissionsAlias',
        permissionAlias = 'permission';

      const employeesQuery =
        this.employeeRepository.createQueryBuilder(employeeAlias);

      const joinAll = relations === true;

      const joins = [
        {
          flag: joinAll || position || staff || bonds,
          path: col<EmployeeEntity>(employeeAlias, 'employmentRecord'),
          alias: employmentRecordAlias,
        },
        {
          flag:
            joinAll ||
            contract ||
            bonds ||
            bank ||
            permission ||
            presence ||
            vacation ||
            position ||
            staff,
          path: col<EmploymentRecordEntity>(
            employmentRecordAlias,
            'employeeHasPosition',
          ),
          alias: employeeHasPositionAlias,
        },
        {
          flag: joinAll || bonds,
          path: col<EmploymentRecordEntity>(
            employmentRecordAlias,
            'bondHasEmployee',
          ),
          alias: bondsHasStaffAlias,
        },
        {
          flag: joinAll || bonds,
          path: col<BondHasEmployee>(bondsHasStaffAlias, 'bond'),
          alias: bondAlias,
        },
        {
          flag: joinAll || contract,
          path: col<EmploymentRecordEntity>(
            employmentRecordAlias,
            'typeContract',
          ),
          alias: typeContractAlias,
        },
        {
          flag: joinAll || bank,
          path: col<EmploymentRecordEntity>(employmentRecordAlias, 'bank'),
          alias: bankAlias,
        },
        {
          flag: joinAll || permission,
          path: col<EmploymentRecordEntity>(
            employmentRecordAlias,
            'attendancePermissions',
          ),
          alias: attendancePermissionsAlias,
        },
        {
          flag: joinAll || account,
          path: col<EmployeeEntity>(employeeAlias, 'email_cts'),
          alias: emailAlias,
        },
        {
          flag: joinAll || position,
          path: col<EmployeeHasPositions>(
            employeeHasPositionAlias,
            'position_id',
          ),
          alias: positionAlias,
        },
        {
          flag: joinAll || position,
          path: col<PositionEntity>(positionAlias, 'salary'),
          alias: salaryAlias,
        },
        {
          flag: joinAll || position,
          path: col<PositionEntity>(positionAlias, 'department'),
          alias: deparmentAlias,
        },

        {
          flag: joinAll || vacation,
          path: col<EmploymentRecordEntity>(employmentRecordAlias, 'vacations'),
          alias: vacationAlias,
        },
        {
          flag: joinAll || staff || project_id || presence,
          path: col<EmployeeHasPositions>(employeeHasPositionAlias, 'staff'),
          alias: staffAlias,
        },
        {
          flag: joinAll || project_id,
          path: col<StaffEntity>(staffAlias, 'headquarter'),
          alias: headquartersAlias,
        },
        {
          flag: joinAll || project_id,
          path: col<Headquarters>(headquartersAlias, 'project'),
          alias: projectAlias,
        },
        {
          flag: joinAll || documents,
          path: col<EmployeeEntity>(employeeAlias, 'document'),
          alias: documentsAlias,
        },
      ];

      for (const { flag, path, alias } of joins) {
        if (flag) employeesQuery.leftJoinAndSelect(path, alias);
      }

      const filters: Record<string, any> = {
        status,
        nacionality,
        gener,
        blood,
        statusCivil,
      };

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          employeesQuery.andWhere(
            `${col<EmployeeEntity>(employeeAlias, key as keyof EmployeeEntity)} = :${key}`,
            { [key]: value },
          );
        }
      });

      if (department_id && department_id > 0) {
        employeesQuery.andWhere(
          `${col<PositionEntity>(positionAlias, 'department')} = :department_id`,
          {
            department_id,
          },
        );
      }

      if (position_id && position_id > 0) {
        employeesQuery.andWhere(
          `${col<PositionEntity>(positionAlias, 'id')} = :position_id`,
          {
            position_id,
          },
        );
      }

      if (birthdayStart && birthdayEnd) {
        if (birthdayStart > birthdayEnd) {
          throw new ErrorManager({
            code: 'NOT_ACCEPTABLE',
            message: msgError('DATE_RANGE_INCORRECT'),
          });
        }

        employeesQuery.andWhere(
          `${col<EmployeeEntity>(employeeAlias, 'date_birth')} BETWEEN :birthdayStart AND :birthdayEnd`,
          {
            birthdayStart,
            birthdayEnd,
          },
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

      if (registerStart && registerEnd) {
        if (registerStart > registerEnd) {
          throw new ErrorManager({
            code: 'NOT_ACCEPTABLE',
            message: msgError('DATE_RANGE_INCORRECT'),
          });
        }

        employeesQuery.andWhere(
          `${col<EmploymentRecordEntity>(employmentRecordAlias, 'date_register')} BETWEEN :registerStart AND :registerEnd`,
          {
            registerStart,
            registerEnd,
          },
        );
      }

      if (project_id) {
        employeesQuery.andWhere(
          `${col<Project>(projectAlias, 'id')} = :project_id`,
          {
            project_id,
          },
        );
      }

      if (!all) employeesQuery.skip(skip).take(limit);

      if (name && name !== '') {
        employeesQuery
          .andWhere(
            `LOWER(${col<EmployeeEntity>(employeeAlias, 'names')}) LIKE LOWER('%${name}%')`,
            {
              name,
            },
          )
          .orWhere(
            `LOWER(${col<EmployeeEntity>(employeeAlias, 'first_last_name')}) LIKE LOWER('%${name}%')`,
            {
              name,
            },
          )
          .orWhere(
            `LOWER(${col<EmployeeEntity>(employeeAlias, 'second_last_name')}) LIKE LOWER('%${name}%')`,
            {
              name,
            },
          );
      }

      let result: EmployeeEntity[];
      let totalResult: number;

      if (all) {
        result = await employeesQuery.getMany();
        totalResult = result.length;
      } else {
        [result, totalResult] = await employeesQuery.getManyAndCount();
      }

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
      const options: FindOneOptions<EmployeeEntity> = {
        relations: {
          employmentRecord: { typeContract: true },
        },
      };

      if (relations || allRelations) {
        options.relations = {
          ...options.relations,
          email_cts: true,
          employmentRecord: {
            employeeHasPosition: {
              position_id: true,
            },
            bank: true,
            bondHasEmployee: true,
            vacations: true,
            typeContract: true,
            attendancePermissions: true,
          },
        };
      }

      if (allRelations) {
        options.relations = {
          ...options.relations,
          employmentRecord: {
            employeeHasPosition: {
              position_id: true,
              staff: { headquarter: true },
            },
            bondHasEmployee: {
              bond: {
                type_id: true,
                description_id: true,
              },
            },
            bank: true,
            attendancePermissions: true,
            vacations: true,
            typeContract: true,
          },
        };
      }

      if (deletes) {
        options.withDeleted = true;
      } else {
        options.where = {
          status: STATUS_EMPLOYEE.ACTIVE,
          employmentRecord: { date_end: IsNull() },
        };
      }

      const result = await findOneByTerm({
        repository: this.employeeRepository,
        term,
        options,
      });

      return { ...result, employmentRecord: result.employmentRecord };
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  public async updateItem({ id, ...payload }: UpdateEmployeeDto) {
    const { contract, ...data } = payload;

    try {
      return await runInTransaction(this.dataSource, async (queryRunner) => {
        const { employmentRecord, email_cts, ...employee } = await this.getItem(
          {
            term: id,
            relations: true,
          },
        );

        if (employee.status === STATUS_EMPLOYEE.DISMISSAL) {
          throw new ErrorManager({
            code: 'NOT_ACCEPTABLE',
            message: msgError(
              'MSG',
              'No se puede actualizar un empleado despedido',
            ),
          });
        }

        // if (contract) {
        //   if (contract.employee_has_position) {
        //     for (const {
        //       position_id,
        //       headquarter_id,
        //       parent_id,
        //     } of contract.employee_has_position) {
        //       await this.employeeHasPostionService.updatePosition({
        //         queryRunner,
        //         position_id,
        //         employee: employmentRecord[0],
        //         positionService: this.positionService,
        //       });
        //     }
        //   }

        //   if (contract && contract.bank_id) {
        //     const newBank = await this.bankService.findOne(contract.bank_id);

        //     if (
        //       employmentRecord[0].bank &&
        //       employmentRecord[0].bank.id !== contract.bank_id
        //     ) {
        //       Object.assign(employmentRecord[0].bank, newBank);
        //     }
        //   }

        //   if (contract.typeContract) {
        //     const newTypeContract = await this.typeContractService.findOne({
        //       term: typeContract,
        //     });

        //     if (
        //       typeContract &&
        //       employmentRecord[0].typeContract.id !== typeContract
        //     ) {
        //       Object.assign(employmentRecord[0].typeContract, newTypeContract);
        //     }
        //   }

        //   if (account && account.email) {
        //     if (account.email && account.email !== email_cts?.email) {
        //       email_cts.email = account.email;

        //       // TODO: Notificar a Soporte del Cambio en el Email
        //     }
        //   }

        //   // TODO: #6 Validar que se pueda eliminar la cuenta al desactivar

        //   /*Object.assign(employmentRecord[0], {
        //     ...employmentRecord[0],
        //     bank: bank,
        //   });*/
        // }

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
          employmentRecord: {
            employee: true,
          },
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
        employee.employmentRecord[0].employeeHasPosition.some((ehp) =>
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
