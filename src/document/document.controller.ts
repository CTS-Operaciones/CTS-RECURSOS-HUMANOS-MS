import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

import {
  FindOneWhitTermAndRelationDto,
  PaginationRelationsDto,
} from '../common';

@Controller({ path: 'document', version: '1' })
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @MessagePattern('createDocument')
  create(@Payload() { files }: { files: CreateDocumentDto[] }) {
    return this.documentService.create(files);
  }

  @MessagePattern('findAllDocument')
  findAll(@Payload() pagination: PaginationRelationsDto) {
    return this.documentService.findAll(pagination);
  }

  //TODO: Verificar el tipado por que da Inyternal server Error
  @MessagePattern('findOneDocument')
  findOne(
    @Payload()
    { term, relations }: FindOneWhitTermAndRelationDto,
  ) {
    return this.documentService.findOne({ term, relations });
  }

  @MessagePattern('updateDocument')
  update(@Payload() updateDocumentDto: UpdateDocumentDto) {
    return this.documentService.update(updateDocumentDto);
  }

  @MessagePattern('removeDocument')
  remove(@Payload() { id }: { id: number }) {
    return this.documentService.remove(id);
  }
}
