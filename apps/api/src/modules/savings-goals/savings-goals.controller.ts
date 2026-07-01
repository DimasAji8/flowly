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
  Query,
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
import { SavingsGoalsService } from './savings-goals.service';
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { ListSavingsGoalsQuery } from './dto/list-savings-goals.query';
import { SavingsGoalResponse } from './dto/savings-goal-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator';
import type { WorkspaceContext } from '../../common/types/workspace';

@ApiTags('savings-goals')
@ApiBearerAuth('access-token')
@ApiSecurity('workspace-id')
@Controller('savings-goals')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class SavingsGoalsController {
  constructor(private readonly service: SavingsGoalsService) {}

  @Get()
  @ApiOperation({ summary: 'List target tabungan' })
  @ApiResponse({ status: 200, type: SavingsGoalResponse, isArray: true })
  list(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Query() query: ListSavingsGoalsQuery,
  ) {
    return this.service.list(ws.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail target tabungan' })
  @ApiParam({ name: 'id', description: 'ID target tabungan' })
  @ApiResponse({
    status: 200,
    description: 'Data target tabungan',
    type: SavingsGoalResponse,
  })
  findOne(@CurrentWorkspace() ws: WorkspaceContext, @Param('id') id: string) {
    return this.service.findById(ws.id, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat target tabungan baru' })
  @ApiResponse({ status: 201, type: SavingsGoalResponse })
  create(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Body() dto: CreateSavingsGoalDto,
  ) {
    return this.service.create(ws.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update target tabungan' })
  @ApiParam({ name: 'id', description: 'ID target tabungan' })
  @ApiResponse({
    status: 200,
    description: 'Target berhasil diupdate',
    type: SavingsGoalResponse,
  })
  update(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Param('id') id: string,
    @Body() dto: UpdateSavingsGoalDto,
  ) {
    return this.service.update(ws.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus target tabungan' })
  @ApiParam({ name: 'id', description: 'ID target tabungan' })
  @ApiResponse({ status: 204, description: 'Berhasil dihapus' })
  remove(@CurrentWorkspace() ws: WorkspaceContext, @Param('id') id: string) {
    return this.service.remove(ws.id, id);
  }

  @Post(':id/contributions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tambah setoran ke target tabungan' })
  @ApiParam({ name: 'id', description: 'ID target tabungan' })
  @ApiResponse({ status: 201, type: SavingsGoalResponse })
  addContribution(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Param('id') id: string,
    @Body() dto: CreateContributionDto,
  ) {
    return this.service.addContribution(ws.id, id, dto);
  }

  @Get(':id/contributions')
  @ApiOperation({ summary: 'Daftar riwayat setoran target tabungan' })
  @ApiParam({ name: 'id', description: 'ID target tabungan' })
  @ApiResponse({ status: 200, isArray: true })
  listContributions(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Param('id') id: string,
  ) {
    return this.service.listContributions(ws.id, id);
  }
}
