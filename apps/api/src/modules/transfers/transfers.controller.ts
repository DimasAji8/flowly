import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator';
import type { WorkspaceContext } from '../../common/types/workspace';

@ApiTags('transfers')
@ApiBearerAuth('access-token')
@ApiSecurity('workspace-id')
@Controller('transfers')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Get()
  @ApiOperation({ summary: 'List transfer (opsional filter year & month)' })
  list(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.transfersService.list(
      ws.id,
      year ? Number(year) : undefined,
      month ? Number(month) : undefined,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat transfer antar wallet' })
  create(@CurrentWorkspace() ws: WorkspaceContext, @Body() dto: CreateTransferDto) {
    return this.transfersService.create(ws.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Batalkan transfer (saldo dikembalikan)' })
  remove(@CurrentWorkspace() ws: WorkspaceContext, @Param('id') id: string) {
    return this.transfersService.remove(ws.id, id);
  }
}
