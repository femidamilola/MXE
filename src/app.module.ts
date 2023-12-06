import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { PrismaService } from './prisma.service';
import { MessageService } from './utils/message.service';
import { ConfigModule } from '@nestjs/config';
import { UtilService } from './utils/util.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, MessageService, UtilService],
})
export class AppModule {}
