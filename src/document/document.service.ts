import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentEntity } from './entities';

import { EmployeeService } from '../employee/employee.service';
import { TypeDocumentService } from './typeDocument.service';

import {
  createResult,
  deleteResult,
  ErrorManager,
  findOneByTerm,
  FindOneWhitTermAndRelationDto,
  PaginationRelationsDto,
  paginationResult,
  updateResult,
} from '../common';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    private readonly employeeService: EmployeeService,
    private readonly typeDocumentService: TypeDocumentService,
  ) {}
  async create(createDocumentDto: CreateDocumentDto) {
    try {
      const { type: _type, employee: _employee, ...rest } = createDocumentDto;

      const employee = await this.employeeService.getItem({ term: _employee });

      const type = await this.typeDocumentService.findOne({
        term: _type,
      });

      const docuement = await createResult(
        this.documentRepository,
        { ...rest, type, employee },
        DocumentEntity,
      );

      return docuement;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findAll(pagination: PaginationRelationsDto) {
    try {
      const { all, limit, page, relations } = pagination;
      const options: FindManyOptions<DocumentEntity> = {};

      if (relations) {
        options.relations = {
          type: true,
          employee: true,
        };
      }

      return await paginationResult(this.documentRepository, {
        all,
        limit,
        page,
        options,
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findOne({ term, relations }: FindOneWhitTermAndRelationDto) {
    try {
      const options: FindOneOptions<DocumentEntity> = {};

      if (relations) {
        options.relations = {
          type: true,
          employee: true,
        };
      }

      return await findOneByTerm({
        repository: this.documentRepository,
        term,
        options,
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async update({ id, ...updateDocumentDto }: UpdateDocumentDto) {
    try {
      const { type: _type, employee: _employee, ...rest } = updateDocumentDto;

      const document = await this.findOne({ term: id, relations: true });

      if (_type && document.type.id !== _type) {
        const typeDocument = await this.typeDocumentService.findOne({
          term: _type,
        });

        document.type = typeDocument;
      }

      if (_employee && document.employee.id !== _employee) {
        const employee = await this.employeeService.getItem({
          term: _employee,
        });

        document.employee = employee;
      }

      Object.assign(document, updateDocumentDto);

      return await updateResult(this.documentRepository, id, document);
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async remove(id: number) {
    try {
      const document = await deleteResult(this.documentRepository, id);

      return document;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }
}
