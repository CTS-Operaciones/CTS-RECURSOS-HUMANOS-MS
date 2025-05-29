import { Column, Entity, OneToMany } from 'typeorm';
import { PositionEntity } from './position.entity';

import { BaseEntity, ISalary } from '../../common';

@Entity({ name: 'salary' })
export class SalaryEntity extends BaseEntity implements ISalary {
  @Column({ type: 'money', nullable: false })
  amount: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  salary_in_words: string;

  @OneToMany(() => PositionEntity, (position) => position.salary)
  positions: PositionEntity[];
}
