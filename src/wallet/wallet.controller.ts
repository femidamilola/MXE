import {
  Controller,
  Get,
  Query,
  Req,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from './dto/pagination.dto';
import { CreateVirtualCardDto } from './dto/wallet.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@ApiSecurity('JWT-auth')
@UseGuards(JwtGuard)
@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Post('')
  @ApiOperation({ summary: 'Create wallet' })
  createWallet(@Req() req) {
    return this.walletService.createWallet(req.user.email);
  }

  @Get('transactions')
  @ApiOperation({ summary: "Get all a wallet's transcations" })
  getWalletTransactions(@Query() dto: PaginationDto, @Req() req) {
    return this.walletService.getWalletTransactions(req.user.email, dto);
  }

  @Get(':walletTransactionId')
  @ApiOperation({ summary: 'Get a wallet transaction by id' })
  getWaletTransactionById(
    @Param('walletTransactionId') walletTransactionId: string,
    @Req() req,
  ) {
    return this.walletService.getWaletTransactionById(
      req.user.email,
      walletTransactionId,
    );
  }

  @Get('ref/:transactionRef')
  @ApiOperation({
    summary: 'Get a wallet transaction by transaction reference',
  })
  getWalletTransactionByRef(
    @Param('transactionRef') transactionRef: string,
    @Req() req,
  ) {
    return this.walletService.getWalletTransactionByRef(
      req.user.email,
      transactionRef,
    );
  }

  @Get('details')
  @ApiOperation({ summary: 'Get wallet details' })
  getWalletDetails(@Req() req) {
    return this.walletService.getWalletDetails(req.user.email);
  }

  @Get('virtual-card')
  @ApiOperation({ summary: 'Get virtual card details' })
  async getVirtualCard(@Req() req) {
    return this.walletService.getVirtualCard(req.user.email);
  }

  @Post('virtual-card')
  @ApiOperation({ summary: 'Create virtual card' })
  async createVirtualCard(@Req() req, @Body() dto: CreateVirtualCardDto) {
    return this.walletService.createVirtualCard(req.user.email, dto);
  }
}
