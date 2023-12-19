import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';
import { UploadService } from 'src/utils/upload.service';

@Module({
  imports: [],
  controllers: [VerificationController],
  providers: [VerificationService, PrismaService, ConfigService, UploadService],
})
export class VerificationModule {}
