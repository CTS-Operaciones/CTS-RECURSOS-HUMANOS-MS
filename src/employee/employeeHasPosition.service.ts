import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOneOptions, QueryRunner, Repository } from 'typeorm';
import {
  EmployeeHasPositions,
  EmploymentRecordEntity,
  Headquarters,
  Project,
  StaffEntity,
} from 'cts-entities';

import {
  col,
  createResult,
  deleteResult,
  ErrorManager,
  findOneByTerm,
  FindOneWhitTermAndRelationDto,
  msgError,
  NATS_SERVICE,
  paginationResult,
  restoreResult,
  runInTransaction,
  sendAndHandleRpcExceptionPromise,
} from '../common';

import { PositionService } from '../position/position.service';
import {
  BulkUpdateEmployeeHasPositionsDto,
  CreateEmployeeHasPositionDto,
  UpdateEmployeeHasPositionsDto,
} from './dto';

@Injectable()
export class EmployeeHasPositionService {
  constructor(
    @InjectRepository(EmployeeHasPositions)
    private readonly employeeHasPosition: Repository<EmployeeHasPositions>,
    @InjectRepository(EmploymentRecordEntity)
    private readonly employmentRecordRepository: Repository<EmploymentRecordEntity>,
    private readonly positionService: PositionService,
    @Inject(NATS_SERVICE) private readonly clientProxy: ClientProxy,
    private readonly dataSource: DataSource,
  ) { }

  async create({
    id,
    position_id,
    headquarter_id,
    parent_id,
  }: CreateEmployeeHasPositionDto) {
    try {
      const existEmployeeHasPosition = await this.employeeHasPosition.findOne({
        select: { id: true, deleted_at: true },
        where: { employmentRecord: { id }, position_id: { id: position_id } },
        withDeleted: true,
        relations: { position_id: true },
      });

      existEmployeeHasPosition?.deleted_at &&
        (await restoreResult(
          this.employeeHasPosition,
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
          this.employeeHasPosition,
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

      const result = await paginationResult(this.employeeHasPosition, {
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
        repository: this.employeeHasPosition,
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
      return await this.employeeHasPosition.find({
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
      return await runInTransaction(this.dataSource, async (queryRunner) => {
        const { id, headquarter_id, position_id, parent_id } = payload;

        const { id: _id, ...employeeHasPosition } =
          await this.verifyEmployeeHasPosition(id, true, true);

        let currentPosition = employeeHasPosition;

        if (employeeHasPosition.position_id.id !== position_id) {
          const existPosition = await this.employeeHasPosition.findOne({
            select: { id: true, deleted_at: true },
            where: {
              employmentRecord: { id: employeeHasPosition.employmentRecord.id },
              position_id: { id: position_id },
            },
            withDeleted: true,
          });

          if (existPosition && existPosition.deleted_at !== null) {
            await this.restorePostion(existPosition.id, queryRunner);
            await this.deletePositions(_id, queryRunner);
            currentPosition = existPosition;
          }

          employeeHasPosition.position_id = await this.positionService.findOne({
            term: position_id,
          });

          if (!existPosition || !existPosition.deleted_at) {
            await this.deletePositions(_id, queryRunner);

            return await this.create({
              id: employeeHasPosition.employmentRecord.id,
              position_id,
              headquarter_id,
              parent_id,
            });
          }
        }

        // Si el position_id es el mismo, verificar si ya está en la sede objetivo
        if (employeeHasPosition.position_id.id === position_id) {
          const hasStaffInTargetHeadquarter = currentPosition.staff?.some(
            (el) => el.headquarter.id === headquarter_id,
          );

          // Si ya está en la sede objetivo, solo actualizar el staff si es necesario
          if (hasStaffInTargetHeadquarter) {
            // Actualizar el staff para sincronizar el parent si cambió
            await sendAndHandleRpcExceptionPromise(
              this.clientProxy,
              'updateForChangesInEmployeeHasPositions',
              {
                id,
                headquarter: headquarter_id,
                employeeHasPositions: id,
                parent: parent_id,
              },
            );

            return { employeeHasPosition, alreadyInHeadquarter: true };
          }
        }

        // Crear o actualizar staff para la sede objetivo
        await sendAndHandleRpcExceptionPromise(
          this.clientProxy,
          'updateForChangesInEmployeeHasPositions',
          {
            id,
            headquarter: headquarter_id,
            employeeHasPositions: id,
            parent: parent_id,
          },
        );

        return { employeeHasPosition };
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async bulkUpdateEmployeeHasPositions(
    payload: BulkUpdateEmployeeHasPositionsDto,
  ) {
    try {

      const { positions } = payload;

      // Eliminar duplicados basados en el id del employeeHasPosition
      const uniqueEmployees = Array.from(
        new Map(positions.map((emp) => [emp.id, emp])).values(),
      );

      return await runInTransaction(this.dataSource, async (queryRunner) => {
        const results: any[] = [];

        for (const employeePayload of uniqueEmployees) {
          // Reutilizar la lógica existente, procesando cada empleado
          // dentro de la misma transacción
          const { id, headquarter_id, position_id, parent_id } = employeePayload;

          const { id: _id, ...employeeHasPosition } =
            await this.verifyEmployeeHasPosition(id, true, true);

          let currentPosition = employeeHasPosition;

          if (employeeHasPosition.position_id.id !== position_id) {
            const existPosition = await this.employeeHasPosition.findOne({
              select: { id: true, deleted_at: true },
              where: {
                employmentRecord: { id: employeeHasPosition.employmentRecord.id },
                position_id: { id: position_id },
              },
              withDeleted: true,
            });

            if (existPosition && existPosition.deleted_at !== null) {
              await this.restorePostion(existPosition.id, queryRunner);
              await this.deletePositions(_id, queryRunner);
              currentPosition = existPosition;
            }

            employeeHasPosition.position_id = await this.positionService.findOne({
              term: position_id,
            });

            if (!existPosition || !existPosition.deleted_at) {
              await this.deletePositions(_id, queryRunner);

              // Nota: El método create está dentro de la transacción global
              const createResult = await this.create({
                id: employeeHasPosition.employmentRecord.id,
                position_id,
                headquarter_id,
                parent_id,
              });
              results.push(createResult);
              continue;
            }
          }

          // Caso: El position_id es el mismo, puede o no cambiar la sede
          // El microservicio de staffing manejará:
          // - Eliminar staff de sedes no objetivo (solo proyectos externos)
          // - Mantener staff de proyectos internos
          // - Crear staff si no existe en la sede objetivo
          // - Actualizar parent si es necesario
          const staffResult = await sendAndHandleRpcExceptionPromise(
            this.clientProxy,
            'updateForChangesInEmployeeHasPositions',
            {
              id,
              headquarter: headquarter_id,
              employeeHasPositions: id,
              parent: parent_id,
            },
          );

          results.push({ employeeHasPosition, staffResult });
        }

        return results;
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async deletePositions(id: number, queryRunner?: QueryRunner) {
    try {
      // Verificar si tiene staff con children
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

      // Verificar si el employeeHasPosition está asignado a un proyecto interno
      const employeeHasPositionAlias = 'ehp',
        staffAlias = 'staff',
        headquarterAlias = 'headquarter',
        projectAlias = 'project';

      const count = await this.employeeHasPosition
        .createQueryBuilder(employeeHasPositionAlias)
        .select(`COUNT(${col<StaffEntity>(staffAlias, 'id')}) as count`)
        .leftJoin(`${col<EmployeeHasPositions>(employeeHasPositionAlias, 'staff')}`, staffAlias)
        .leftJoin(
          `${col<StaffEntity>(staffAlias, 'headquarter')}`,
          headquarterAlias,
        )
        .leftJoin(
          `${col<Headquarters>(headquarterAlias, 'project')}`,
          projectAlias,
        )
        .where(`${col<EmployeeHasPositions>(employeeHasPositionAlias, 'id')} = :id`, { id })
        .andWhere(`${col<EmployeeHasPositions>(employeeHasPositionAlias, 'deleted_at')} IS NULL`)
        .andWhere(`${col<Project>(projectAlias, 'isExternal')} = false`)
        .getRawOne();

      const hasInternalProjectStaff = count ? parseInt(count.count) > 0 : false;

      // Si tiene staff en proyecto interno, NO eliminar
      if (hasInternalProjectStaff) {
        // No eliminar el employeeHasPosition, solo retornar sin error
        return null;
      }

      // Solo eliminar si NO tiene staff en proyectos internos
      return await deleteResult(this.employeeHasPosition, id, queryRunner);
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async restorePostion(id: number, queryRunner?: QueryRunner) {
    try {
      return await restoreResult(this.employeeHasPosition, id, queryRunner);
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
        repository: this.employeeHasPosition,
        term: id,
        options,
      });

      return staff.map((el) => el.children).flat();
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }
}
