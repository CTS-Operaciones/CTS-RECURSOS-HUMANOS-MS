import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

import {
  FindOneDto,
  FindOneWhitTermAndRelationDto,
  PaginationRelationsDto,
} from '../common';
import { FindDocumentsDto } from './dto';

@Controller({ path: 'document', version: '1' })
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @MessagePattern('createDocument')
  create(@Payload() { files }: { files: CreateDocumentDto[] }) {
    return this.documentService.create(files);
  }

  @MessagePattern('findAllDocument')
  findAll(@Payload() pagination: FindDocumentsDto) {
    return this.documentService.findAllForEmployee(pagination);
  }

  //TODO: Verificar el tipado por que da Inyternal server Error
  @MessagePattern('findOneDocument')
  findOne(
    @Payload()
    { term }: FindOneDto,
  ) {
    return this.documentService.findOneDocument({ term });
  }

  // TODO: Verificar el tipado.
  @MessagePattern('updateDocument')
  update(@Payload() updateDocumentDto: any) {
    return this.documentService.update(updateDocumentDto as UpdateDocumentDto);
  }

  @MessagePattern('removeDocument')
  remove(@Payload() { id }: { id: number }) {
    return this.documentService.remove(id);
  }
}
