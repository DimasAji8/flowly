import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ParseTransactionDto } from './dto/parse-transaction.dto';
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
  @ApiOperation({ summary: 'Mengekstrak teks transaksi manual menjadi format JSON terstruktur' })
  @ApiResponse({
    status: 200,
    description: 'Teks transaksi berhasil diekstrak dan dicocokkan ke database',
  })
  async parseTransaction(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Body() dto: ParseTransactionDto,
  ) {
    return this.aiService.parseTransactionText(ws.id, dto.text);
  }
}
