import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { FindOneOptions, QueryRunner, Repository } from 'typeorm';
import {
  EmployeeEntity,
  EmployeeHasPositions,
  StaffEntity,
  IEmployee,
} from 'cts-entities';

import {
  createResult,
  deleteResult,
  ErrorManager,
  findOneByTerm,
  FindOneWhitTermAndRelationDto,
  IPosition,
  IUpdateForCahngesInEmployeeHasPositions,
  msgError,
  NATS_SERVICE,
  paginationResult,
  restoreResult,
  sendAndHandleRpcExceptionPromise,
} from '../common';

import { PositionService } from '../position/position.service';

@Injectable()
export class EmployeeHasPositionService {
  constructor(
    @InjectRepository(EmployeeHasPositions)
    private readonly employeeHasPostion: Repository<EmployeeHasPositions>,
    @Inject(NATS_SERVICE) private readonly clientProxy: ClientProxy,
  ) {}

  async create(
    employee: IEmployee,
    position: IPosition[],
    queryRunner: QueryRunner,
  ) {
    try {
      const result = await Promise.all(
        position.map(async (el) => {
          return await createResult(
            this.employeeHasPostion,
            {
              employee_id: employee,
              position_id: el,
            },
            EmployeeHasPositions,
            queryRunner,
          );
        }),
      );

      return result;
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
        where: { employee_id: { id: +term } },
        relations: { employee_id: true },
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
        return {
          position_id: !relations
            ? {
                id: el.id,
                created_at: el.created_at,
                updated_at: el.updated_at,
              }
            : el.position_id,
        };
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
          employee_id: result.data[0].employee_id.id,
          position_id: data,
        },
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async verifyEmployeeHasPosition(id: number) {
    try {
      const result = await findOneByTerm({
        repository: this.employeeHasPostion,
        term: id,
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
        where: { employee_id: { id } },
        withDeleted: true,
        relations: { position_id: true },
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  // TODO: #1 Revisar la actualización de las posiciones
  async updatePosition({
    queryRunner,
    position_id,
    employee,
    positionService,
  }: {
    queryRunner: QueryRunner;
    position_id: number[];
    employee: EmployeeEntity;
    positionService: PositionService;
  }) {
    try {
      const employeeHasPosition = await this.employeeHasPostion.find({
        where: { employee_id: { id: employee.id } },
        withDeleted: true,
        relations: {
          position_id: true,
          staff: true,
        },
      });

      const positionsToDelete = employeeHasPosition.filter((position) => {
        return (
          position.deleted_at === null &&
          !position_id.includes(position.position_id.id)
        );
      });

      await Promise.all(
        positionsToDelete.map(async ({ id }) => {
          await deleteResult(this.employeeHasPostion, id, queryRunner);
        }),
      );

      const result = await Promise.all(
        position_id.map(async (el) => {
          const position = employeeHasPosition.find((employeeHasPosition) => {
            return employeeHasPosition.position_id.id === el;
          });

          let result: EmployeeHasPositions;
          if (position) {
            if (position.deleted_at !== null) {
              await restoreResult(
                this.employeeHasPostion,
                position.id,
                queryRunner,
              );
            }

            result = position;
          } else {
            const newPosition = await positionService.findOne({
              term: el,
              relations: true,
            });

            result = await createResult(
              this.employeeHasPostion,
              {
                employee_id: employee,
                position_id: newPosition,
              },
              EmployeeHasPositions,
              queryRunner,
            );
          }
          return result;
        }),
      );

      // TODO: Actualizar el staffing
      const newPosition = result.filter(
        (el) => !position_id.includes(el.position_id.id),
      );

      const payload: IUpdateForCahngesInEmployeeHasPositions = {
        eHp_creates: newPosition,
        eHp_deletes: positionsToDelete,
      };

      const staff = await sendAndHandleRpcExceptionPromise(
        this.clientProxy,
        'updateForChangesInEmployeeHasPositions',
        payload,
      );

      return { ...result, staff };
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async deletePositions(id: number, queryRunner?: QueryRunner) {
    return await deleteResult(this.employeeHasPostion, id, queryRunner);
  }
}
