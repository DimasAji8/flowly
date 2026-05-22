import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOperation({
    summary: 'Detail workspace aktif',
    description:
      'Wajib kirim header `X-Workspace-Id`. User harus member dari workspace tersebut.',
  })
  @ApiResponse({ status: 200, type: CurrentWorkspaceResponse })
  @ApiResponse({ status: 400, description: 'Header X-Workspace-Id missing' })
  @ApiResponse({ status: 403, description: 'Bukan member workspace' })
  current(@CurrentWorkspace() workspace: WorkspaceContext) {
    return this.workspacesService.getById(workspace.id);
  }
}
