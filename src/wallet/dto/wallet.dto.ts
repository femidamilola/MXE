import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '@prisma/client';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateWalletDto {
  @IsNotEmpty()
  @ApiProperty()
  email: string;
}

export class FundAccountDto {
  @IsNotEmpty()
  @ApiProperty()
  accountBank: string;

  @IsNotEmpty()
  @ApiProperty()
  accountNumber: string;

  @IsNotEmpty()
  @ApiProperty()
  amount: number;

  @IsNotEmpty()
  @ApiProperty()
  debitCurrency: string;

  @IsNotEmpty()
  @ApiProperty()
  currency: Currency;

  @IsOptional()
  @ApiProperty()
  narration?: string;
}

export class CreateVirtualCardDto {
  @IsNotEmpty()
  @ApiProperty()
  amount: number;

  @IsNotEmpty()
  @ApiProperty()
  currency: Currency;
}
