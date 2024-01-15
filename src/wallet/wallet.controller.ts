import { Controller, Get, Query, Req, Post, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from './dto/pagination.dto';

@ApiSecurity('JWT-auth')
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
}
