import { IEmployee } from 'cts-entities';

export interface IEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface IEmployeeCreate
  extends Omit<IEmployee, 'bank' | 'typeContract'> {
  position_id: number;
  bank_id?: number;
  typeContract: number;
}
