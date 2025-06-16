import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity, TypeDocumentEntity } from 'cts-entities';

import { EmployeeModule } from '../employee/employee.module';

import { DocumentService } from './document.service';
import { TypeDocumentService } from './typeDocument.service';
import { DocumentController } from './document.controller';
import { TypeDocumentController } from './typeDocument.controller';

const entities = [DocumentEntity, TypeDocumentEntity];

const servicesImport = [EmployeeModule];
@Module({
  imports: [TypeOrmModule.forFeature(entities), ...servicesImport],
  controllers: [DocumentController, TypeDocumentController],
  providers: [DocumentService, TypeDocumentService],
  exports: [DocumentService, TypeDocumentService],
})
export class DocumentModule {}
