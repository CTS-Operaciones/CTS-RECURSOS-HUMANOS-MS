import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity, ITypeDocument } from '../../common';
import { DocumentEntity } from './document.entity';

@Entity('type_document')
export class TypeDocumentEntity extends BaseEntity implements ITypeDocument {
  @Column({ type: 'varchar', length: 100, nullable: false })
  type: string;

  @OneToMany(() => DocumentEntity, (document) => document.type)
  documents: DocumentEntity[];
}
