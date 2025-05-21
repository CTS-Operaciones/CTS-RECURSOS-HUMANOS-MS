import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { IEmployee, IEmergencyContact } from '../../../common/interfaces';
import { BaseEntity } from '../../../common/config';
import { PositionEntity } from '../../position/entities/position.entity';
import { StaffEntity } from '../../../operations/staff/entities/staff.entity';
import { User } from '../../../auth/entities/user.entity';

import {
  BLOOD_TYPE,
  GENDER,
  NACIONALITY_EMPLOYEE,
  STATUS_CIVIL,
  STATUS_EMPLOYEE,
} from '../../../common/constants';
import { setYearOld } from '../utils/setYerarOld';

@Entity({ name: 'employees' })
export class EmployeeEntity extends BaseEntity implements IEmployee {
  @Column({ type: 'varchar', length: 100 })
  names: string;

  @Column({ type: 'varchar', length: 100 })
  first_last_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  second_last_name?: string;

  @Column({ type: 'date', nullable: false })
  date_birth: string;

  @Column({ type: 'int', nullable: false, default: 0 })
  year_old?: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  telephone?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  address?: string;

  @Column({
    type: 'enum',
    enum: GENDER,
    nullable: false,
  })
  gender: GENDER;

  @Column({ type: 'varchar', length: 18 })
  curp: string;

  @Column({ type: 'varchar', length: 13 })
  rfc: string;

  @Column({ type: 'varchar', length: 11 })
  nss: string;

  @Column({ type: 'varchar', length: 13 })
  ine_number: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  alergy?: string;

  @Column({ type: 'json', nullable: true })
  emergency_contact?: IEmergencyContact[];

  @Column({
    type: 'enum',
    enum: NACIONALITY_EMPLOYEE,
    nullable: false,
    default: NACIONALITY_EMPLOYEE.MEXICAN,
  })
  nacionality: NACIONALITY_EMPLOYEE;

  @Column({
    type: 'enum',
    enum: STATUS_EMPLOYEE,
    default: STATUS_EMPLOYEE.ACTIVE,
  })
  status: STATUS_EMPLOYEE;

  @Column({
    type: 'enum',
    enum: BLOOD_TYPE,
    nullable: true,
  })
  blood_type?: BLOOD_TYPE;

  @Column({
    type: 'enum',
    enum: STATUS_CIVIL,
    nullable: true,
  })
  status_civil?: STATUS_CIVIL;

  // Relations
  @OneToOne(() => PositionEntity, (position) => position.employee_id, {
    nullable: false,
  })
  @JoinColumn({ name: 'position_id' })
  position_id: PositionEntity;

  @OneToMany(() => StaffEntity, (staff) => staff.employee_id)
  staff_id: StaffEntity[];

  @OneToOne(() => User, (user) => user.employee_id)
  user_id: User;

  @BeforeInsert()
  setYearOld() {
    if (this.date_birth && !this.year_old) {
      this.year_old = setYearOld(this.date_birth);
    }

    if (this.email) {
      this.email = this.email.toLowerCase();
    }
  }
}
