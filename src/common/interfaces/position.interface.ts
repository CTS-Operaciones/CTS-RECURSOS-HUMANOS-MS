import { ISalary } from './salary.interface';

export interface IPosition {
  name: string;
  salary: ISalary;
  parent?: IPosition;
  required_boss?: boolean;
  isExternal?: boolean;
}

export interface ICreatePosition extends Omit<IPosition, 'parent'> {
  department_id?: number;
  parent?: number;
}
