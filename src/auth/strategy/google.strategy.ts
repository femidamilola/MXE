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
    console.log(googleAccessToken);
    console.log(googleRefreshToken);

    const userExists = await this.prisma.user.findFirst({
      where: { email: profile._json.email },
    });

    if (!userExists) {
      const user = await this.prisma.user.create({
        data: {
          email: profile._json.email,
          isGoogleUser: true,
          isEmailVerified: true,
        },
      });

      const payload = {
        userId: user.id,
        userEmail: user.email,
      };
      const accessToken = await this.jwtService.signAsync(payload);

      return {
        accessToken: accessToken,
        userId: user.id,
        userEmail: user.email,
        createdAt: user.createdAt,
      };
    }

    const payload = {
      userId: userExists.id,
      userEmail: userExists.email,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken: accessToken,
      userId: userExists.id,
      userEmail: userExists.email,
      createdAt: userExists.createdAt,
    };
  }
}
