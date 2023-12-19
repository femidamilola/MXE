import { Module } from '@nestjs/common';
// import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { PrismaService } from './prisma.service';
import { MessageService } from './utils/message.service';
import { ConfigModule } from '@nestjs/config';
import { UtilService } from './utils/util.service';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';
import { VerificationModule } from './verification/verification.module';
import { UploadService } from './utils/upload.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    WalletModule,
    VerificationModule,
  ],
  controllers: [],
  providers: [
    AuthService,
    PrismaService,
    MessageService,
    UtilService,
    UploadService,
  ],
})
export class AppModule {}
