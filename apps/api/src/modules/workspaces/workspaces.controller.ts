import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiPropertyOptional,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { IsInt, Min, Max, IsOptional } from 'class-validator';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator';
import type { AuthUser } from '../../common/types/auth';
import type { WorkspaceContext } from '../../common/types/workspace';
import {
  CurrentWorkspaceResponse,
  WorkspaceListItemResponse,
} from './dto/workspace-response.dto';

class UpdateAllocationTargetsBody {
  @ApiPropertyOptional({ example: 50, description: 'Target kebutuhan (%)' })
  @IsOptional() @IsInt() @Min(0) @Max(100) needsTarget?: number;

  @ApiPropertyOptional({ example: 30, description: 'Target keinginan (%)' })
  @IsOptional() @IsInt() @Min(0) @Max(100) wantsTarget?: number;

  @ApiPropertyOptional({ example: 20, description: 'Target tabungan (%)' })
  @IsOptional() @IsInt() @Min(0) @Max(100) savingsTarget?: number;
}

@ApiTags('workspaces')
@ApiBearerAuth('access-token')
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  @ApiOperation({
    summary: 'List workspace user',
    description:
      'Cross-workspace endpoint. Tidak butuh header `X-Workspace-Id`.',
  })
  @ApiResponse({
    status: 200,
    type: WorkspaceListItemResponse,
    isArray: true,
  })
  list(@CurrentUser() user: AuthUser) {
    return this.workspacesService.listForUser(user.id);
  }

  @Get('current')
  @UseGuards(WorkspaceGuard)
  @ApiSecurity('workspace-id')
  @ApiOperation({ summary: 'Detail workspace aktif' })
  @ApiResponse({ status: 200, type: CurrentWorkspaceResponse })
  current(@CurrentWorkspace() workspace: WorkspaceContext) {
    return this.workspacesService.getById(workspace.id);
  }

  @Patch('current/allocation')
  @UseGuards(WorkspaceGuard)
  @ApiSecurity('workspace-id')
  @ApiOperation({
    summary: 'Update target alokasi anggaran (needs/wants/savings %)',
  })
  @ApiResponse({ status: 200, description: 'Target alokasi berhasil diupdate' })
  updateAllocation(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Body() body: UpdateAllocationTargetsBody,
  ) {
    return this.workspacesService.updateAllocationTargets(workspace.id, body);
  }
}
