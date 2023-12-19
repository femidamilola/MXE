import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';
import { UploadService } from 'src/utils/upload.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Module({
  imports: [],
  controllers: [VerificationController],
  providers: [
    VerificationService,
    PrismaService,
    ConfigService,
    UploadService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class VerificationModule {}
