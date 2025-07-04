import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { TypeContractEntity } from 'cts-entities';

import { CreateTypeContractDto, UpdateTypeContractDto } from './dto';

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
export class ContractService {
  constructor(
    @InjectRepository(TypeContractEntity)
    private readonly typeContractRepository: Repository<TypeContractEntity>,
  ) {}

  async create(createTypeCotractDto: CreateTypeContractDto) {
    try {
      const { isAutomatic, type } = createTypeCotractDto;

      const typeContract = await createResult(
        this.typeContractRepository,
        { isAutomatic, type },
        TypeContractEntity,
      );

      return typeContract;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findAll(pagination: PaginationDto) {
    try {
      const options: FindManyOptions<TypeContractEntity> = {};

      return await paginationResult(this.typeContractRepository, {
        ...pagination,
        options,
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findOne({ term }: FindOneDto) {
    try {
      const typeDocument = await findOneByTerm<TypeContractEntity>({
        repository: this.typeContractRepository,
        term,
        options: {},
      });

      return typeDocument;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async updated({ id, type, isAutomatic }: UpdateTypeContractDto) {
    try {
      const typeDocument = await this.findOne({
        term: id,
      });

      if (
        isAutomatic !== undefined &&
        typeDocument.isAutomatic !== isAutomatic
      ) {
        typeDocument.isAutomatic = isAutomatic;
      }

      if (type !== undefined && typeDocument.type !== type) {
        typeDocument.type = type;
      }

      return await updateResult(this.typeContractRepository, id, typeDocument);
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }
}
