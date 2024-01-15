import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [TransactionService, PrismaService, ConfigService],
  exports: [TransactionService],
})
export class TransactionModule {}
