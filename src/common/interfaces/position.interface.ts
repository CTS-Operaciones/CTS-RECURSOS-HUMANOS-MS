import { ISalary } from './salary.interface';

export interface IPosition {
  name: string;
  salary: ISalary;
}

export interface ICreatePosition extends IPosition {
  department_id: number;
}
