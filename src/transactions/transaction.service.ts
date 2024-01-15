import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Currency } from '@prisma/client';
const Flutterwave = require('flutterwave-node-v3');
// import FlutterWave from 'flutterwave-node-v3'

@Injectable()
export class TransactionService {
  // flwPublicKey = this.configService.get<string>('FLUTTERWAVE_PUBLIC_KEY');
  // flwSecretKey = this.configService.get<string>('FLUTTERWAVE_SECRET_KEY');
  // encKey = this.configService.get<string>('FLUTTERWAVE_ENC_KEY');
  // flwClient;
  constructor(private readonly configService: ConfigService) {
    // this.flwClient = new Flutterwave(this.flwPublicKey, this.flwSecretKey);
  }

  flw = new Flutterwave(
    process.env.FLUTTERWAVE_PUBLIC_KEY,
    process.env.FLUTTERWAVE_SECRET_KEY,
  );
  // flwClient = new Rave(
  //   this.configService.get<string>('FLUTTERWAVE_PUBLIC_KEY'),
  //   this.configService.get<string>('FLUTTERWAVE_SECRET_KEY'),
  // );

  async createVirtualAccount(
    email: string,
    bvn: string,
    isPermanent: boolean,
    accountId: string,
  ) {
    try {
      const txRef = `virtual-account-${Date.now()}-${accountId}`;

      const payload = {
        tx_ref: txRef,
        email: email,
        is_permanent: isPermanent,
        bvn: bvn,
      };

      const response = await this.flw.VirtualAcct.create(payload);

      return {
        txRef: txRef,
        virtualAccountNumber: response.data.account_number,
        bankName: response.data.bank_name,
        flw_ref: response.data.flw_ref,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getTransferFee(amount: string, currency: Currency) {
    try {
      const payload = {
        amount,
        currency,
      };

      const response = await this.flw.Transfer.Fee(payload);

      return response;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async fundAccount(
    accountBank: string,
    accountNumber: string,
    amount: number,
    debitCurrency: Currency,
    currency: Currency,
    narration?: string,
  ) {
    try {
      const txRef = `fund-account-${Date.now()}-${accountNumber}`;

      const payload = {
        account_bank: accountBank,
        account_number: accountNumber,
        amount: amount,
        currency: currency,
        debit_currency: debitCurrency,
        narration: narration,
        reference: txRef,
      };

      const response = await this.flw.Transfer.initiate(payload);
      return response;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createVirtualCard(
    amount: number,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    dob: string,
    title: string,
    gender: string,
    currency?: Currency,
  ) {
    try {
      const payload = {
        currency: currency,
        amount: amount,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        date_of_birth: dob,
        title: title,
        gender: gender,
      };

      const response = await this.flw.VirtualCard.create(payload);
      return response;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async fundVirtualCard() {}

  async terminateVirtualCard() {}

  async transferFunds() {}
}
