import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class RequestMobileVerification {
  @ApiProperty()
  @IsNotEmpty()
  mobileNumber: string;

  @ApiProperty({ default: '+234' })
  @IsOptional()
  countryCode: string;
}

export class VerifyMobileNumberDto {
  @ApiProperty()
  @IsNotEmpty()
  mobileNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  otp: string;
}

export class CreateAccountDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  pin: string;

  @ApiProperty()
  @IsNotEmpty()
  mxeTag: string;

  @ApiProperty()
  @IsNotEmpty()
  userId: string;
}

export class UpdateAccountDetails {
  @ApiProperty()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  mxeTag: string;

  @ApiProperty()
  @IsNotEmpty()
  accountId: string;
}

export class updateAccountPinDto {
  @ApiProperty()
  @IsNotEmpty()
  oldPin: string;

  @ApiProperty()
  @IsNotEmpty()
  newPin: string;

  @ApiProperty()
  @IsNotEmpty()
  accountId: string;
}

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  mobileNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  pin: string;
}
