import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToOne,
} from 'typeorm';

import { BaseEntity, IPosition } from '../../common';
import { DepartmentEntity } from '../../department/entities/department.entity';
import { EmployeeEntity } from '../../employee/entities/employee.entity';
import { SalaryEntity } from './salary.entity';

@Entity('positions')
export class PositionEntity extends BaseEntity implements IPosition {
  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  // Relations
  @ManyToOne(() => SalaryEntity, (salary) => salary.positions, {
    cascade: true,
  })
  salary: SalaryEntity;

  @ManyToOne(() => DepartmentEntity, (department) => department.positions)
  department: DepartmentEntity;

  //TODO: La relación sera con el staff del proyecto/sede
  @OneToOne(() => EmployeeEntity, (employee) => employee.position)
  employee: EmployeeEntity;
}
