import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOneOptions, QueryRunner, Repository } from 'typeorm';
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
  NATS_SERVICE,
  paginationResult,
  restoreResult,
  sendAndHandleRpcExceptionPromise,
} from '../common';

import { PositionService } from '../position/position.service';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class EmployeeHasPositionService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(EmployeeHasPositions)
    private readonly employeeHasPostion: Repository<EmployeeHasPositions>,
    @Inject(NATS_SERVICE) private readonly clientProxy: ClientProxy,
  ) {}

  async create(
    employee: IEmployee,
    position: IPosition,
    queryRunner: QueryRunner,
  ) {
    try {
      const result = await createResult(
        this.employeeHasPostion,
        {
          employee_id: employee,
          position_id: position,
        },
        EmployeeHasPositions,
        queryRunner,
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

      if (relations) {
        options.relations = {
          ...options.relations,
          position_id: true,
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

  async updatePosition({
    queryRunner,
    id,
    position_id,
    employee,
    positionService,
  }: {
    queryRunner: QueryRunner;
    id: number;
    position_id: number;
    employee: EmployeeEntity;
    positionService: PositionService;
  }) {
    try {
      const employeeHasPosition = await this.employeeHasPostion.find({
        where: { employee_id: { id } },
        withDeleted: true,
        relations: {
          position_id: true,
          staff: { bondHasStaff: true, headquarter: true },
        },
      });

      const position = employeeHasPosition.find(
        (item) => item.position_id.id === position_id,
      );

      let result: EmployeeHasPositions;

      if (position) {
        await restoreResult(this.employeeHasPostion, position.id, queryRunner);

        this.deletePositionsOld(employeeHasPosition, position_id, queryRunner);

        result = position;
      } else {
        const newPosition = await positionService.findOne({
          term: position_id,
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

        this.deletePositionsOld(employeeHasPosition, position_id, queryRunner);
      }

      const staff: StaffEntity = await sendAndHandleRpcExceptionPromise(
        this.clientProxy,
        'updateStaff',
        {
          employeeHasPositions: 1,
          headquarter: 1,
          parent: 2,
          queryRunner,
        },
      );

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  private deletePositionsOld(
    employeeHasPosition: EmployeeHasPositions[],
    id: number,
    queryRunner?: QueryRunner,
  ) {
    employeeHasPosition.forEach(async (item) => {
      if (item.deleted_at || item.position_id.id === id) {
        return;
      }
      await deleteResult(this.employeeHasPostion, item.id, queryRunner);
    });
  }
}
