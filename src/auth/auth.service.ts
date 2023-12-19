import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { MessageService } from 'src/utils/message.service';
import {
  CreateAccountDto,
  LoginDto,
  RequestMobileVerification,
  UpdateAccountDetails,
  VerifyMobileNumberDto,
  updateAccountPinDto,
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

  async requestMobileVerification(
    dto: RequestMobileVerification,
    type: 'mobile' | 'email',
  ) {
    try {
      const userExists = await this.prismaService.user.findFirst({
        where: { mobileNumber: dto.mobileNumber },
      });
      if (userExists && userExists.isMobileVerified === true) {
        throw new HttpException(
          'User with mobile number is already verified',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        userExists.isMobileVerified === false &&
        userExists.isGoogleUser === false &&
        userExists.isIosUser === false
      ) {
        await this.prismaService.user.delete({ where: { id: userExists.id } });
      }

      const otp = this.utilService.generateOtp();

      // send message if type is mobile
      if (type === 'mobile') {
        const parsesedMobileNumber = this.utilService.parseMobileNumber(
          dto.mobileNumber,
        );
        await this.messageService.sendTestMessage(
          `${dto.countryCode}${parsesedMobileNumber}`,
          `Your mobile verification otp is ${otp}`,
        );

        const user = await this.prismaService.user.create({
          data: {
            mobileNumber: dto.mobileNumber,
          },
        });

        const token = await this.jwtService.signAsync(
          { otp },
          { expiresIn: '5m' },
        );

        await this.prismaService.token.create({
          data: { token: token, user: { connect: { id: user.id } } },
        });

        return {
          message: 'Verifiation message sent',
        };
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyMobile(dto: VerifyMobileNumberDto) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: { mobileNumber: dto.mobileNumber },
      });

      if (!user) {
        throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
      }

      if (user.isMobileVerified === true) {
        throw new HttpException(
          'Mobile number already verified',
          HttpStatus.BAD_REQUEST,
        );
      }

      const otpExists = await this.prismaService.token.findFirst({
        where: {
          user: {
            mobileNumber: dto.mobileNumber,
          },
        },
      });

      if (!otpExists) {
        throw new HttpException(
          'Mobile verification otp not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const decodedOtp = await this.jwtService.decode(otpExists.token);
      if (!decodedOtp || decodedOtp !== dto.otp) {
        throw new HttpException('Otp Expired', HttpStatus.UNAUTHORIZED);
      }

      await this.prismaService.user.update({
        where: { id: user.id },
        data: { isMobileVerified: true },
      });

      await this.prismaService.token.delete({ where: { id: otpExists.id } });

      return { message: 'Mobile number verified successfully' };
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

  async createAccount(dto: CreateAccountDto) {
    try {
      const accountExists = await this.prismaService.account.findFirst({
        where: { email: dto.email },
      });
      if (accountExists) {
        throw new HttpException(
          'An account with that email already exists',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const account = await this.prismaService.account.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          mxeTag: dto.mxeTag,
          user: {
            connect: { id: dto.userId },
          },
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          mxeTag: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              isMobileVerified: true,
              mobileNumber: true,
            },
          },
        },
      });

      await this.prismaService.accountVerification.create({
        data: { accountId: account.id },
      });

      await this.prismaService.user.update({
        where: { id: dto.userId },
        data: {
          pin: await hash(dto.pin),
          email: dto.email,
        },
      });

      return { message: 'Account created', account: account };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException('User does not exists', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateAccountDetails(email: string, dto: UpdateAccountDetails) {
    try {
      const updatedAccount = await this.prismaService.account.update({
        where: { email: email },
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          mxeTag: dto.mxeTag,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          mxeTag: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return updatedAccount;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException(
          'Account does not exists',
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateAccountPin(email: string, dto: updateAccountPinDto) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: { email: email },
      });
      if (!user) {
        throw new HttpException('User does not exists', HttpStatus.NOT_FOUND);
      }

      const passwordMatches = await verify(user.pin, dto.oldPin);
      if (!passwordMatches) {
        throw new HttpException('Incorrect password', HttpStatus.NOT_FOUND);
      }

      await this.prismaService.user.update({
        where: { email: email },
        data: { pin: await hash(dto.newPin) },
      });

      return { message: 'Account pin changed successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: { mobileNumber: dto.mobileNumber },
        include: { account: { select: { id: true } } },
      });
      if (!user) {
        throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
      }

      const isPinValid = await verify(user.pin, dto.pin);
      if (!isPinValid) {
        throw new HttpException('Incorrect pin', HttpStatus.UNAUTHORIZED);
      }

      const payload = {
        userId: user.id,
        email: user.email,
        accountId: user.account.id,
      };

      const accessToken = await this.jwtService.signAsync(payload);

      return {
        accessToken: accessToken,
      };
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
}
