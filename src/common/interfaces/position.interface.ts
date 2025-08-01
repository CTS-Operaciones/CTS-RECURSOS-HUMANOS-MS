import { ISalary } from './salary.interface';

export interface IPosition {
  name: string;
  salary: ISalary;
  parent?: IPosition;
}

export interface ICreatePosition extends Omit<IPosition, 'parent'> {
  department_id?: number;
  parent?: number;
}
