import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Module({
  controllers: [WalletController],
  providers: [
    PrismaService,
    WalletService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
  imports: [],
})
export class WalletModule {}
