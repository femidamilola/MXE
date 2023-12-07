import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  CreateAccountDto,
  RequestMobileVerification,
  UpdateAccountDetails,
  VerifyMobileNumberDto,
  updateAccountPinDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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

  @Get(':tag')
  @ApiOperation({ summary: 'Check if mxe tag exists' })
  checkMxeTagExists(@Param('tag') tag: string) {
    return this.authService.checkMxeTagExists(tag);
  }

  @Patch('account')
  @ApiOperation({ summary: 'Update account details' })
  updateAccountDetails(@Body() dto: UpdateAccountDetails) {
    return this.authService.updateAccountDetails(dto);
  }

  @Patch('account/change-pin')
  @ApiOperation({ summary: 'Update account pin' })
  updateAccountPin(@Body() dto: updateAccountPinDto) {
    return this.authService.updateAccountPin(dto);
  }
}
