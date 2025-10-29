import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { DismissalsService } from './dismissals.service';
import { CreateBulkDismissalDto, CreateDismissalDto, UpdateDismissalDto } from './dto';
import { PaginationRelationsDto } from '../common';

@Controller()
export class DismissalsController {
  constructor(private readonly dismissalsService: DismissalsService) {}

  @MessagePattern('dismissal.create')
  create(@Payload() createDismissalDto: CreateDismissalDto) {
    return this.dismissalsService.create(createDismissalDto);
  }

  @MessagePattern('dismissal.createBulk')
  createBulk(@Payload() createBulkDismissalDto: CreateBulkDismissalDto) {
    return this.dismissalsService.createBulk(createBulkDismissalDto);
  }

  @MessagePattern('dismissal.findAll')
  findAll(@Payload() pagination: PaginationRelationsDto) {
    return this.dismissalsService.findAll(pagination);
  }

  @MessagePattern('dismissal.findOne')
  findOne(@Payload() { id }: { id: number }) {
    return this.dismissalsService.findOne(id);
  }

  @MessagePattern('dismissal.update')
  update(@Payload() updateDismissalDto: UpdateDismissalDto) {
    return this.dismissalsService.update(updateDismissalDto);
  }

  @MessagePattern('dismissal.remove')
  remove(@Payload() { id }: { id: number }) {
    return this.dismissalsService.remove(id);
  }
}
