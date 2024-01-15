import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PaginationDto } from './dto/pagination.dto';
import { TransactionService } from 'src/transactions/transaction.service';
import { FundAccountDto } from './dto/wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    private prismaService: PrismaService,
    private transactionService: TransactionService,
  ) {}

  async createWallet(email: string) {
    try {
      const account = await this.prismaService.account.findUnique({
        where: { email: email },
      });

      // create virtual account with flutterwave
      const virtualAccountDetails =
        await this.transactionService.createVirtualAccount(
          account.email,
          account.bvn,
          true,
          account.id,
        );

      // create wallet and save virtual account details account
      const wallet = await this.prismaService.wallet
        .create({
          data: {
            account: {
              connect: {
                email: account.email,
              },
            },
          },
        })
        .then(async (wallet) => {
          await this.prismaService.virtualAccount.create({
            data: {
              accountNumber: virtualAccountDetails.virtualAccountNumber,
              bankName: virtualAccountDetails.bankName,
              transactionRef: virtualAccountDetails.txRef,
              flwRef: virtualAccountDetails.flw_ref,
              wallet: { connect: { email: wallet.email } },
            },
          });

          return wallet;
        });

      return { wallet, virtualAccountDetails };
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

  async getWalletTransactionByRef(email: string, transactionRef: string) {
    try {
      const walletTransaction =
        await this.prismaService.walletTransaction.findFirst({
          where: { transactionRef: transactionRef },
        });

      if (
        walletTransaction.accountEmail !== email ||
        walletTransaction.secondaryEmail !== email
      ) {
        throw new HttpException(
          'You can only view transactions that you were part of',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return walletTransaction;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getWaletTransactionById(email: string, walletTransactionId: string) {
    try {
      const walletTransaction =
        await this.prismaService.walletTransaction.findFirst({
          where: { id: walletTransactionId },
        });

      if (
        walletTransaction.accountEmail !== email ||
        walletTransaction.secondaryEmail !== email
      ) {
        throw new HttpException(
          'You can only view transactions that you were part of',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return walletTransaction;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getWalletDetails(email: string) {
    try {
      const wallet = await this.prismaService.wallet.findUnique({
        where: { email: email },
        include: {
          virualAccount: {
            select: {
              id: true,
              accountNumber: true,
              bankName: true,
              createdAt: true,
            },
          },
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

  async fundWallet(dto: FundAccountDto) {
    try {
      console.log(dto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
