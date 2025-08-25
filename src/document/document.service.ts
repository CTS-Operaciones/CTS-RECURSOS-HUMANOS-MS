import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { DocumentEntity } from 'cts-entities';

import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

import { EmployeeService } from '../employee/employee.service';
import { TypeDocumentService } from './typeDocument.service';

import {
  createResult,
  deleteResult,
  ErrorManager,
  findOneByTerm,
  FindOneDto,
  FindOneWhitTermAndRelationDto,
  IResponseUpdateDocument,
  PaginationRelationsDto,
  paginationResult,
  runInTransaction,
  updateResult,
  validateExistence,
} from '../common';
import { FindDocumentsDto } from './dto';

@Injectable()
export class DocumentService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    private readonly employeeService: EmployeeService,
    private readonly typeDocumentService: TypeDocumentService,
  ) {}
  async create(createDocumentDto: CreateDocumentDto[]) {
    try {
      const employee = await this.employeeService.getItem({
        term: createDocumentDto[0].employee,
      });

      // TODO: #1 Validar que el empleado no tenga este tipo de documento registrado antes
      return await runInTransaction(this.dataSource, async (queryRunner) => {
        const results: DocumentEntity[] = [];
        for (const dto of createDocumentDto) {
          const { type: _type, ...rest } = dto;

          //TODO: Validar que no exista el documento
          if (
            await this.validateDocumentExist({
              employee: employee.id,
              tipe_id: _type,
            })
          )
            throw new ErrorManager({
              code: 'CONFLICT',
              message: 'El empleado ya tiene un documento de este tipo',
            });

          const type = await this.typeDocumentService.findOne({
            term: _type,
          });

          const document = await createResult(
            this.documentRepository,
            { ...rest, type, employee },
            DocumentEntity,
            queryRunner,
          );

          results.push(document);
        }

        return results;
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findAllForEmployee(pagination: FindDocumentsDto) {
    try {
      const { employee_id, all, limit, page, relations } = pagination;
      const options: FindManyOptions<DocumentEntity> = {
        where: { employee: { id: employee_id } },
      };

      if (relations) {
        options.relations = {
          type: true,
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

  async validateDocumentExist({
    employee,
    tipe_id,
  }: {
    employee: number;
    tipe_id: number;
  }) {
    try {
      const options: FindOneOptions<DocumentEntity> = {
        where: { employee: { id: employee }, type: { id: tipe_id } },
      };

      const documentExist = await validateExistence({
        repository: this.documentRepository,
        options,
      });

      return documentExist;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findOneDocument({ term }: FindOneDto) {
    try {
      const documento = await findOneByTerm({
        repository: this.documentRepository,
        term,
        searchField: isNaN(Number(term)) ? 'name' : undefined,
      });

      return { url_file: documento.url_file };
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findOne({ term, relations = false }: FindOneWhitTermAndRelationDto) {
    try {
      const options: FindOneOptions<DocumentEntity> = {};

      if (relations) {
        options.relations = {
          type: true,
          employee: true,
        };
      }

      const document = await findOneByTerm({
        repository: this.documentRepository,
        term,
        options,
      });

      return document;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async update({ id, ...updateDocumentDto }: UpdateDocumentDto) {
    try {
      const { type: _type, ...rest } = updateDocumentDto;

      const document = await this.findOne({ term: id, relations: true });
      const old_file = document.url_file;

      if (_type && document.type.id !== _type) {
        const typeDocument = await this.typeDocumentService.findOne({
          term: _type,
        });

        document.type = typeDocument;
      }

      Object.assign(document, rest);

      const result = await updateResult(this.documentRepository, id, document);

      return { result, old_file };
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async remove(id: number): Promise<IResponseUpdateDocument> {
    try {
      const result = await deleteResult(this.documentRepository, id);

      return { result, old_file: '' };
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }
}
