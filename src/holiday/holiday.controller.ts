import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { HolidayService } from './holiday.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

import { PaginationDto } from '../common';

@Controller()
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  @MessagePattern('holiday.create')
  create(@Payload() createHolidayDto: CreateHolidayDto) {
    return this.holidayService.create(createHolidayDto);
  }

  @MessagePattern('holiday.findAll')
  findAll(@Payload() pagination: PaginationDto) {
    return this.holidayService.findAll(pagination);
  }

  @MessagePattern('holiday.findOne')
  findOne(@Payload() { id }: { id: number }) {
    return this.holidayService.findOne(id);
  }

  @MessagePattern('holiday.update')
  update(@Payload() updateHolidayDto: UpdateHolidayDto) {
    return this.holidayService.update(updateHolidayDto);
  }

  @MessagePattern('holiday.remove')
  remove(@Payload() { id }: { id: number }) {
    return this.holidayService.remove(id);
  }

  @MessagePattern('holiday.restore')
  restore(@Payload() { id }: { id: number }) {
    return this.holidayService.restore(id);
  }
}
