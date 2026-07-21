import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiSecurity, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator';
import type { WorkspaceContext } from '../../common/types/workspace';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';

@ApiTags('Budgets')
@ApiBearerAuth('access-token')
@ApiSecurity('workspace-id')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly service: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Simpan/update anggaran untuk kategori' })
  upsert(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Body() dto: CreateBudgetDto,
  ) {
    return this.service.upsert(ws.id, dto);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Ambil rangkuman anggaran periode YYYY-MM' })
  getSummary(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Query('period') period: string,
  ) {
    if (!period || !/^\d{4}-\d{2}$/.test(period)) {
      throw new BadRequestException('Query parameter period wajib diisi dalam format YYYY-MM');
    }
    return this.service.getSummary(ws.id, period);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus anggaran' })
  remove(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Param('id') id: string,
  ) {
    return this.service.remove(ws.id, id);
  }
}
