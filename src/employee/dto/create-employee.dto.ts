import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  BLOOD_TYPE,
  GENDER,
  NACIONALITY_EMPLOYEE,
  STATUS_CIVIL,
  STATUS_EMPLOYEE,
  IEmergencyContact,
  IEmployeeCreate,
} from '../../common/';

class EmergencyContactDto implements IEmergencyContact {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsString()
  relationship: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;
}

export class CreateEmployeeDto implements IEmployeeCreate {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  names: string;

  @IsNotEmpty()
  @MaxLength(100)
  first_last_name: string;

  @IsString()
  @MaxLength(100)
  second_last_name?: string;

  @IsNotEmpty()
  @IsString()
  date_birth: string;

  @IsOptional()
  @IsNumber()
  @Min(18)
  year_old?: number;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @MaxLength(15)
  @IsString()
  @IsOptional()
  telephone?: string;

  @MaxLength(200)
  @IsString()
  @IsOptional()
  address?: string;

  @IsNotEmpty()
  @IsEnum(GENDER)
  gender: GENDER;

  @IsNotEmpty()
  @IsString()
  @MaxLength(18)
  curp: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(13)
  rfc: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(11)
  nss: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(13)
  ine_number: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  alergy?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactDto)
  emergency_contact?: EmergencyContactDto[];

  @IsNotEmpty()
  @IsEnum(NACIONALITY_EMPLOYEE)
  nacionality: NACIONALITY_EMPLOYEE;

  @IsNotEmpty()
  @IsEnum(STATUS_EMPLOYEE)
  status: STATUS_EMPLOYEE;

  @IsEnum(BLOOD_TYPE)
  blood_type?: BLOOD_TYPE;

  @IsEnum(STATUS_CIVIL)
  @IsOptional()
  status_civil?: STATUS_CIVIL;

  // Relations
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(1)
  position_id: number;
}
