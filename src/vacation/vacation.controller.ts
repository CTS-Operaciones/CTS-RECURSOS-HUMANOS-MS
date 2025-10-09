import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { VacationService } from './vacation.service';
import { CreateVacationDto, UpdateVacationDto } from './dto';

@Controller({ path: 'vacation', version: '1' })
export class VacationController {
  constructor(private readonly vacationService: VacationService) {}

  @MessagePattern('vacation.create')
  async create(@Payload() createVacationDto: CreateVacationDto) {
    return await this.vacationService.create(createVacationDto);
  }

  @MessagePattern('vacation.findHistoryByEmployee')
  async findHistoryByEmployee(@Payload() dto: any) {
    return await this.vacationService.findHistoryByEmployee(dto);
  }

  @MessagePattern('vacation.findOne')
  async findOne(@Payload() { id }: { id: number }) {
    return await this.vacationService.findOne(id);
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
