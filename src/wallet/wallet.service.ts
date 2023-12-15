import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class WalletService {
  constructor(private prismaService: PrismaService) {}

  async createWallet(email: string) {
    try {
      const account = await this.prismaService.account.findUnique({
        where: { email: email },
      });

      const wallet = await this.prismaService.wallet.create({
        data: {
          email: email,
          account: {
            connect: {
              id: account.id,
            },
          },
        },
        select: {
          id: true,
          email: true,
          balance: true,
          accountId: true,
          createdAt: true,
          updatedAt: true,
          account: {
            select: {
              id: true,
              mxeTag: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return wallet;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getWalletTransactions(email: string, dto: PaginationDto) {
    try {
      const skip = (dto.page - 1) * dto.pageSize;

      const walletTransactions =
        await this.prismaService.walletTransaction.findMany({
          where: { accountEmail: email },
          skip: skip,
        });

      return {
        walletTransactions: walletTransactions,
        pageSize: dto.pageSize,
        currentPage: dto.page,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getWalletDetails(email: string) {
    try {
      const wallet = await this.prismaService.wallet.findUnique({
        where: { email: email },
        include: {
          account: {
            select: {
              id: true,
              email: true,
              mxeTag: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return wallet;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
