import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { PaginationDto } from 'src/wallet/dto/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('verification')
@Controller('verification')
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post('')
  @ApiOperation({ summary: 'Request account verification' })
  requestAcountVerification(
    @Req() req,
    @Body() bvn: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.verificationService.requestAcountVerification(
      req.user.email,
      file,
      bvn,
    );
  }

  @Patch('')
  // add roles guard
  @ApiOperation({ summary: 'Verify an account' })
  verifyAccount(@Body() accountEmail: string) {
    return this.verificationService.verifyAccount(accountEmail);
  }

  @Get('')
  // add roles guard
  @ApiOperation({ summary: 'View all pending verifications' })
  viewPendingVerifications(@Query() dto: PaginationDto) {
    return this.verificationService.viewPendingVerifications(dto);
  }
}
