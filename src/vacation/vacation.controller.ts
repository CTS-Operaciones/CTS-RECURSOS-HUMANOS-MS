import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { VacationService } from './vacation.service';
import {
  CreateVacationDto,
  FindHistoryByEmployeeDto,
  SetStatusOfVacationDto,
  UpdateVacationDto,
} from './dto';
import { RelationsDto } from '../common';

@Controller({ path: 'vacation', version: '1' })
export class VacationController {
  constructor(private readonly vacationService: VacationService) {}

  @MessagePattern('vacation.create')
  async create(@Payload() createVacationDto: CreateVacationDto) {
    return await this.vacationService.create(createVacationDto);
  }

  @MessagePattern('vacation.setStatusOfVacation')
  async setStatusOfVacation(@Payload() payload: SetStatusOfVacationDto) {
    return await this.vacationService.setStatusOfVacation(payload);
  }

  @MessagePattern('vacation.findHistoryByEmployee')
  async findHistoryByEmployee(@Payload() dto: FindHistoryByEmployeeDto) {
    return await this.vacationService.findHistoryByEmployee(dto);
  }

  @MessagePattern('vacation.findOne')
  async findOne(
    @Payload() { id, relations }: { id: number; relations: RelationsDto },
  ) {
    return await this.vacationService.findOne(id, relations.relations);
  }

  @MessagePattern('vacation.update')
  async update(@Payload() updateVacationDto: UpdateVacationDto) {
    return await this.vacationService.update(updateVacationDto);
  }

  @MessagePattern('vacation.remove')
  async remove(@Payload() { id }: { id: number }) {
    return await this.vacationService.remove(id);
  }
}
