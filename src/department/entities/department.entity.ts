import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';

import { BaseEntity } from '../../../common/config';
import { PositionEntity } from '../../position/entities/position.entity';

import { IDepartment } from '../../../common/interfaces';

@Entity('departments')
export class DepartmentEntity extends BaseEntity implements IDepartment {
  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  abreviation?: string;

  @OneToMany(() => PositionEntity, (position) => position.department_id)
  position_id: PositionEntity[];

  // Transforms
  @BeforeInsert()
  nameToUpperCase() {
    this.name = this.name.toUpperCase();
    this.abreviation = this.abreviation?.toUpperCase();
  }

  @BeforeUpdate()
  nameToUpperCaseUpdate() {
    this.name = this.name.toUpperCase();
    this.abreviation = this.abreviation?.toUpperCase();
  }
}
