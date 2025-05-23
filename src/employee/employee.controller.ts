import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { EmployeeService } from './employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';

import { FindOneRelationsDto, PaginationFilterStatusDto } from '../common';
import { EmployeeEntity } from './entities/employee.entity';

@ApiTags('Employees')
@Controller({ path: 'employee', version: '1' })
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  create(@Body() payload: CreateEmployeeDto) {
    return this.employeeService.createItem(payload);
  }

  @Get()
  getItems(@Query() pagination: PaginationFilterStatusDto<EmployeeEntity>) {
    return this.employeeService.getItems(pagination);
  }

  @Get(':id')
  getItem(
    @Param('id') id: string,
    @Query() { relations }: FindOneRelationsDto,
  ) {
    return this.employeeService.getItem({ term: id, relations });
  }

  @Patch(':id')
  updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateEmployeeDto,
  ) {
    return this.employeeService.updateItem(id, payload);
  }

  @Delete(':id')
  deleteItem(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.deleteItem(id);
  }

  @Delete('restore/:id')
  restoreItem(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.restoreItem(id);
  }
}
