import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { BucketName, UploadService } from 'src/utils/upload.service';
import { PaginationDto } from 'src/wallet/dto/pagination.dto';

@Injectable()
export class VerificationService {
  constructor(
    private prismaService: PrismaService,
    private uploadService: UploadService,
  ) {}

  async requestAcountVerification(
    email: string,
    file: Express.Multer.File,
    bvn: string,
  ) {
    try {
      const account = await this.prismaService.account.findFirst({
        where: { email: email },
      });

      if (account.isAccountVerified === true) {
        throw new HttpException(
          'Account already verified',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (account.bvn === null || account.nationalIdCardUrl === null) {
        throw new HttpException(
          'Verification failed. National ID Card or BVN not provided',
          HttpStatus.BAD_REQUEST,
        );
      }

      const uploadedIdCard = await this.uploadService.uploadImage(
        file,
        BucketName.IdCard,
      );

      await this.prismaService.account.update({
        where: { email: email },
        data: { nationalIdCardUrl: uploadedIdCard.Location, bvn: bvn },
      });

      await this.prismaService.accountVerification.update({
        where: { accountId: account.id },
        data: {
          verificationStatus: 'PENDING',
        },
      });

      return { message: 'Your account is being reviewed' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException('Account does not exist', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyAccount(accountEmail: string) {
    try {
      const account = await this.prismaService.account.findFirst({
        where: { email: accountEmail },
      });

      const accountVerificationStatus =
        await this.prismaService.accountVerification.findFirst({
          where: { accountId: account.id },
        });

      if (accountVerificationStatus.verificationStatus === 'UN_VERIFIED') {
        throw new HttpException(
          'User has not yet requested for verification',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (accountVerificationStatus.verificationStatus === 'VERIFIED') {
        throw new HttpException(
          'User already verified',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (accountVerificationStatus.verificationStatus === 'PENDING') {
        await this.prismaService.accountVerification
          .update({
            where: { accountId: account.id },
            data: { verificationStatus: 'VERIFIED' },
          })
          .then(async (verificationStatus) => {
            await this.prismaService.account.update({
              where: { id: verificationStatus.id },
              data: { isAccountVerified: true },
            });
          });

        return { message: 'Account has been verified' };
      }
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException('Account does not exist', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async viewPendingVerifications(dto: PaginationDto) {
    try {
      const skip = (dto.page - 1) * dto.pageSize;

      const pendingVerifications =
        await this.prismaService.accountVerification.findMany({
          where: { verificationStatus: 'PENDING' },
          skip: skip,
        });

      return {
        pendingVerifications: pendingVerifications,
        pageSize: dto.pageSize,
        currentPage: dto.page,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
