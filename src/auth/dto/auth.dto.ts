import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestMobileVerification {
  @ApiProperty()
  @IsNotEmpty()
  mobileNumber: string;
}

export class VerifyMobileNumberDto {
  @ApiProperty()
  @IsNotEmpty()
  userId: string;

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
