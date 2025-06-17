import {
  BLOOD_TYPE,
  GENDER,
  NACIONALITY_EMPLOYEE,
  STATUS_CIVIL,
  STATUS_EMPLOYEE,
} from '../constants';

export interface IEmployee {
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
}

export interface IEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface IEmployeeCreate extends IEmployee {
  position_id: number;
}

export interface IEmployeeResponse extends IEmployee {
  id: number;
  position: {
    id: number;
    name: string;
  }[];
}
