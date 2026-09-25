import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLeadDto {
  @IsNotEmpty()
  @IsString()
  Last_Name: string;

  @IsOptional()
  @IsString()
  First_Name?: string;

  @IsNotEmpty()
  @IsString()
  Phone: string;

  @IsOptional()
  @IsEmail()
  Email?: string;

  @IsOptional()
  @IsString()
  City?: string;

  @IsOptional()
  @IsString()
  Vehicle_Model?: string;
}

export class CreateServiceCaseDto {
  @IsNotEmpty()
  @IsString()
  Subject: string;

  @IsNotEmpty()
  @IsString()
  Registration_Number: string;

  @IsOptional()
  @IsNumber()
  Odometer_Reading?: number;

  @IsOptional()
  @IsString()
  Issue_Type?: string;

  @IsOptional()
  @IsString()
  Preferred_Service_Center?: string;

  @IsOptional()
  @IsString()
  Contact_Id?: string;
}
