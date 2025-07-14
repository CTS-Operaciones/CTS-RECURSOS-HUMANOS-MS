import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BankService } from './bank.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { PaginationDto } from 'src/common';

@Controller()
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @MessagePattern('createBank')
  create(@Payload() createBankDto: CreateBankDto) {
    return this.bankService.create(createBankDto);
  }

  @MessagePattern('findAllBank')
  findAll(@Payload() pagination: PaginationDto) {
    return this.bankService.findAll(pagination);
  }

  @MessagePattern('findOneBank')
  findOne(@Payload() { id }: { id: number }) {
    return this.bankService.findOne(id);
  }

  @MessagePattern('updateBank')
  update(@Payload() updateBankDto: UpdateBankDto) {
    return this.bankService.update(updateBankDto);
  }

  @MessagePattern('removeBank')
  remove(@Payload() { id }: { id: number }) {
    return this.bankService.remove(id);
  }

  @MessagePattern('restoreBank')
  restore(@Payload() { id }: { id: number }) {
    return this.bankService.restore(id);
  }
}
