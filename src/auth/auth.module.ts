import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma.service';
import { MessageService } from 'src/utils/message.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UtilService } from 'src/utils/util.service';
import { ConfigService } from '@nestjs/config';
import { jwtConstants } from './constants';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '15m' },
    }),
    PassportModule.register({ defaultStrategy: 'google', session: false }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    MessageService,
    UtilService,
    ConfigService,
  ],
})
export class AuthModule {}
