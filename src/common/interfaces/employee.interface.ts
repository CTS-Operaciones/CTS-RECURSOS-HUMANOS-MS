import {
  BLOOD_TYPE,
  GENDER,
  NACIONALITY_EMPLOYEE,
  STATUS_CIVIL,
  STATUS_EMPLOYEE,
} from '../constants';
import { IBank } from './bank.interface';

export interface IEmployee {
  date_register: Date;
  names: string;
  first_last_name: string;
  second_last_name?: string;
  date_birth: string;
  year_old?: number;
  email: string;
  telephone?: string;
  address?: string;
  gender: GENDER;
  curp: string;
  rfc: string;
  nss: string;
  ine_number: string;
  alergy?: string;
  emergency_contact?: IEmergencyContact[];
  nacionality: NACIONALITY_EMPLOYEE;
  status: STATUS_EMPLOYEE;
  blood_type?: BLOOD_TYPE;
  status_civil?: STATUS_CIVIL;
  bank?: IBank;
  number_account_bank?: string;
}

export interface IEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface IEmployeeCreate extends Omit<IEmployee, 'bank'> {
  position_id: number;
  bank_id?: number;
}
