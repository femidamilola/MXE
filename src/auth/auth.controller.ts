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
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  CreateAccountDto,
  LoginDto,
  RequestMobileVerification,
  UpdateAccountDetails,
  VerifyMobileNumberDto,
  updateAccountPinDto,
} from './dto/auth.dto';
import { GoogleAuthGuard } from './guards/google.guard';

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

  @Post('request-mobile-verification/:type')
  @ApiParam({
    name: 'type',
    enum: ['email', 'mobile'],
  })
  @ApiOperation({ summary: ' Request for mobile verification' })
  requestMobileVerification(
    @Body() dto: RequestMobileVerification,
    @Param('type') type: 'email' | 'mobile',
  ) {
    return this.authService.requestMobileVerification(dto, type);
  }

  @Post('verify-mobile')
  @ApiOperation({ summary: 'Verify Mobile' })
  verifyMobile(@Body() dto: VerifyMobileNumberDto) {
    return this.authService.verifyMobile(dto);
  }

  @Post('create-account')
  @ApiOperation({ summary: 'Create account for user' })
  createAccount(@Body() dto: CreateAccountDto) {
    return this.authService.createAccount(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get(':tag')
  @ApiOperation({ summary: 'Check if mxe tag exists' })
  checkMxeTagExists(@Param('tag') tag: string) {
    return this.authService.checkMxeTagExists(tag);
  }

  @Patch('account/:accountId')
  @ApiOperation({ summary: 'Update account details' })
  updateAccountDetails(
    @Body() dto: UpdateAccountDetails,
    @Param(':accountId') accountId: string,
  ) {
    return this.authService.updateAccountDetails(accountId, dto);
  }

  @Patch('account/change-pin/:userId')
  @ApiOperation({ summary: 'Update account pin' })
  updateAccountPin(
    @Body() dto: updateAccountPinDto,
    @Param('userId') userId: string,
  ) {
    return this.authService.updateAccountPin(userId, dto);
  }
}
