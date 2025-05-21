import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/common';

@Injectable()
export class DepartmentService {
  constructor() {}

  create(createDepartmentDto: any) {
    return 'This action adds a new department';
  }

  findAll(pagination: PaginationDto) {
    return `This action returns all department`;
  }

  findOne(id: number) {
    return `This action returns a #${id} department`;
  }

  update(id: number, updateDepartmentDto: any) {
    return `This action updates a #${id} department`;
  }

  remove(id: number) {
    return `This action removes a #${id} department`;
  }

  restore(id: number) {
    return `This action removes a #${id} department`;
  }
}
