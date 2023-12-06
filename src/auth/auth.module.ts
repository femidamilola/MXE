import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma.service';
import { MessageService } from 'src/utils/message.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, MessageService],
})
export class AuthModule {}
