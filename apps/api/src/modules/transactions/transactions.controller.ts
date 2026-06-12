import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ListTransactionsQuery } from './dto/list-transactions.query';
import {
  MonthlySummaryResponse,
  TransactionListResponse,
  TransactionResponse,
} from './dto/transaction-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { WorkspaceContext } from '../../common/types/workspace';
import type { AuthUser } from '../../common/types/auth';

@ApiTags('transactions')
@ApiBearerAuth('access-token')
@ApiSecurity('workspace-id')
@Controller('transactions')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'List transaksi (filter + paginasi)' })
  @ApiResponse({ status: 200, type: TransactionListResponse })
  list(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Query() query: ListTransactionsQuery,
  ) {
    return this.service.list(ws.id, query);
  }

  @Get('summary/monthly')
  @ApiOperation({
    summary: 'Ringkasan income/expense/net cashflow untuk bulan tertentu',
  })
  @ApiResponse({ status: 200, type: MonthlySummaryResponse })
  monthlySummary(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Query('year', new ParseIntPipe({ optional: true }))
    year?: number,
    @Query('month', new ParseIntPipe({ optional: true }))
    month?: number,
  ) {
    const now = new Date();
    return this.service.monthlySummary(
      ws.id,
      year ?? now.getUTCFullYear(),
      month ?? now.getUTCMonth() + 1,
    );
  }

  @Get('summary/daily')
  @ApiOperation({
    summary: 'Daily summary (per tanggal) untuk calendar view',
  })
  dailySummary(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Query('year', new ParseIntPipe({ optional: true }))
    year?: number,
    @Query('month', new ParseIntPipe({ optional: true }))
    month?: number,
  ) {
    const now = new Date();
    return this.service.dailySummary(
      ws.id,
      year ?? now.getUTCFullYear(),
      month ?? now.getUTCMonth() + 1,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail transaksi' })
  @ApiResponse({ status: 200, type: TransactionResponse })
  findOne(@CurrentWorkspace() ws: WorkspaceContext, @Param('id') id: string) {
    return this.service.findById(ws.id, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat transaksi baru (auto-update wallet balance)' })
  @ApiResponse({ status: 201, type: TransactionResponse })
  create(
    @CurrentWorkspace() ws: WorkspaceContext,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.service.create(ws.id, user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update transaksi (auto-recalc wallet balance)' })
  @ApiResponse({ status: 200, type: TransactionResponse })
  update(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.service.update(ws.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus transaksi (auto-recalc wallet balance)' })
  @ApiResponse({ status: 204 })
  remove(@CurrentWorkspace() ws: WorkspaceContext, @Param('id') id: string) {
    return this.service.remove(ws.id, id);
  }
}
