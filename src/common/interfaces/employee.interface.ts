import {
  BLOOD_TYPE,
  GENDER,
  IEmployee,
  NACIONALITY_EMPLOYEE,
  STATUS_CIVIL,
  STATUS_EMPLOYEE,
} from 'cts-entities';

export interface IEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface IAccount {
  email: string | undefined;
  register: boolean;
}

export interface IEmployeeCreate {
  names: string;
  first_last_name: string;
  second_last_name?: string;
  date_birth: string;
  year_old: number;
  gender: GENDER;
  curp: string;
  rfc: string;
  nss: string;
  ine_number: string;
  alergy?: string;
  nacionality: NACIONALITY_EMPLOYEE;
  status: STATUS_EMPLOYEE;
  blood_type?: BLOOD_TYPE;
  contract: IEmploymentRecordCreate;
}

export interface IEmploymentRecordCreate {
  date_register: Date;
  telephone?: string;
  address?: string;
  email: string;
  emergency_contact?: IEmergencyContact[];
  status_civil?: STATUS_CIVIL;
  number_account_bank?: string;
  bank_id?: number;
  typeContract: number;
  account: IAccount;
  employee_has_position: IEmployeeHasPosition[];
}

export interface IEmployeeHasPosition {
  position_id: number;
  headquarter_id: number;
  parent_id?: number;
}
