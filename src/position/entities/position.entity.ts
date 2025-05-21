import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToOne,
} from 'typeorm';

import { BaseEntity } from '../../../common/config';
import { DepartmentEntity } from '../../department/entities/department.entity';
import { EmployeeEntity } from '../../employee/entities/employee.entity';

import { IPosition } from '../../../common/interfaces';

@Entity('positions')
export class PositionEntity extends BaseEntity implements IPosition {
  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'money', nullable: false })
  salary: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  salary_in_words: string;

  // Relations
  @ManyToOne(() => DepartmentEntity, (department) => department.position_id)
  department_id: DepartmentEntity;

  @OneToOne(() => EmployeeEntity, (employee) => employee.position_id)
  employee_id: EmployeeEntity;

  //Transforms
  @BeforeInsert()
  nameToUpperCase() {
    this.name = this.name.toUpperCase();
    this.salary_in_words = this.salary_in_words.toUpperCase();
  }

  @BeforeUpdate()
  nameToUpperCaseUpdate() {
    this.name = this.name.toUpperCase();
    this.salary_in_words = this.salary_in_words.toUpperCase();
  }
}
