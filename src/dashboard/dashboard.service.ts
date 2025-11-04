import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import {
  EmployeeEntity,
  EmploymentRecordEntity,
  EmployeeHasPositions,
  StaffEntity,
  Headquarters,
  Project,
  PositionEntity,
  DepartmentEntity,
  BondHasEmployee,
  BondEntity,
  TypesBondEntity,
  VacationEntity,
  AttendancePermission,
  STATUS_VACATIONS_PERMISSION
} from "cts-entities";

import { col, ErrorManager, IChartData, IResponseSummary } from "../common";

import { FilterDashboardDto, GroupByPeriod } from "./dto";

@Injectable()
export class DashboardService {
  constructor(
    private readonly dataSource: DataSource,
  ) { }

  async getDashboardData(filters: FilterDashboardDto) {
    try {
      const response: any = {};

      // Siempre incluir el resumen
      response.summary = await this.getSummaryEmployees(filters);

      // Incluir datos de gráficas si se solicita
      if (filters.includeChartData) {
        response.chartData = await this.getChartData(filters);
      }

      return response;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  private async getSummaryEmployees(filters: FilterDashboardDto) {
    try {
      const summary: IResponseSummary[] = [];
      summary.push({ name: 'Total', count: await this.getCountByFilters(filters) });

      // Determinar qué contadores adicionales incluir según los filtros
      const {
        isDismissal,
        hasBonds,
        hasActiveBonds,
        hasExpiredBonds,
        bondTypeId
      } = filters;

      // Si se especifica isDismissal, mostrar solo el contador correspondiente
      if (isDismissal === true) {
        summary.push({ name: 'Empleados Despedidos', count: await this.getCountDespedidos(filters) });
      } else if (isDismissal === false) {
        summary.push({ name: 'Empleados Activos', count: await this.getCountActivos(filters) });
      } else {
        // Si no se especifica isDismissal, mostrar ambos
        summary.push({ name: 'Empleados Activos', count: await this.getCountActivos(filters) });
        summary.push({ name: 'Empleados Despedidos', count: await this.getCountDespedidos(filters) });
      }

      // Si hay filtros de bonos, incluir contador de bonos
      if (hasBonds || hasActiveBonds || hasExpiredBonds || bondTypeId) {
        summary.push({ name: 'Empleados con Bonos', count: await this.getCountConBonos(filters) });
      }

      // Siempre incluir contadores de vacaciones y permisos (son métricas útiles)
      summary.push({ name: 'Empleados con Vacaciones', count: await this.getCountConVacaciones(filters) });

      summary.push({ name: 'Empleados con Permisos', count: await this.getCountConPermisos(filters) });

      return summary;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  private async getCountByFilters({
    startDate,
    endDate,
    isDismissal = false,
    headquarterId,
    projectId,
    positionId,
    departmentId,
    hasBonds,
    hasActiveBonds,
    hasExpiredBonds,
    bondTypeId
  }: FilterDashboardDto): Promise<number> {
    try {
      const employeeAlias = 'employee';
      const employmentRecordAlias = 'employmentRecord';
      const employeeHasPositionsAlias = 'employeeHasPositions';
      const positionAlias = 'position';
      const departmentAlias = 'department';
      const staffAlias = 'staff';
      const headquarterAlias = 'headquarter';
      const projectAlias = 'project';
      const bondHasEmployeeAlias = 'bondHasEmployee';
      const bondAlias = 'bond';
      const bondTypeAlias = 'bondType';

      // Contar registros de staff (si un empleado tiene múltiples staff, cuenta cada uno)
      const query = this.dataSource.createQueryBuilder(EmployeeEntity, employeeAlias)
        .innerJoin(
          `${col<EmployeeEntity>(employeeAlias, 'employmentRecord')}`,
          employmentRecordAlias,
          `${col<EmploymentRecordEntity>(employmentRecordAlias, 'deleted_at')} IS NULL`,
        )
        .where(`${col<EmployeeEntity>(employeeAlias, 'status')} = :status`,
          { status: isDismissal ? 'DISMISSAL' : 'ACTIVE' }
        );

      // Para empleados activos, el contrato debe estar vigente (date_end IS NULL)
      // Para empleados despedidos, el contrato debe haber terminado (date_end IS NOT NULL)
      if (isDismissal) {
        query.andWhere(`${col<EmploymentRecordEntity>(employmentRecordAlias, 'date_end')} IS NOT NULL`);
      } else {
        query.andWhere(`${col<EmploymentRecordEntity>(employmentRecordAlias, 'date_end')} IS NULL`);
      }

      // Si no hay filtros de staff/posición, contar empleados únicos
      if (!positionId && !departmentId && !headquarterId && !projectId) {
        query.select(`COUNT(DISTINCT ${col<EmployeeEntity>(employeeAlias, 'id')})`, 'total_employees');
      } else {
        // Si hay filtros de staff/posición, necesitamos contar cada asignación
        query
          .innerJoin(
            `${col<EmploymentRecordEntity>(employmentRecordAlias, 'employeeHasPosition')}`,
            employeeHasPositionsAlias,
            `${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'deleted_at')} IS NULL`,
          );

        // Para contar correctamente, usamos el ID de staff si está disponible
        if (headquarterId || projectId) {
          query
            .innerJoin(
              `${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'staff')}`,
              staffAlias,
              `${col<StaffEntity>(staffAlias, 'deleted_at')} IS NULL`,
            )
            .select(`COUNT(DISTINCT ${col<StaffEntity>(staffAlias, 'id')})`, 'total_employees');
        } else {
          // Si solo filtramos por posición/departamento, contamos employeeHasPositions
          query.select(`COUNT(DISTINCT ${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'id')})`, 'total_employees');
        }

        // Join con Position si se filtra por positionId o departmentId
        if (positionId || departmentId) {
          query.innerJoin(
            `${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'position_id')}`,
            positionAlias,
            `${col<PositionEntity>(positionAlias, 'deleted_at')} IS NULL`,
          );

          // Filtro por positionId
          if (positionId) {
            query.andWhere(`${col<PositionEntity>(positionAlias, 'id')} = :positionId`, { positionId });
          }

          // Join con Department si se filtra por departmentId
          if (departmentId) {
            query.innerJoin(
              `${col<PositionEntity>(positionAlias, 'department')}`,
              departmentAlias,
              `${col<DepartmentEntity>(departmentAlias, 'deleted_at')} IS NULL`,
            );
            query.andWhere(`${col<DepartmentEntity>(departmentAlias, 'id')} = :departmentId`, { departmentId });
          }
        }

        // Join con Staff, Headquarters y Project si se filtra por sede o proyecto
        if (headquarterId || projectId) {
          if (!query.expressionMap.joinAttributes.find(j => j.alias.name === staffAlias)) {
            query.innerJoin(
              `${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'staff')}`,
              staffAlias,
              `${col<StaffEntity>(staffAlias, 'deleted_at')} IS NULL`,
            );
          }

          query.innerJoin(
            `${col<StaffEntity>(staffAlias, 'headquarter')}`,
            headquarterAlias,
            `${col<Headquarters>(headquarterAlias, 'deleted_at')} IS NULL`,
          );

          // Filtro por headquarterId
          if (headquarterId) {
            query.andWhere(`${col<Headquarters>(headquarterAlias, 'id')} = :headquarterId`, { headquarterId });
          }

          // Join con Project si se filtra por projectId
          if (projectId) {
            query.innerJoin(
              `${col<Headquarters>(headquarterAlias, 'project')}`,
              projectAlias,
              `${col<Project>(projectAlias, 'deleted_at')} IS NULL`,
            );
            query.andWhere(`${col<Project>(projectAlias, 'id')} = :projectId`, { projectId });
          }
        }
      }

      // Filtros por fecha
      // Para despedidos filtrar por date_end, para activos/todos por date_register
      const dateField = isDismissal
        ? col<EmploymentRecordEntity>(employmentRecordAlias, 'date_end')
        : col<EmploymentRecordEntity>(employmentRecordAlias, 'date_register');

      if (startDate && endDate) {
        // Si ambas fechas están presentes, usar BETWEEN
        query.andWhere(
          `${dateField} BETWEEN :startDate AND :endDate`,
          { startDate, endDate },
        );
      } else if (startDate) {
        // Si solo está startDate, filtrar desde esa fecha en adelante
        query.andWhere(
          `${dateField} >= :startDate`,
          { startDate },
        );
      } else if (endDate) {
        // Si solo está endDate, filtrar hasta esa fecha
        query.andWhere(
          `${dateField} <= :endDate`,
          { endDate },
        );
      }

      // Filtros de bonos
      if (hasBonds || hasActiveBonds || hasExpiredBonds || bondTypeId) {
        query.innerJoin(
          `${col<EmploymentRecordEntity>(employmentRecordAlias, 'bondHasEmployee')}`,
          bondHasEmployeeAlias,
          `${col<BondHasEmployee>(bondHasEmployeeAlias, 'deleted_at')} IS NULL`,
        );

        // Filtrar bonos activos (no vencidos a la fecha actual o endDate)
        if (hasActiveBonds) {
          const referenceDate = endDate || new Date();
          query.andWhere(
            `${col<BondHasEmployee>(bondHasEmployeeAlias, 'date_limit')} >= :referenceDate`,
            { referenceDate },
          );
        }

        // Filtrar bonos vencidos (fecha límite anterior a la fecha de referencia)
        if (hasExpiredBonds) {
          const referenceDate = endDate || new Date();
          if (startDate) {
            // Bonos vencidos en el rango de fechas
            query.andWhere(
              `${col<BondHasEmployee>(bondHasEmployeeAlias, 'date_limit')} BETWEEN :startDate AND :referenceDate`,
              { startDate, referenceDate },
            );
          } else {
            // Bonos vencidos antes de la fecha de referencia
            query.andWhere(
              `${col<BondHasEmployee>(bondHasEmployeeAlias, 'date_limit')} < :referenceDate`,
              { referenceDate },
            );
          }
        }

        // Filtrar por tipo de bono
        if (bondTypeId) {
          query
            .innerJoin(
              `${col<BondHasEmployee>(bondHasEmployeeAlias, 'bond')}`,
              bondAlias,
              `${col<BondEntity>(bondAlias, 'deleted_at')} IS NULL`,
            )
            .innerJoin(
              `${col<BondEntity>(bondAlias, 'type_id')}`,
              bondTypeAlias,
              `${col<TypesBondEntity>(bondTypeAlias, 'deleted_at')} IS NULL`,
            )
            .andWhere(`${col<TypesBondEntity>(bondTypeAlias, 'id')} = :bondTypeId`, { bondTypeId });
        }
      }

      const result = await query.getRawOne();
      return Number(result.total_employees);
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  private async getCountActivos(filters: FilterDashboardDto): Promise<number> {
    return this.getCountByStatus({ ...filters, isDismissal: false });
  }

  private async getCountDespedidos(filters: FilterDashboardDto): Promise<number> {
    return this.getCountByStatus({ ...filters, isDismissal: true });
  }

  private async getCountByStatus(filters: FilterDashboardDto): Promise<number> {
    try {
      const {
        startDate, endDate, isDismissal,
        headquarterId, projectId, positionId, departmentId
      } = filters;

      const employeeAlias = 'employee';
      const employmentRecordAlias = 'employmentRecord';
      const employeeHasPositionsAlias = 'employeeHasPositions';
      const positionAlias = 'position';
      const departmentAlias = 'department';
      const staffAlias = 'staff';
      const headquarterAlias = 'headquarter';
      const projectAlias = 'project';

      const query = this.dataSource.createQueryBuilder(EmployeeEntity, employeeAlias)
        .innerJoin(
          `${col<EmployeeEntity>(employeeAlias, 'employmentRecord')}`,
          employmentRecordAlias,
          `${col<EmploymentRecordEntity>(employmentRecordAlias, 'deleted_at')} IS NULL`,
        )
        .where(`${col<EmployeeEntity>(employeeAlias, 'status')} = :status`,
          { status: isDismissal ? 'DISMISSAL' : 'ACTIVE' }
        );

      // Para empleados activos, el contrato debe estar vigente (date_end IS NULL)
      // Para empleados despedidos, el contrato debe haber terminado (date_end IS NOT NULL)
      if (isDismissal) {
        query.andWhere(`${col<EmploymentRecordEntity>(employmentRecordAlias, 'date_end')} IS NOT NULL`);
      } else {
        query.andWhere(`${col<EmploymentRecordEntity>(employmentRecordAlias, 'date_end')} IS NULL`);
      }

      // Aplicar filtros de ubicación si existen
      if (positionId || departmentId || headquarterId || projectId) {
        query
          .innerJoin(
            `${col<EmploymentRecordEntity>(employmentRecordAlias, 'employeeHasPosition')}`,
            employeeHasPositionsAlias,
            `${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'deleted_at')} IS NULL`,
          );

        if (headquarterId || projectId) {
          query
            .innerJoin(
              `${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'staff')}`,
              staffAlias,
              `${col<StaffEntity>(staffAlias, 'deleted_at')} IS NULL`,
            )
            .select(`COUNT(DISTINCT ${col<StaffEntity>(staffAlias, 'id')})`, 'total_employees');
        } else {
          query.select(`COUNT(DISTINCT ${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'id')})`, 'total_employees');
        }

        if (positionId || departmentId) {
          query.innerJoin(
            `${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'position_id')}`,
            positionAlias,
            `${col<PositionEntity>(positionAlias, 'deleted_at')} IS NULL`,
          );

          if (positionId) {
            query.andWhere(`${col<PositionEntity>(positionAlias, 'id')} = :positionId`, { positionId });
          }

          if (departmentId) {
            query
              .innerJoin(
                `${col<PositionEntity>(positionAlias, 'department')}`,
                departmentAlias,
                `${col<DepartmentEntity>(departmentAlias, 'deleted_at')} IS NULL`,
              )
              .andWhere(`${col<DepartmentEntity>(departmentAlias, 'id')} = :departmentId`, { departmentId });
          }
        }

        if (headquarterId || projectId) {
          if (!query.expressionMap.joinAttributes.find(j => j.alias.name === staffAlias)) {
            query.innerJoin(
              `${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'staff')}`,
              staffAlias,
              `${col<StaffEntity>(staffAlias, 'deleted_at')} IS NULL`,
            );
          }

          query.innerJoin(
            `${col<StaffEntity>(staffAlias, 'headquarter')}`,
            headquarterAlias,
            `${col<Headquarters>(headquarterAlias, 'deleted_at')} IS NULL`,
          );

          if (headquarterId) {
            query.andWhere(`${col<Headquarters>(headquarterAlias, 'id')} = :headquarterId`, { headquarterId });
          }

          if (projectId) {
            query
              .innerJoin(
                `${col<Headquarters>(headquarterAlias, 'project')}`,
                projectAlias,
                `${col<Project>(projectAlias, 'deleted_at')} IS NULL`,
              )
              .andWhere(`${col<Project>(projectAlias, 'id')} = :projectId`, { projectId });
          }
        }
      } else {
        query.select(`COUNT(DISTINCT ${col<EmployeeEntity>(employeeAlias, 'id')})`, 'total_employees');
      }

      // Filtros por fecha
      // Para despedidos filtrar por date_end, para activos por date_register
      const dateField = isDismissal
        ? col<EmploymentRecordEntity>(employmentRecordAlias, 'date_end')
        : col<EmploymentRecordEntity>(employmentRecordAlias, 'date_register');

      if (startDate && endDate) {
        query.andWhere(
          `${dateField} BETWEEN :startDate AND :endDate`,
          { startDate, endDate },
        );
      } else if (startDate) {
        query.andWhere(
          `${dateField} >= :startDate`,
          { startDate },
        );
      } else if (endDate) {
        query.andWhere(
          `${dateField} <= :endDate`,
          { endDate },
        );
      }

      const result = await query.getRawOne();
      return Number(result.total_employees);
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  private async getCountConBonos(filters: FilterDashboardDto): Promise<number> {
    return this.getCountByFilters({ ...filters, hasBonds: true });
  }

  private async getCountConVacaciones(filters: FilterDashboardDto): Promise<number> {
    try {
      const {
        startDate, endDate,
        headquarterId, projectId, positionId, departmentId,
        showPendingVacations
      } = filters;

      const employeeAlias = 'employee';
      const employmentRecordAlias = 'employmentRecord';
      const vacationAlias = 'vacation';

      const query = this.dataSource.createQueryBuilder(EmployeeEntity, employeeAlias)
        .select(`COUNT(DISTINCT ${col<EmployeeEntity>(employeeAlias, 'id')})`, 'total_employees')
        .innerJoin(
          `${col<EmployeeEntity>(employeeAlias, 'employmentRecord')}`,
          employmentRecordAlias,
          `${col<EmploymentRecordEntity>(employmentRecordAlias, 'deleted_at')} IS NULL`,
        )
        .innerJoin(
          `${col<EmploymentRecordEntity>(employmentRecordAlias, 'vacations')}`,
          vacationAlias,
          `${col<VacationEntity>(vacationAlias, 'deleted_at')} IS NULL`,
        )
        .where(`${col<EmployeeEntity>(employeeAlias, 'status')} IN ('ACTIVE', 'DISMISSAL')`);

      // Filtrar por status de vacaciones: PENDING si se solicita, APPROVED por defecto
      if (showPendingVacations) {
        query.andWhere(
          `${col<VacationEntity>(vacationAlias, 'status')} = :vacationStatus`,
          { vacationStatus: STATUS_VACATIONS_PERMISSION.PENDING }
        );
      } else {
        query.andWhere(
          `${col<VacationEntity>(vacationAlias, 'status')} = :vacationStatus`,
          { vacationStatus: STATUS_VACATIONS_PERMISSION.APPROVED }
        );
      }

      // Aplicar filtros adicionales si es necesario
      if (headquarterId || projectId || positionId || departmentId) {
        // Agregar joins similares a getCountByStatus
        const employeeHasPositionsAlias = 'employeeHasPositions';
        const staffAlias = 'staff';
        const headquarterAlias = 'headquarter';
        const projectAlias = 'project';
        const positionAlias = 'position';
        const departmentAlias = 'department';

        query.innerJoin(
          `${col<EmploymentRecordEntity>(employmentRecordAlias, 'employeeHasPosition')}`,
          employeeHasPositionsAlias,
          `${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'deleted_at')} IS NULL`,
        );

        if (headquarterId || projectId) {
          query.innerJoin(
            `${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'staff')}`,
            staffAlias,
            `${col<StaffEntity>(staffAlias, 'deleted_at')} IS NULL`,
          )
            .innerJoin(
              `${col<StaffEntity>(staffAlias, 'headquarter')}`,
              headquarterAlias,
              `${col<Headquarters>(headquarterAlias, 'deleted_at')} IS NULL`,
            );

          if (headquarterId) {
            query.andWhere(`${col<Headquarters>(headquarterAlias, 'id')} = :headquarterId`, { headquarterId });
          }

          if (projectId) {
            query
              .innerJoin(
                `${col<Headquarters>(headquarterAlias, 'project')}`,
                projectAlias,
                `${col<Project>(projectAlias, 'deleted_at')} IS NULL`,
              )
              .andWhere(`${col<Project>(projectAlias, 'id')} = :projectId`, { projectId });
          }
        }

        if (positionId || departmentId) {
          query.innerJoin(
            `${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'position_id')}`,
            positionAlias,
            `${col<PositionEntity>(positionAlias, 'deleted_at')} IS NULL`,
          );

          if (positionId) {
            query.andWhere(`${col<PositionEntity>(positionAlias, 'id')} = :positionId`, { positionId });
          }

          if (departmentId) {
            query
              .innerJoin(
                `${col<PositionEntity>(positionAlias, 'department')}`,
                departmentAlias,
                `${col<DepartmentEntity>(departmentAlias, 'deleted_at')} IS NULL`,
              )
              .andWhere(`${col<DepartmentEntity>(departmentAlias, 'id')} = :departmentId`, { departmentId });
          }
        }
      }

      // Filtros por fecha
      if (startDate && endDate) {
        query.andWhere(
          `${col<EmploymentRecordEntity>(employmentRecordAlias, 'date_register')} BETWEEN :startDate AND :endDate`,
          { startDate, endDate },
        );
      } else if (startDate) {
        query.andWhere(
          `${col<EmploymentRecordEntity>(employmentRecordAlias, 'date_register')} >= :startDate`,
          { startDate },
        );
      } else if (endDate) {
        query.andWhere(
          `${col<EmploymentRecordEntity>(employmentRecordAlias, 'date_register')} <= :endDate`,
          { endDate },
        );
      }

      const result = await query.getRawOne();
      return Number(result.total_employees);
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  private async getCountConPermisos(filters: FilterDashboardDto): Promise<number> {
    try {
      const {
        startDate, endDate,
        headquarterId, projectId, positionId, departmentId,
        showPendingPermissions
      } = filters;

      const employeeAlias = 'employee';
      const employmentRecordAlias = 'employmentRecord';
      const permissionAlias = 'permission';

      const query = this.dataSource.createQueryBuilder(EmployeeEntity, employeeAlias)
        .select(`COUNT(DISTINCT ${col<EmployeeEntity>(employeeAlias, 'id')})`, 'total_employees')
        .innerJoin(
          `${col<EmployeeEntity>(employeeAlias, 'employmentRecord')}`,
          employmentRecordAlias,
          `${col<EmploymentRecordEntity>(employmentRecordAlias, 'deleted_at')} IS NULL`,
        )
        .innerJoin(
          `${col<EmploymentRecordEntity>(employmentRecordAlias, 'attendancePermissions')}`,
          permissionAlias,
          `${col<AttendancePermission>(permissionAlias, 'deleted_at')} IS NULL`,
        )
        .where(`${col<EmployeeEntity>(employeeAlias, 'status')} IN ('ACTIVE', 'DISMISSAL')`);

      // Filtrar por status de permisos: PENDING si se solicita, APPROVED por defecto
      if (showPendingPermissions) {
        query.andWhere(
          `${col<AttendancePermission>(permissionAlias, 'status')} = :permissionStatus`,
          { permissionStatus: STATUS_VACATIONS_PERMISSION.PENDING }
        );
      } else {
        query.andWhere(
          `${col<AttendancePermission>(permissionAlias, 'status')} = :permissionStatus`,
          { permissionStatus: STATUS_VACATIONS_PERMISSION.APPROVED }
        );
      }

      // Aplicar filtros adicionales si es necesario
      if (headquarterId || projectId || positionId || departmentId) {
        const employeeHasPositionsAlias = 'employeeHasPositions';
        const staffAlias = 'staff';
        const headquarterAlias = 'headquarter';
        const projectAlias = 'project';
        const positionAlias = 'position';
        const departmentAlias = 'department';

        query.innerJoin(
          `${col<EmploymentRecordEntity>(employmentRecordAlias, 'employeeHasPosition')}`,
          employeeHasPositionsAlias,
          `${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'deleted_at')} IS NULL`,
        );

        if (headquarterId || projectId) {
          query.innerJoin(
            `${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'staff')}`,
            staffAlias,
            `${col<StaffEntity>(staffAlias, 'deleted_at')} IS NULL`,
          )
            .innerJoin(
              `${col<StaffEntity>(staffAlias, 'headquarter')}`,
              headquarterAlias,
              `${col<Headquarters>(headquarterAlias, 'deleted_at')} IS NULL`,
            );

          if (headquarterId) {
            query.andWhere(`${col<Headquarters>(headquarterAlias, 'id')} = :headquarterId`, { headquarterId });
          }

          if (projectId) {
            query
              .innerJoin(
                `${col<Headquarters>(headquarterAlias, 'project')}`,
                projectAlias,
                `${col<Project>(projectAlias, 'deleted_at')} IS NULL`,
              )
              .andWhere(`${col<Project>(projectAlias, 'id')} = :projectId`, { projectId });
          }
        }

        if (positionId || departmentId) {
          query.innerJoin(
            `${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'position_id')}`,
            positionAlias,
            `${col<PositionEntity>(positionAlias, 'deleted_at')} IS NULL`,
          );

          if (positionId) {
            query.andWhere(`${col<PositionEntity>(positionAlias, 'id')} = :positionId`, { positionId });
          }

          if (departmentId) {
            query
              .innerJoin(
                `${col<PositionEntity>(positionAlias, 'department')}`,
                departmentAlias,
                `${col<DepartmentEntity>(departmentAlias, 'deleted_at')} IS NULL`,
              )
              .andWhere(`${col<DepartmentEntity>(departmentAlias, 'id')} = :departmentId`, { departmentId });
          }
        }
      }

      // Filtros por fecha
      if (startDate && endDate) {
        query.andWhere(
          `${col<EmploymentRecordEntity>(employmentRecordAlias, 'date_register')} BETWEEN :startDate AND :endDate`,
          { startDate, endDate },
        );
      } else if (startDate) {
        query.andWhere(
          `${col<EmploymentRecordEntity>(employmentRecordAlias, 'date_register')} >= :startDate`,
          { startDate },
        );
      } else if (endDate) {
        query.andWhere(
          `${col<EmploymentRecordEntity>(employmentRecordAlias, 'date_register')} <= :endDate`,
          { endDate },
        );
      }

      const result = await query.getRawOne();
      return Number(result.total_employees);
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  private async getEmployeesList({
    startDate,
    endDate,
    isDismissal = false,
    headquarterId,
    projectId,
    positionId,
    departmentId,
    hasBonds,
    hasActiveBonds,
    hasExpiredBonds,
    bondTypeId
  }: FilterDashboardDto) {
    try {
      const employeeAlias = 'employee';
      const employmentRecordAlias = 'employmentRecord';
      const employeeHasPositionsAlias = 'employeeHasPositions';
      const positionAlias = 'position';
      const departmentAlias = 'department';
      const staffAlias = 'staff';
      const headquarterAlias = 'headquarter';
      const projectAlias = 'project';
      const bondHasEmployeeAlias = 'bondHasEmployee';
      const bondAlias = 'bond';
      const bondTypeAlias = 'bondType';

      const query = this.dataSource.createQueryBuilder(EmployeeEntity, employeeAlias)
        .select([
          `${col<EmployeeEntity>(employeeAlias, 'id')} as employee_id`,
          `CONCAT(
            ${col<EmployeeEntity>(employeeAlias, 'names')}, ' ',
            ${col<EmployeeEntity>(employeeAlias, 'first_last_name')}, ' ',
            COALESCE(${col<EmployeeEntity>(employeeAlias, 'second_last_name')}, '')
          ) as full_name`,
          `${col<EmployeeEntity>(employeeAlias, 'status')} as status`,
          `TO_CHAR(${col<EmploymentRecordEntity>(employmentRecordAlias, 'date_register')}, 'YYYY-MM-DD') as entry_date`,
          `TO_CHAR(${col<EmploymentRecordEntity>(employmentRecordAlias, 'date_end')}, 'YYYY-MM-DD') as exit_date`,
        ])
        .innerJoin(
          `${col<EmployeeEntity>(employeeAlias, 'employmentRecord')}`,
          employmentRecordAlias,
          `${col<EmploymentRecordEntity>(employmentRecordAlias, 'deleted_at')} IS NULL`,
        )
        .where(`${col<EmployeeEntity>(employeeAlias, 'status')} = :status`,
          { status: isDismissal ? 'DISMISSAL' : 'ACTIVE' }
        );

      // Para empleados activos, el contrato debe estar vigente (date_end IS NULL)
      // Para empleados despedidos, el contrato debe haber terminado (date_end IS NOT NULL)
      if (isDismissal) {
        query.andWhere(`${col<EmploymentRecordEntity>(employmentRecordAlias, 'date_end')} IS NOT NULL`);
      } else {
        query.andWhere(`${col<EmploymentRecordEntity>(employmentRecordAlias, 'date_end')} IS NULL`);
      }

      // Variable para saber si ya hicimos el join con employeeHasPositions
      let hasEmployeeHasPositionsJoin = false;
      let hasPositionJoin = false;

      // Joins adicionales para los filtros de posición, departamento, sede y proyecto
      if (positionId || departmentId || headquarterId || projectId) {
        query.innerJoin(
          `${col<EmploymentRecordEntity>(employmentRecordAlias, 'employeeHasPosition')}`,
          employeeHasPositionsAlias,
          `${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'deleted_at')} IS NULL`,
        );
        hasEmployeeHasPositionsJoin = true;

        // Join con Position si se filtra por positionId o departmentId
        if (positionId || departmentId) {
          query
            .innerJoin(
              `${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'position_id')}`,
              positionAlias,
              `${col<PositionEntity>(positionAlias, 'deleted_at')} IS NULL`,
            )
            .addSelect(`${col<PositionEntity>(positionAlias, 'name')} as position_name`)
            .addSelect(`${col<PositionEntity>(positionAlias, 'id')} as position_id`);
          hasPositionJoin = true;

          // Filtro por positionId
          if (positionId) {
            query.andWhere(`${col<PositionEntity>(positionAlias, 'id')} = :positionId`, { positionId });
          }

          // Join con Department si se filtra por departmentId
          if (departmentId) {
            query
              .innerJoin(
                `${col<PositionEntity>(positionAlias, 'department')}`,
                departmentAlias,
                `${col<DepartmentEntity>(departmentAlias, 'deleted_at')} IS NULL`,
              )
              .addSelect(`${col<DepartmentEntity>(departmentAlias, 'name')} as department_name`)
              .andWhere(`${col<DepartmentEntity>(departmentAlias, 'id')} = :departmentId`, { departmentId });
          } else {
            // Si no filtramos por departamento pero sí por posición, incluimos el departamento en el select
            query
              .leftJoin(
                `${col<PositionEntity>(positionAlias, 'department')}`,
                departmentAlias,
                `${col<DepartmentEntity>(departmentAlias, 'deleted_at')} IS NULL`,
              )
              .addSelect(`${col<DepartmentEntity>(departmentAlias, 'name')} as department_name`);
          }
        }

        // Join con Staff, Headquarters y Project si se filtra por sede o proyecto
        if (headquarterId || projectId) {
          query
            .innerJoin(
              `${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'staff')}`,
              staffAlias,
              `${col<StaffEntity>(staffAlias, 'deleted_at')} IS NULL`,
            )
            .addSelect(`${col<StaffEntity>(staffAlias, 'id')} as staff_id`);

          query
            .innerJoin(
              `${col<StaffEntity>(staffAlias, 'headquarter')}`,
              headquarterAlias,
              `${col<Headquarters>(headquarterAlias, 'deleted_at')} IS NULL`,
            )
            .addSelect(`${col<Headquarters>(headquarterAlias, 'name')} as headquarter_name`);

          // Filtro por headquarterId
          if (headquarterId) {
            query.andWhere(`${col<Headquarters>(headquarterAlias, 'id')} = :headquarterId`, { headquarterId });
          }

          // Join con Project si se filtra por projectId
          if (projectId) {
            query
              .innerJoin(
                `${col<Headquarters>(headquarterAlias, 'project')}`,
                projectAlias,
                `${col<Project>(projectAlias, 'deleted_at')} IS NULL`,
              )
              .addSelect(`${col<Project>(projectAlias, 'name')} as project_name`);
            query.andWhere(`${col<Project>(projectAlias, 'id')} = :projectId`, { projectId });
          } else {
            // Incluir project aunque no se filtre por él
            query
              .leftJoin(
                `${col<Headquarters>(headquarterAlias, 'project')}`,
                projectAlias,
                `${col<Project>(projectAlias, 'deleted_at')} IS NULL`,
              )
              .addSelect(`${col<Project>(projectAlias, 'name')} as project_name`);
          }
        }
      }

      // Si no se hizo join con position pero queremos mostrar posición y departamento
      if (!hasEmployeeHasPositionsJoin) {
        query
          .leftJoin(
            `${col<EmploymentRecordEntity>(employmentRecordAlias, 'employeeHasPosition')}`,
            employeeHasPositionsAlias,
            `${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'deleted_at')} IS NULL`,
          )
          .leftJoin(
            `${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'position_id')}`,
            positionAlias,
            `${col<PositionEntity>(positionAlias, 'deleted_at')} IS NULL`,
          )
          .leftJoin(
            `${col<PositionEntity>(positionAlias, 'department')}`,
            departmentAlias,
            `${col<DepartmentEntity>(departmentAlias, 'deleted_at')} IS NULL`,
          )
          .leftJoin(
            `${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'staff')}`,
            staffAlias,
            `${col<StaffEntity>(staffAlias, 'deleted_at')} IS NULL`,
          )
          .addSelect(`${col<PositionEntity>(positionAlias, 'name')} as position_name`)
          .addSelect(`${col<PositionEntity>(positionAlias, 'id')} as position_id`)
          .addSelect(`${col<DepartmentEntity>(departmentAlias, 'name')} as department_name`)
          .addSelect(`${col<StaffEntity>(staffAlias, 'id')} as staff_id`);
      } else if (!hasPositionJoin) {
        // Si hicimos join con employeeHasPositions pero no con position
        query
          .leftJoin(
            `${col<EmployeeHasPositions>(employeeHasPositionsAlias, 'position_id')}`,
            positionAlias,
            `${col<PositionEntity>(positionAlias, 'deleted_at')} IS NULL`,
          )
          .leftJoin(
            `${col<PositionEntity>(positionAlias, 'department')}`,
            departmentAlias,
            `${col<DepartmentEntity>(departmentAlias, 'deleted_at')} IS NULL`,
          )
          .addSelect(`${col<PositionEntity>(positionAlias, 'name')} as position_name`)
          .addSelect(`${col<PositionEntity>(positionAlias, 'id')} as position_id`)
          .addSelect(`${col<DepartmentEntity>(departmentAlias, 'name')} as department_name`);
      }

      // Filtros por fecha
      if (startDate && endDate) {
        query.andWhere(
          `${col<EmploymentRecordEntity>(employmentRecordAlias, 'date_register')} 
          BETWEEN :startDate AND :endDate`,
          { startDate, endDate },
        );
      } else if (startDate) {
        query.andWhere(
          `${col<EmploymentRecordEntity>(employmentRecordAlias, 'date_register')} >= :startDate`,
          { startDate },
        );
      } else if (endDate) {
        query.andWhere(
          `${col<EmploymentRecordEntity>(employmentRecordAlias, 'date_register')} <= :endDate`,
          { endDate },
        );
      }

      // Filtros y datos de bonos
      if (hasBonds || hasActiveBonds || hasExpiredBonds || bondTypeId) {
        query
          .innerJoin(
            `${col<EmploymentRecordEntity>(employmentRecordAlias, 'bondHasEmployee')}`,
            bondHasEmployeeAlias,
            `${col<BondHasEmployee>(bondHasEmployeeAlias, 'deleted_at')} IS NULL`,
          )
          .innerJoin(
            `${col<BondHasEmployee>(bondHasEmployeeAlias, 'bond')}`,
            bondAlias,
            `${col<BondEntity>(bondAlias, 'deleted_at')} IS NULL`,
          )
          .addSelect(`${col<BondHasEmployee>(bondHasEmployeeAlias, 'id')} as bond_assignment_id`)
          .addSelect(`${col<BondEntity>(bondAlias, 'amount')} as bond_amount`)
          .addSelect(`TO_CHAR(${col<BondHasEmployee>(bondHasEmployeeAlias, 'date_assigned')}, 'YYYY-MM-DD') as bond_date_assigned`)
          .addSelect(`TO_CHAR(${col<BondHasEmployee>(bondHasEmployeeAlias, 'date_limit')}, 'YYYY-MM-DD') as bond_date_limit`);

        // Filtrar bonos activos
        if (hasActiveBonds) {
          const referenceDate = endDate || new Date();
          query.andWhere(
            `${col<BondHasEmployee>(bondHasEmployeeAlias, 'date_limit')} >= :referenceDate`,
            { referenceDate },
          );
        }

        // Filtrar bonos vencidos
        if (hasExpiredBonds) {
          const referenceDate = endDate || new Date();
          if (startDate) {
            query.andWhere(
              `${col<BondHasEmployee>(bondHasEmployeeAlias, 'date_limit')} BETWEEN :startDate AND :referenceDate`,
              { startDate, referenceDate },
            );
          } else {
            query.andWhere(
              `${col<BondHasEmployee>(bondHasEmployeeAlias, 'date_limit')} < :referenceDate`,
              { referenceDate },
            );
          }
        }

        // Filtrar por tipo de bono
        if (bondTypeId) {
          query
            .innerJoin(
              `${col<BondEntity>(bondAlias, 'type_id')}`,
              bondTypeAlias,
              `${col<TypesBondEntity>(bondTypeAlias, 'deleted_at')} IS NULL`,
            )
            .addSelect(`${col<TypesBondEntity>(bondTypeAlias, 'type')} as bond_type`)
            .andWhere(`${col<TypesBondEntity>(bondTypeAlias, 'id')} = :bondTypeId`, { bondTypeId });
        } else {
          // Si no hay filtro por tipo, incluir el tipo en el select de todas formas
          query
            .leftJoin(
              `${col<BondEntity>(bondAlias, 'type_id')}`,
              bondTypeAlias,
              `${col<TypesBondEntity>(bondTypeAlias, 'deleted_at')} IS NULL`,
            )
            .addSelect(`${col<TypesBondEntity>(bondTypeAlias, 'type')} as bond_type`);
        }
      } else {
        // Si no hay filtros de bonos pero queremos mostrar bonos si existen
        query
          .leftJoin(
            `${col<EmploymentRecordEntity>(employmentRecordAlias, 'bondHasEmployee')}`,
            bondHasEmployeeAlias,
            `${col<BondHasEmployee>(bondHasEmployeeAlias, 'deleted_at')} IS NULL`,
          )
          .leftJoin(
            `${col<BondHasEmployee>(bondHasEmployeeAlias, 'bond')}`,
            bondAlias,
            `${col<BondEntity>(bondAlias, 'deleted_at')} IS NULL`,
          )
          .leftJoin(
            `${col<BondEntity>(bondAlias, 'type_id')}`,
            bondTypeAlias,
            `${col<TypesBondEntity>(bondTypeAlias, 'deleted_at')} IS NULL`,
          )
          .addSelect(`${col<BondHasEmployee>(bondHasEmployeeAlias, 'id')} as bond_assignment_id`)
          .addSelect(`${col<BondEntity>(bondAlias, 'amount')} as bond_amount`)
          .addSelect(`TO_CHAR(${col<BondHasEmployee>(bondHasEmployeeAlias, 'date_assigned')}, 'YYYY-MM-DD') as bond_date_assigned`)
          .addSelect(`TO_CHAR(${col<BondHasEmployee>(bondHasEmployeeAlias, 'date_limit')}, 'YYYY-MM-DD') as bond_date_limit`)
          .addSelect(`${col<TypesBondEntity>(bondTypeAlias, 'type')} as bond_type`);
      }

      const results = await query.getRawMany();

      return results.map(row => ({
        employee_id: row.employee_id,
        staff_id: row.staff_id || null,
        full_name: row.full_name?.trim(),
        status: row.status,
        entry_date: row.entry_date,
        exit_date: row.exit_date,
        position: {
          id: row.position_id || null,
          name: row.position_name || null,
        },
        department: {
          id: row.department_id || null,
          name: row.department_name || null,
        },
        headquarter: {
          id: row.headquarter_id || null,
          name: row.headquarter_name || null,
        },
        project: {
          id: row.project_id || null,
          name: row.project_name || null,
        },
        bond: row.bond_assignment_id ? {
          assignment_id: row.bond_assignment_id,
          amount: Number(row.bond_amount),
          type: row.bond_type || null,
          date_assigned: row.bond_date_assigned,
          date_limit: row.bond_date_limit,
          is_active: row.bond_date_limit ? new Date(row.bond_date_limit).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0) : null,
        } : null,
      }));
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  // ==================== FUNCIONES PARA DATOS DE GRÁFICAS ====================

  private async getChartData(filters: FilterDashboardDto): Promise<IChartData> {
    try {
      let {
        startDate,
        endDate,
        groupBy,
        isDismissal,
        hasBonds,
        hasActiveBonds,
        hasExpiredBonds,
        bondTypeId
      } = filters;

      // Auto-determinar groupBy si no se especifica, basado en el rango de fechas
      if (!groupBy && startDate && endDate) {
        const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 7) {
          groupBy = GroupByPeriod.DAY;
        } else if (daysDiff <= 60) {
          groupBy = GroupByPeriod.WEEK;
        } else if (daysDiff <= 365) {
          groupBy = GroupByPeriod.MONTH;
        } else {
          groupBy = GroupByPeriod.YEAR;
        }
      } else if (!groupBy) {
        groupBy = GroupByPeriod.MONTH;
      }

      // Validar que existan fechas para agrupar
      if (!startDate || !endDate) {
        throw new Error('Se requieren startDate y endDate para generar datos de gráficas');
      }

      // Generar categorías (períodos) según el tipo de agrupación
      const categories = this.generateCategories(startDate, endDate, groupBy);

      // Determinar qué series generar basado en los filtros (igual que summary)
      const seriesToGenerate: Promise<{ name: string; data: number[] }>[] = [];

      // Serie: Total (con todos los filtros aplicados)
      seriesToGenerate.push(this.getChartTotal(filters, categories, groupBy));

      // Series de status
      if (isDismissal === true) {
        seriesToGenerate.push(this.getChartDespidos(filters, categories, groupBy));
      } else if (isDismissal === false) {
        seriesToGenerate.push(this.getChartActivos(filters, categories, groupBy));
      } else {
        // Mostrar ambos si no se especifica
        seriesToGenerate.push(this.getChartActivos(filters, categories, groupBy));
        seriesToGenerate.push(this.getChartDespidos(filters, categories, groupBy));
      }

      // Serie de bonos (solo si hay filtros de bonos)
      if (hasBonds || hasActiveBonds || hasExpiredBonds || bondTypeId) {
        seriesToGenerate.push(this.getChartConBonos(filters, categories, groupBy));
      }

      // Series de vacaciones y permisos (siempre)
      seriesToGenerate.push(this.getChartVacaciones(filters, categories, groupBy));
      seriesToGenerate.push(this.getChartPermisos(filters, categories, groupBy));

      // Obtener todas las series en paralelo
      const series = await Promise.all(seriesToGenerate);

      return {
        categories: categories.map(c => c.label),
        series,
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  private generateCategories(
    startDate: Date,
    endDate: Date,
    groupBy: GroupByPeriod
  ): Array<{ label: string; start: Date; end: Date }> {
    const categories: Array<{ label: string; start: Date; end: Date }> = [];
    
    // Normalizar fechas al inicio/fin del día en la zona horaria local
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    const current = new Date(start);

    while (current <= end) {
      let periodStart: Date;
      let periodEnd: Date;
      let label: string;

      switch (groupBy) {
        case GroupByPeriod.DAY:
          periodStart = new Date(current);
          periodStart.setHours(0, 0, 0, 0);
          periodEnd = new Date(current);
          periodEnd.setHours(23, 59, 59, 999);
          label = `${current.getDate().toString().padStart(2, '0')} ${current.toLocaleString('es', { month: 'short' })}`;
          current.setDate(current.getDate() + 1);
          break;

        case GroupByPeriod.WEEK:
          periodStart = new Date(current);
          periodStart.setHours(0, 0, 0, 0);
          periodEnd = new Date(current);
          periodEnd.setDate(periodEnd.getDate() + 6);
          periodEnd.setHours(23, 59, 59, 999);
          if (periodEnd > end) {
            periodEnd = new Date(end);
            periodEnd.setHours(23, 59, 59, 999);
          }
          label = `S${this.getWeekNumber(periodStart)}-${periodStart.getFullYear()}`;
          current.setDate(current.getDate() + 7);
          break;

        case GroupByPeriod.MONTH:
          // Inicio del mes actual o inicio del rango si estamos en el primer mes
          if (current.getTime() === start.getTime()) {
            periodStart = new Date(start);
          } else {
            periodStart = new Date(current.getFullYear(), current.getMonth(), 1);
          }
          periodStart.setHours(0, 0, 0, 0);

          // Fin del mes
          periodEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
          periodEnd.setHours(23, 59, 59, 999);

          // Ajustar si excede el rango solicitado
          if (periodEnd > end) {
            periodEnd = new Date(end);
            periodEnd.setHours(23, 59, 59, 999);
          }

          label = `${current.toLocaleString('es', { month: 'short' })} ${current.getFullYear()}`;

          // Avanzar al siguiente mes
          current.setMonth(current.getMonth() + 1);
          current.setDate(1);
          break;

        case GroupByPeriod.YEAR:
          // Inicio del año actual o inicio del rango si estamos en el primer año
          if (current.getTime() === start.getTime()) {
            periodStart = new Date(start);
          } else {
            periodStart = new Date(current.getFullYear(), 0, 1);
          }
          periodStart.setHours(0, 0, 0, 0);

          // Fin del año
          periodEnd = new Date(current.getFullYear(), 11, 31);
          periodEnd.setHours(23, 59, 59, 999);

          // Ajustar si excede el rango solicitado
          if (periodEnd > end) {
            periodEnd = new Date(end);
            periodEnd.setHours(23, 59, 59, 999);
          }

          label = current.getFullYear().toString();

          // Avanzar al siguiente año
          current.setFullYear(current.getFullYear() + 1);
          current.setMonth(0);
          current.setDate(1);
          break;

        default:
          throw new Error(`Tipo de agrupación no soportado: ${groupBy}`);
      }

      categories.push({
        label,
        start: periodStart,
        end: periodEnd,
      });
    }

    return categories;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  private async getChartTotal(
    filters: FilterDashboardDto,
    categories: Array<{ label: string; start: Date; end: Date }>,
    groupBy: GroupByPeriod
  ): Promise<{ name: string; data: number[] }> {
    try {
      const data: number[] = [];

      for (const period of categories) {
        const periodFilters = {
          ...filters,
          startDate: period.start,
          endDate: period.end,
        };
        const count = await this.getCountByFilters(periodFilters);
        data.push(count);
      }

      return { name: 'Total', data };
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  private async getChartActivos(
    filters: FilterDashboardDto,
    categories: Array<{ label: string; start: Date; end: Date }>,
    groupBy: GroupByPeriod
  ): Promise<{ name: string; data: number[] }> {
    try {
      const data: number[] = [];

      for (const period of categories) {
        const periodFilters = {
          ...filters,
          isDismissal: false,
          startDate: period.start,
          endDate: period.end,
        };
        const count = await this.getCountByStatus(periodFilters);
        data.push(count);
      }

      return { name: 'Empleados Activos', data };
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  private async getChartDespidos(
    filters: FilterDashboardDto,
    categories: Array<{ label: string; start: Date; end: Date }>,
    groupBy: GroupByPeriod
  ): Promise<{ name: string; data: number[] }> {
    try {
      const data: number[] = [];

      for (const period of categories) {
        const periodFilters = {
          ...filters,
          isDismissal: true,
          startDate: period.start,
          endDate: period.end,
        };
        const count = await this.getCountByStatus(periodFilters);
        data.push(count);
      }

      return { name: 'Empleados Despedidos', data };
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  private async getChartConBonos(
    filters: FilterDashboardDto,
    categories: Array<{ label: string; start: Date; end: Date }>,
    groupBy: GroupByPeriod
  ): Promise<{ name: string; data: number[] }> {
    try {
      const data: number[] = [];

      for (const period of categories) {
        const periodFilters = {
          ...filters,
          hasBonds: true,
          startDate: period.start,
          endDate: period.end,
        };
        const count = await this.getCountConBonos(periodFilters);
        data.push(count);
      }

      return { name: 'Empleados con Bonos', data };
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }


  private async getChartVacaciones(
    filters: FilterDashboardDto,
    categories: Array<{ label: string; start: Date; end: Date }>,
    groupBy: GroupByPeriod
  ): Promise<{ name: string; data: number[] }> {
    try {
      const data: number[] = [];

      for (const period of categories) {
        const periodFilters = {
          ...filters,
          startDate: period.start,
          endDate: period.end,
        };
        const count = await this.getCountConVacaciones(periodFilters);
        data.push(count);
      }

      return { name: 'Empleados con Vacaciones', data };
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  private async getChartPermisos(
    filters: FilterDashboardDto,
    categories: Array<{ label: string; start: Date; end: Date }>,
    groupBy: GroupByPeriod
  ): Promise<{ name: string; data: number[] }> {
    try {
      const data: number[] = [];

      for (const period of categories) {
        const periodFilters = {
          ...filters,
          startDate: period.start,
          endDate: period.end,
        };
        const count = await this.getCountConPermisos(periodFilters);
        data.push(count);
      }

      return { name: 'Empleados con Permisos', data };
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

}