import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DeveloperService } from './developer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeveloperGuard } from '../../common/guards/developer.guard';
import { DeveloperOnly } from '../../common/decorators/developer-only.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.query';

@ApiTags('developer')
@ApiBearerAuth('access-token')
@Controller('developer')
@UseGuards(JwtAuthGuard, DeveloperGuard)
@DeveloperOnly()
export class DeveloperController {
  constructor(private readonly developerService: DeveloperService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Statistik sistem untuk developer' })
  @ApiResponse({
    status: 200,
    description: 'Statistik user, transaksi, workspace, dan health',
  })
  stats() {
    return this.developerService.getStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Daftar semua user (developer only)' })
  @ApiResponse({ status: 200, description: 'List semua user terdaftar' })
  users(@Query() pagination: PaginationQueryDto) {
    return this.developerService.listUsers(pagination);
  }

  @Get('workspaces')
  @ApiOperation({ summary: 'Statistik workspace' })
  @ApiResponse({
    status: 200,
    description: 'Jumlah workspace, anggota per workspace',
  })
  workspaces(@Query() pagination: PaginationQueryDto) {
    return this.developerService.getWorkspaceStats(pagination);
  }

  @Get('health')
  @ApiOperation({ summary: 'System health check' })
  @ApiResponse({ status: 200, description: 'Status database & uptime' })
  health() {
    return this.developerService.getHealth();
  }
}
