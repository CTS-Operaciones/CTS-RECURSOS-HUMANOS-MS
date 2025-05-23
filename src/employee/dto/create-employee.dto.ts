import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    type: String,
    description: 'Name of the emergency contact',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    type: String,
    description: 'Relationship of the emergency contact',
  })
  @IsNotEmpty()
  @IsString()
  relationship: string;

  @ApiProperty({
    type: String,
    description: 'Phone of the emergency contact',
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;
}

export class CreateEmployeeDto implements IEmployeeCreate {
  @ApiProperty({
    type: String,
    description: 'Names of the employee',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  names: string;

  @ApiProperty({
    type: String,
    description: 'First last name of the employee',
  })
  @IsNotEmpty()
  @MaxLength(100)
  first_last_name: string;

  @ApiProperty({
    type: String,
    description: 'Second last name of the employee',
  })
  @IsString()
  @MaxLength(100)
  second_last_name?: string;

  @ApiProperty({
    type: Date,
    description: 'Date of birth of the employee',
    format: 'YYYY-MM-DD',
    example: '1990-01-01',
  })
  @IsNotEmpty()
  @IsString()
  date_birth: string;

  @ApiProperty({
    type: Number,
    description: 'Age of the employee',
  })
  @IsOptional()
  @IsNumber()
  @Min(18)
  year_old?: number;

  @ApiProperty({
    type: String,
    description: 'Personal email of the employee',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    description: 'Telephone of the employee',
  })
  @MaxLength(15)
  @IsString()
  @IsOptional()
  telephone?: string;

  @ApiProperty({
    type: String,
    description: 'Address of the employee',
  })
  @MaxLength(200)
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    enum: GENDER,
    description: 'Gender of the employee',
  })
  @IsNotEmpty()
  @IsEnum(GENDER)
  gender: GENDER;

  @ApiProperty({
    type: String,
    description: 'Curp of the employee',
    maxLength: 18,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(18)
  curp: string;

  @ApiProperty({
    type: String,
    description: 'RFC of the employee',
    maxLength: 13,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(13)
  rfc: string;

  @ApiProperty({
    type: String,
    description: 'NSS of the employee',
    maxLength: 11,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(11)
  nss: string;

  @ApiProperty({
    type: String,
    description: 'INE number of the employee',
    maxLength: 13,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(13)
  ine_number: string;

  @ApiProperty({
    type: String,
    description: 'Alergy of the employee',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  alergy?: string;

  @ApiProperty({
    type: [EmergencyContactDto],
    description: 'Emergency contact of the employee',
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactDto)
  emergency_contact?: EmergencyContactDto[];

  @ApiProperty({
    enum: NACIONALITY_EMPLOYEE,
    description: 'Nacionality of the employee',
    default: NACIONALITY_EMPLOYEE.MEXICAN,
  })
  @IsNotEmpty()
  @IsEnum(NACIONALITY_EMPLOYEE)
  nacionality: NACIONALITY_EMPLOYEE;

  @ApiProperty({
    enum: STATUS_EMPLOYEE,
    description: 'Status of the employee',
    default: STATUS_EMPLOYEE.ACTIVE,
  })
  @IsNotEmpty()
  @IsEnum(STATUS_EMPLOYEE)
  status: STATUS_EMPLOYEE;

  @ApiProperty({
    enum: BLOOD_TYPE,
    description: 'Blood type of the employee',
  })
  @IsEnum(BLOOD_TYPE)
  blood_type?: BLOOD_TYPE;

  @ApiProperty({
    enum: STATUS_CIVIL,
    description: 'Civil status of the employee',
  })
  @IsEnum(STATUS_CIVIL)
  @IsOptional()
  status_civil?: STATUS_CIVIL;

  // Relations
  @ApiProperty({
    type: Number,
    required: true,
    description: 'Position id of the employee',
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(1)
  position_id: number;
}
