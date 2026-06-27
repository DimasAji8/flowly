import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ParseTransactionDto } from './dto/parse-transaction.dto';
import { AiParsedTransactionResponseDto } from './dto/ai-parsed-transaction-response.dto';
import { AiInsightResponseDto } from './dto/ai-insight-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator';
import type { WorkspaceContext } from '../../common/types/workspace';

@ApiTags('ai')
@ApiBearerAuth('access-token')
@ApiSecurity('workspace-id')
@Controller('ai')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('parse-transaction')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Mengekstrak teks transaksi manual menjadi format JSON terstruktur',
  })
  @ApiResponse({
    status: 200,
    description: 'Teks transaksi berhasil diekstrak dan dicocokkan ke database',
    type: AiParsedTransactionResponseDto,
  })
  async parseTransaction(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Body() dto: ParseTransactionDto,
  ) {
    return this.aiService.parseTransactionText(ws.id, dto.text);
  }

  @Post('scan-receipt')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Berkas gambar struk belanja (png, jpeg, webp) - max 4MB',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Menganalisis foto struk belanja untuk mengisi transaksi secara otomatis',
  })
  @ApiResponse({
    status: 200,
    description: 'Data struk berhasil diekstrak dan dicocokkan ke database',
    type: AiParsedTransactionResponseDto,
  })
  async scanReceipt(
    @CurrentWorkspace() ws: WorkspaceContext,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 4 * 1024 * 1024 }), // 4MB
          new FileTypeValidator({ fileType: 'image/.*' }), // Any image type
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.aiService.scanReceipt(ws.id, file);
  }

  @Get('insights')
  @ApiOperation({
    summary:
      'Mendapatkan analisis finansial proaktif untuk workspace aktif',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar analisis finansial berhasil dibuat',
    type: [AiInsightResponseDto],
  })
  async getInsights(@CurrentWorkspace() ws: WorkspaceContext) {
    return this.aiService.getInsights(ws.id);
  }
}
