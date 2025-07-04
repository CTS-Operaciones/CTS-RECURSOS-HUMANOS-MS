import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { TypeDocumentEntity } from 'cts-entities';

import { CreateTypeDocumentDto, UpdateTypeDocumentDto } from './dto';
import {
  createResult,
  ErrorManager,
  findOneByTerm,
  FindOneDto,
  PaginationDto,
  paginationResult,
  updateResult,
} from '../common';

@Injectable()
export class TypeDocumentService {
  constructor(
    @InjectRepository(TypeDocumentEntity)
    private readonly typeDocumentRepository: Repository<TypeDocumentEntity>,
  ) {}

  async create(createTypeDocumentDto: CreateTypeDocumentDto) {
    try {
      const { type } = createTypeDocumentDto;

      const typeDocument = await createResult(
        this.typeDocumentRepository,
        { type },
        TypeDocumentEntity,
      );

      return typeDocument;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findAll(pagination: PaginationDto) {
    try {
      const options: FindManyOptions<TypeDocumentEntity> = {};

      return await paginationResult(this.typeDocumentRepository, {
        ...pagination,
        options,
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findOne({ term }: FindOneDto) {
    try {
      const typeDocument = await findOneByTerm<TypeDocumentEntity>({
        repository: this.typeDocumentRepository,
        term,
        options: {},
      });

      return typeDocument;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async updated({ id, type }: UpdateTypeDocumentDto) {
    try {
      const typeDocument = await this.findOne({
        term: id,
      });

      if (type && typeDocument.type !== type) {
        typeDocument.type = type;
      }

      return await updateResult(this.typeDocumentRepository, id, typeDocument);
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }
}
