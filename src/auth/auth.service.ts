import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { MessageService } from 'src/utils/message.service';
import {
  RegisterAccountDto,
  CompleteAccountRegistrationDto,
  VerifyAccountDto,
  updateAccountPinDto,
  LoginDto,
} from './dto/auth.dto';
import { UtilService } from 'src/utils/util.service';
import { hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private messageService: MessageService,
    private utilService: UtilService,
  ) {}

  async registerAccount(dto: RegisterAccountDto) {
    try {
      const accountExists = await this.prismaService.account.findFirst({
        where: { mobileNumber: dto.mobileNumber },
      });

      if (accountExists) {
        throw new HttpException(
          'User with mobile number already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      // generate otp and send to user
      const otp = this.utilService.generateOtp();

      const parsesedMobileNumber = this.utilService.parseMobileNumber(
        dto.mobileNumber,
      );
      await this.messageService.sendTextMessage(
        `${dto.countryCode}${parsesedMobileNumber}`,
        `Your mobile verification otp is ${otp}`,
      );

      // sign otp for 10 minutes
      const token = await this.jwtService.signAsync(
        { otp },
        { expiresIn: '10m' },
      );

      const account = await this.prismaService.account
        .create({
          data: { mobileNumber: dto.mobileNumber },
        })
        .then(async (account) => {
          await this.prismaService.token.create({
            data: {
              token: token,
              account: { connect: { id: account.id } },
            },
          });
        });

      return { message: 'Verification token sent', data: account };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async resendVerificationOtp(accountId: string) {
    try {
      const account = await this.prismaService.account.findFirst({
        where: { id: accountId },
      });

      const otp = this.utilService.generateOtp();

      const parsesedMobileNumber = this.utilService.parseMobileNumber(
        account.mobileNumber,
      );
      await this.messageService.sendTextMessage(
        `${account.countryCode}${parsesedMobileNumber}`,
        `Your mobile verification otp is ${otp}`,
      );

      const token = await this.jwtService.signAsync(
        { otp },
        { expiresIn: '10m' },
      );

      await this.prismaService.token.update({
        where: { accountId: account.id },
        data: { token: token },
      });

      return { message: 'Verification token resent' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyAccount(dto: VerifyAccountDto) {
    try {
      const token = await this.prismaService.token.findFirst({
        where: { account: { mobileNumber: dto.mobileNumber } },
        include: { account: { select: { id: true, isMobileVerified: true } } },
      });

      if (!token) {
        throw new HttpException(
          'Mobile verification otp not found',
          HttpStatus.NOT_FOUND,
        );
      }

      if (token.account.isMobileVerified === true) {
        throw new HttpException(
          'Account already verified',
          HttpStatus.BAD_REQUEST,
        );
      }

      const decodedToken = await this.jwtService.decode(token.token);
      if (!decodedToken || decodedToken.otp != dto.otp) {
        throw new HttpException('Invalid otp', HttpStatus.UNAUTHORIZED);
      }

      await this.prismaService.account.update({
        where: { mobileNumber: dto.mobileNumber },
        data: { isMobileVerified: true },
      });

      await this.prismaService.token.delete({ where: { id: token.id } });

      return { message: 'Mobile verification complete' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async checkMxeTagExists(mxeTag: string) {
    try {
      const mxeTagExists = await this.prismaService.account.findFirst({
        where: { mxeTag: mxeTag },
      });
      if (mxeTagExists) {
        throw new HttpException(
          'Mxe Tag already in use',
          HttpStatus.BAD_REQUEST,
        );
      }
      return { message: 'Mxe Tag is not in use' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async completeAccountRegistration(
    mobileNumber: string,
    dto: CompleteAccountRegistrationDto,
  ) {
    try {
      if (dto.pin != dto.confirmPin) {
        throw new HttpException('Pins do not match', HttpStatus.BAD_REQUEST);
      }
      const updatedAccount = await this.prismaService.account.update({
        where: { mobileNumber: mobileNumber },
        data: {
          pin: await hash(dto.pin),
          email: dto.email,
          mxeTag: dto.mxeTag,
          firstName: dto.firstName,
          lastName: dto.lastName,
          bvn: dto.bvn,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          mxeTag: true,
          mobileNumber: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return updatedAccount;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateAccountPin(accountId: string, dto: updateAccountPinDto) {
    try {
      const account = await this.prismaService.account.findFirst({
        where: { id: accountId },
      });

      const passwordMatches = await verify(account.pin, dto.oldPin);
      if (!passwordMatches) {
        throw new HttpException('Incorrect password', HttpStatus.NOT_FOUND);
      }

      await this.prismaService.account.update({
        where: { id: accountId },
        data: { pin: await hash(dto.newPin) },
      });

      return { message: 'Account pin changed successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(dto: LoginDto) {
    try {
      const account = await this.prismaService.account.findFirst({
        where: { mobileNumber: dto.mobileNumber },
      });

      if (!account) {
        throw new HttpException('Account does not exist', HttpStatus.NOT_FOUND);
      }

      const pinMatches = await verify(account.pin, dto.pin);
      if (!pinMatches) {
        throw new HttpException('Incorrect pin', HttpStatus.UNAUTHORIZED);
      }

      const payload = {
        accountId: account.id,
        email: account.email,
        // mobileNumber: account.mobileNumber,
      };

      const accessToken = await this.jwtService.signAsync(payload);

      return { accessToken: accessToken };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createAdmin(accountEmail: string) {
    try {
      await this.prismaService.account.update({
        where: { email: accountEmail },
        data: { role: 'ADMIN' },
      });

      return { message: 'Account updated to admin' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException('Account does not exist', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyBvn() {
    try {
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
