import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { HolidaysEntity } from 'cts-entities';

import {
  createResult,
  deleteResult,
  ErrorManager,
  findOneByTerm,
  PaginationDto,
  paginationResult,
  restoreResult,
  updateResult,
} from '../common';

import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

@Injectable()
export class HolidayService {
  constructor(
    @InjectRepository(HolidaysEntity)
    private readonly holidayRepository: Repository<HolidaysEntity>,
  ) {}

  async create(createHolidayDto: CreateHolidayDto) {
    try {
      const { holiday_date, description } = createHolidayDto;

      const holiday = await createResult(
        this.holidayRepository,
        {
          holiday_date,
          description,
        },
        HolidaysEntity,
      );

      return holiday;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findAll(pagination: PaginationDto) {
    try {
      const holidays = await paginationResult(
        this.holidayRepository,
        pagination,
      );

      return holidays;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async findOne(id: number, idDelete: boolean = false) {
    try {
      const options: FindOneOptions<HolidaysEntity> = {
        withDeleted: idDelete,
      };

      const holiday = await findOneByTerm<HolidaysEntity>({
        repository: this.holidayRepository,
        term: id,
        options,
      });

      return holiday;
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async update(updateHolidayDto: UpdateHolidayDto) {
    try {
      const { id, holiday_date, description } = updateHolidayDto;

      const holiday = await this.findOne(id);

      Object.assign(holiday, {
        holiday_date,
        description,
      });

      return await updateResult(this.holidayRepository, id, holiday);
    } catch (error) {}
  }

  async remove(id: number) {
    try {
      await this.findOne(id);

      return await deleteResult(this.holidayRepository, id);
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }

  async restore(id: number) {
    try {
      await this.findOne(id, true);

      return await restoreResult(this.holidayRepository, id);
    } catch (error) {
      throw ErrorManager.createSignatureError(error);
    }
  }
}
