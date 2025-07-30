import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { CreateTypeDocumentDto, UpdateTypeDocumentDto } from './dto';
import { TypeDocumentService } from './typeDocument.service';

import { FindOneDto, PaginationDto } from '../common';

@Controller({ path: 'type-document', version: '1' })
export class TypeDocumentController {
  constructor(private readonly typeDocumentService: TypeDocumentService) {}

  @MessagePattern('createTypeDocument')
  async create(@Payload() createTypeDocumentDto: CreateTypeDocumentDto) {
    return await this.typeDocumentService.create(createTypeDocumentDto);
  }

  @MessagePattern('findAllTypeDocument')
  async findAll(@Payload() pagination: PaginationDto) {
    return await this.typeDocumentService.findAll(pagination);
  }

  @MessagePattern('findOneTypeDocument')
  async findOne(@Payload() { term }: FindOneDto) {
    return await this.typeDocumentService.findOne({ term });
  }

  @MessagePattern('updateTypeDocument')
  async updated(@Payload() updateTypeDocumentDto: UpdateTypeDocumentDto) {
    return await this.typeDocumentService.updated(updateTypeDocumentDto);
  }
}
