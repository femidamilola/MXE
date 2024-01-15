import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('CALLBACK_URL'),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    googleAccessToken: string,
    googleRefreshToken: string,
    profile: Profile,
  ) {
    const accountExists = await this.prisma.account.findFirst({
      where: { email: profile._json.email },
    });

    if (!accountExists) {
      const account = await this.prisma.account.create({
        data: {
          email: profile._json.email,
          isGoogleUser: true,
          isEmailVerified: true,
          mobileNumber: null,
        },
      });

      const payload = {
        accountId: account.id,
        email: account.email,
      };
      const accessToken = await this.jwtService.signAsync(payload);

      return {
        accessToken: accessToken,
        googleAccessToken,
        googleRefreshToken,
      };
    }

    const payload = {
      accountId: accountExists.id,
      email: accountExists.email,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken: accessToken,
      googleAccessToken,
      googleRefreshToken,
    };
  }
}
