import { IEmployee } from 'cts-entities';

export interface IEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface IAccount {
  email: string | undefined;
  register: boolean;
}

export interface IEmployeeCreate
  extends Omit<
    IEmployee,
    | 'bank'
    | 'typeContract'
    | 'email_cts'
    | 'id'
    | 'available'
    | 'deleted_at'
    | 'created_at'
    | 'updated_at'
  > {
  position_id: number[];
  bank_id?: number;
  typeContract: number;
  account: IAccount;
}
