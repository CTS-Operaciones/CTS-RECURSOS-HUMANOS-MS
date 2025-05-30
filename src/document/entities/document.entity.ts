import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity, IDocument, IEmployee } from '../../common';

import { EmployeeEntity } from '../../employee/entities/employee.entity';
import { TypeDocumentEntity } from './types_document.entity';

@Entity('document')
export class DocumentEntity extends BaseEntity implements IDocument {
  @Column({ type: 'text', nullable: false })
  url_file: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  size?: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  // Relations
  @ManyToOne(() => TypeDocumentEntity, (type) => type.documents)
  type: TypeDocumentEntity;

  @OneToOne(() => EmployeeEntity, (employee) => employee.document)
  @JoinColumn()
  employee: EmployeeEntity;
}
