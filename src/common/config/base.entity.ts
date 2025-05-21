import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @Column({ default: true, select: false })
  available: boolean;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({
    select: false,
    nullable: true,
  })
  @Exclude()
  deleted_at: Date;
}
