import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { WalletResponse } from './dto/wallet-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator';
import type { WorkspaceContext } from '../../common/types/workspace';

@ApiTags('wallets')
@ApiBearerAuth('access-token')
@ApiSecurity('workspace-id')
@Controller('wallets')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  @ApiOperation({ summary: 'List semua wallet di workspace' })
  @ApiResponse({ status: 200, type: WalletResponse, isArray: true })
  list(@CurrentWorkspace() ws: WorkspaceContext) {
    return this.walletsService.list(ws.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail wallet' })
  @ApiParam({ name: 'id', description: 'ID wallet' })
  @ApiResponse({
    status: 200,
    description: 'Data wallet',
    type: WalletResponse,
  })
  @ApiResponse({ status: 404, description: 'Wallet tidak ditemukan' })
  findOne(@CurrentWorkspace() ws: WorkspaceContext, @Param('id') id: string) {
    return this.walletsService.findById(ws.id, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat wallet baru' })
  @ApiResponse({ status: 201, type: WalletResponse })
  create(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Body() dto: CreateWalletDto,
  ) {
    return this.walletsService.create(ws.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update wallet (rename)' })
  @ApiParam({ name: 'id', description: 'ID wallet' })
  @ApiResponse({
    status: 200,
    description: 'Wallet berhasil diupdate',
    type: WalletResponse,
  })
  @ApiResponse({ status: 404, description: 'Wallet tidak ditemukan' })
  update(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Param('id') id: string,
    @Body() dto: UpdateWalletDto,
  ) {
    return this.walletsService.update(ws.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Hapus wallet',
    description:
      'Akan gagal jika wallet masih punya transaksi atau recurring transaction.',
  })
  @ApiParam({ name: 'id', description: 'ID wallet' })
  @ApiResponse({ status: 204, description: 'Berhasil dihapus' })
  @ApiResponse({
    status: 409,
    description: 'Wallet masih punya transaksi terkait',
  })
  remove(@CurrentWorkspace() ws: WorkspaceContext, @Param('id') id: string) {
    return this.walletsService.remove(ws.id, id);
  }
}
