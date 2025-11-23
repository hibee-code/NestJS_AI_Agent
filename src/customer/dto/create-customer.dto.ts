import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
} from 'class-validator';

class PolicyDto {
  @IsString()
  @IsNotEmpty()
  policyNumber: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @Min(0)
  coverageAmount: number;
}

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PolicyDto)
  @IsOptional()
  policies?: PolicyDto[];

  @IsNumber()
  @IsOptional()
  totalPolicies?: number;
}
