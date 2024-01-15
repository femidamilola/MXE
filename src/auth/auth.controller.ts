import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  CompleteAccountRegistrationDto,
  LoginDto,
  RegisterAccountDto,
  VerifyAccountDto,
  updateAccountPinDto,
} from './dto/auth.dto';
import { GoogleAuthGuard } from './guards/google.guard';
import { JwtGuard } from './guards/jwt.guard';
import { Public } from './decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleLoginCallback(@Req() req, @Res() res) {
    const { accessToken, userId, userEmail } = req.user;
    return res.send({ accessToken, userId, userEmail });
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Start account registration' })
  registerAccount(@Body() dto: RegisterAccountDto) {
    return this.authService.registerAccount(dto);
  }

  @Public()
  @Post('resend-verification-otp/:accountId')
  @ApiOperation({ summary: 'Resend verification otp' })
  resendVerificationOtp(@Param('accountId') accountId: string) {
    return this.authService.resendVerificationOtp(accountId);
  }

  @Public()
  @Patch('verify-account')
  @ApiOperation({ summary: 'Verify account' })
  verifyAccount(@Body() dto: VerifyAccountDto) {
    return this.authService.verifyAccount(dto);
  }

  @Public()
  @Get(':tag')
  @ApiOperation({ summary: 'Check if mxe tag exists' })
  checkMxeTagExists(@Param('tag') tag: string) {
    return this.authService.checkMxeTagExists(tag);
  }

  @Public()
  @Patch('complete-account-registration/:mobileNumber')
  @ApiOperation({ summary: 'Complete account registration' })
  completeAccountRegistration(
    @Body() dto: CompleteAccountRegistrationDto,
    @Param('mobileNumber') mobileNumber: string,
  ) {
    return this.authService.completeAccountRegistration(mobileNumber, dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtGuard)
  @ApiSecurity('JWT-auth')
  @Patch('change-pin')
  @ApiOperation({ summary: 'Update account pin' })
  updateAccountPin(@Body() dto: updateAccountPinDto, @Req() req) {
    return this.authService.updateAccountPin(req.user.accountId, dto);
  }

  @UseGuards(JwtGuard)
  @ApiSecurity('JWT-auth')
  @Patch('account/admin')
  @ApiOperation({ summary: 'Upgrade account to admin' })
  createAdmin(@Body() accountEmail: string) {
    return this.authService.createAdmin(accountEmail);
  }
}
