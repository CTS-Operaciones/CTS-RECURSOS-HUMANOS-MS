import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, QueryRunner, Repository } from 'typeorm';
import { EmployeeHasPositions, EmploymentRecordEntity } from 'cts-entities';

import {
  createResult,
  deleteResult,
  ErrorManager,
  findOneByTerm,
  FindOneWhitTermAndRelationDto,
  IPosition,
  msgError,
  NATS_SERVICE,
  paginationResult,
} from '../common';

import { PositionService } from '../position/position.service';
import { UpdateEMployeeHasPositionsDto } from './dto';

@Injectable()
export class EmployeeHasPositionService {
  constructor(
    @InjectRepository(EmployeeHasPositions)
    private readonly employeeHasPostion: Repository<EmployeeHasPositions>,
    private readonly positionService: PositionService,
    @Inject(NATS_SERVICE) private readonly clientProxy: ClientProxy,
  ) {}

  async create(
    employee: EmploymentRecordEntity,
    position: IPosition[],
    queryRunner: QueryRunner,
  ) {
    try {
      const result = await Promise.all(
        position.map(async (el) => {
          return await createResult(
            this.employeeHasPostion,
            {
              employmentRecord: employee,
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
          employee_id: result.data[0].employmentRecord.employee.id,
          position_id: data,
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

  async updatePosition(payload: UpdateEMployeeHasPositionsDto) {
    try {
      const { id, headquarter_id, position_id, parent_id } = payload;

      const employeeHasPosition = await this.verifyEmployeeHasPosition(
        id,
        true,
        true,
      );

      if (position_id !== employeeHasPosition.position_id.id) {
        employeeHasPosition.position_id = await this.positionService.findOne({
          term: position_id,
        });
      }

      if (
        employeeHasPosition.staff.some(
          (el) => el.headquarter.id === headquarter_id,
        )
      ) {
        throw new ErrorManager({
          code: 'BAD_REQUEST',
          message: 'The headquarter is already assigned to the employee',
        });
      }

      return;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async deletePositions(id: number, queryRunner?: QueryRunner) {
    return await deleteResult(this.employeeHasPostion, id, queryRunner);
  }
}
