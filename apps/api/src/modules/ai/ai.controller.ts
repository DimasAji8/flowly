import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Query,
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
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AiService, FinancialInsight, ScannedMutationItem } from './ai.service';
import { ParseTransactionDto } from './dto/parse-transaction.dto';
import { AiParsedTransactionResponseDto } from './dto/ai-parsed-transaction-response.dto';
import { AiInsightResponseDto } from './dto/ai-insight-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { AiThrottlerGuard } from '../../common/guards/ai-throttler.guard';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator';
import type { WorkspaceContext } from '../../common/types/workspace';

@ApiTags('ai')
@ApiBearerAuth('access-token')
@ApiSecurity('workspace-id')
@Controller('ai')
@UseGuards(JwtAuthGuard, WorkspaceGuard, AiThrottlerGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // 20 request per menit per user
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
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

  // 10 request per menit per user (lebih ketat, pakai vision AI)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
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
          description:
            'Berkas gambar struk belanja (png, jpeg, webp) - max 4MB',
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

  // 5 request per menit per user (hasil di-cache 6 jam di sisi server)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Get('insights')
  @ApiOperation({
    summary: 'Mendapatkan analisis finansial proaktif untuk workspace aktif',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar analisis finansial berhasil dibuat',
    type: [AiInsightResponseDto],
  })
  @ApiQuery({
    name: 'force',
    required: false,
    description: 'Paksa kalkulasi ulang tanpa cache',
    type: Boolean,
  })
  async getInsights(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Query('force') force?: string,
  ): Promise<FinancialInsight[]> {
    const isForce = force === 'true';
    return this.aiService.getInsights(ws.id, isForce);
  }

  // 5 request per menit per user (scan mutasi lebih berat: banyak transaksi)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('scan-mutation')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Gambar mutasi rekening (png, jpeg, webp) atau PDF - max 10MB',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Membaca mutasi rekening bank dari gambar/PDF dan mengekstrak semua transaksi',
  })
  async scanMutation(
    @CurrentWorkspace() ws: WorkspaceContext,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ): Promise<ScannedMutationItem[]> {
    const allowed = [
      'image/png',
      'image/jpeg',
      'image/webp',
      'application/pdf',
    ];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(
        'Format file tidak didukung. Gunakan gambar (png/jpeg/webp) atau PDF.',
      );
    }
    return this.aiService.scanMutation(ws.id, file);
  }
}
