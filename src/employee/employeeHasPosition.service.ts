import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, QueryRunner, Repository } from 'typeorm';
import {
  EmployeeHasPositions,
  EmploymentRecordEntity,
  StaffEntity,
} from 'cts-entities';

import {
  createResult,
  deleteResult,
  ErrorManager,
  findOneByTerm,
  FindOneWhitTermAndRelationDto,
  IUpdateForCahngesInEmployeeHasPositions,
  msgError,
  NATS_SERVICE,
  paginationResult,
  restoreResult,
  sendAndHandleRpcExceptionPromise,
} from '../common';

import { PositionService } from '../position/position.service';
import {
  CreateEmployeeHasPositionDto,
  UpdateEmployeeHasPositionsDto,
} from './dto';

@Injectable()
export class EmployeeHasPositionService {
  constructor(
    @InjectRepository(EmployeeHasPositions)
    private readonly employeeHasPostion: Repository<EmployeeHasPositions>,
    @InjectRepository(EmploymentRecordEntity)
    private readonly employmentRecordRepository: Repository<EmploymentRecordEntity>,
    private readonly positionService: PositionService,
    @Inject(NATS_SERVICE) private readonly clientProxy: ClientProxy,
  ) {}

  async create({
    id,
    position_id,
    headquarter_id,
    parent_id,
  }: CreateEmployeeHasPositionDto) {
    try {
      const existEmployeeHasPosition = await this.employeeHasPostion.findOne({
        select: { id: true, deleted_at: true },
        where: { employmentRecord: { id }, position_id: { id: position_id } },
        withDeleted: true,
        relations: { position_id: true },
      });

      existEmployeeHasPosition?.deleted_at &&
        (await restoreResult(
          this.employeeHasPostion,
          existEmployeeHasPosition.id,
        ));

      const employmentRecord = await findOneByTerm({
        repository: this.employmentRecordRepository,
        term: id,
      });

      const posiiton = await this.positionService.findOne({
        term: position_id,
      });

      const employee_has_position = existEmployeeHasPosition
        ? existEmployeeHasPosition
        : await createResult(
            this.employeeHasPostion,
            {
              position_id: posiiton,
              employmentRecord,
            },
            EmployeeHasPositions,
          );

      const staff = await sendAndHandleRpcExceptionPromise(
        this.clientProxy,
        'staff.create',
        {
          headquarter: headquarter_id,
          parent: parent_id,
          employeeHasPositions: employee_has_position.id,
          eployeeHasPositionsEntity: employee_has_position,
        },
      );

      return { employee_has_position, staff };
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findOneByEmployeeId({
    term,
    deletes,
    relations,
    allRelations,
  }: FindOneWhitTermAndRelationDto) {
    try {
      if (isNaN(+term)) {
        throw new ErrorManager({
          code: 'NOT_ACCEPTABLE',
          message: 'BAD_REQUEST',
        });
      }

      const options: FindOneOptions<EmployeeHasPositions> = {
        where: { employmentRecord: { id: +term } },
        relations: {
          employmentRecord: {
            employee: true,
          },
        },
      };

      if (relations || allRelations) {
        options.relations = {
          ...options.relations,
          position_id: true,
        };
      }

      if (allRelations) {
        options.relations = {
          ...options.relations,
          staff: true,
        };
      }

      if (deletes) {
        options.withDeleted = true;
      }

      const result = await paginationResult(this.employeeHasPostion, {
        all: true,
        options,
      });

      const data = result.data.map((el: EmployeeHasPositions) => {
        if (relations || allRelations) {
          return { ehp_id: el.id, ...el.position_id };
        } else {
          return {
            ehp_id: el.id,
            created_at: el.created_at,
            updated_at: el.updated_at,
          };
        }
      });

      if (data.length <= 0) {
        throw new ErrorManager({
          message: msgError('NO_WITH_TERM', term),
          code: 'NOT_FOUND',
        });
      }

      return {
        ...result,
        data: {
          employee_id: result.data[0].employmentRecord.employee.id,
          position_id: data.map((el) => el),
        },
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async verifyEmployeeHasPosition(
    id: number,
    relations: boolean = false,
    all: boolean = false,
  ) {
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

      if (all) {
        options.relations = {
          ...options.relations,
          staff: { headquarter: true },
        };
      }

      const result = await findOneByTerm({
        repository: this.employeeHasPostion,
        term: id,
        options,
      });

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  // FIXME: #4 Obtener el historico de la tabla auditora
  async findHistryByEmployeeId(id: number) {
    try {
      return await this.employeeHasPostion.find({
        where: { employmentRecord: { employee: { id } } },
        withDeleted: true,
        relations: { position_id: true },
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async updateEmployeeHasPositions(payload: UpdateEmployeeHasPositionsDto) {
    try {
      const { id, headquarter_id, position_id, parent_id } = payload;

      const newPosition: EmployeeHasPositions[] = [],
        oldPosition: EmployeeHasPositions[] = [];

      const { id: _id, ...employeeHasPosition } =
        await this.verifyEmployeeHasPosition(id, true, true);

      if (employeeHasPosition.position_id.id !== position_id) {
        const existPosition = await this.employeeHasPostion.findOne({
          select: { id: true, deleted_at: true },
          where: {
            employmentRecord: { id: employeeHasPosition.employmentRecord.id },
            position_id: { id: position_id },
          },
          withDeleted: true,
        });

        if (existPosition && !existPosition.deleted_at === null) {
          await this.restorePostion(existPosition.id);
          await this.deletePositions(_id);
          newPosition.push(existPosition);
          oldPosition.push({ id: _id, ...employeeHasPosition });
        }

        employeeHasPosition.position_id = await this.positionService.findOne({
          term: position_id,
        });

        if (!existPosition || !existPosition.deleted_at) {
          await this.deletePositions(_id);

          const { employee_has_position: saved } = await this.create({
            id: employeeHasPosition.employmentRecord.id,
            position_id,
            headquarter_id,
            parent_id,
          });

          newPosition.push(saved);
        }
      }

      if (
        employeeHasPosition.staff.some(
          (el) => el.headquarter.id === headquarter_id,
        )
      ) {
        throw new ErrorManager({
          code: 'NOT_ACCEPTABLE',
          message: msgError(
            'MSG',
            'El empleado ya pertenece a la sede seleccionada',
          ),
        });
      }

      return { employeeHasPosition };

      // const staffValidation: IUpdateForCahngesInEmployeeHasPositions = {
      //   eHp_creates: newPosition,
      //   eHp_deletes: oldPosition,
      // };

      // const staff = await sendAndHandleRpcExceptionPromise(
      //   this.clientProxy,
      //   'updateForChangesInEmployeeHasPositions',
      //   staffValidation,
      // );

      // return staff;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async deletePositions(id: number, queryRunner?: QueryRunner) {
    try {
      const existStaff = await this.findStaffChildren(id);

      if (existStaff.length > 0) {
        throw new ErrorManager({
          code: 'NOT_ACCEPTABLE',
          message: msgError(
            'MSG',
            'No se puede eliminar un empleado con staff asignado, debe reemplazarlo o eliminar el staff antes',
          ),
        });
      }

      return await deleteResult(this.employeeHasPostion, id, queryRunner);
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async restorePostion(id: number, queryRunner?: QueryRunner) {
    try {
      return await restoreResult(this.employeeHasPostion, id, queryRunner);
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  private async findStaffChildren(id: number) {
    try {
      const options: FindOneOptions<EmployeeHasPositions> = {
        relations: {
          staff: { children: true },
        },
        where: { id },
      };

      const { staff } = await findOneByTerm({
        repository: this.employeeHasPostion,
        term: id,
        options,
      });

      return staff.map((el) => el.children).flat();
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }
}
