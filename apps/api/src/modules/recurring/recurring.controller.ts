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
import { RecurringService } from './recurring.service';
import { CreateRecurringDto } from './dto/create-recurring.dto';
import { UpdateRecurringDto } from './dto/update-recurring.dto';
import { ListRecurringQuery } from './dto/list-recurring.query';
import { RecurringResponse } from './dto/recurring-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator';
import type { WorkspaceContext } from '../../common/types/workspace';

@ApiTags('recurring')
@ApiBearerAuth('access-token')
@ApiSecurity('workspace-id')
@Controller('recurring')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class RecurringController {
  constructor(private readonly service: RecurringService) {}

  @Get()
  @ApiOperation({ summary: 'List recurring transactions' })
  @ApiResponse({ status: 200, type: RecurringResponse, isArray: true })
  list(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Query() query: ListRecurringQuery,
  ) {
    return this.service.list(ws.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail recurring' })
  @ApiParam({ name: 'id', description: 'ID recurring transaction' })
  @ApiResponse({
    status: 200,
    description: 'Data recurring',
    type: RecurringResponse,
  })
  findOne(@CurrentWorkspace() ws: WorkspaceContext, @Param('id') id: string) {
    return this.service.findById(ws.id, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat recurring' })
  @ApiResponse({ status: 201, type: RecurringResponse })
  create(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Body() dto: CreateRecurringDto,
  ) {
    return this.service.create(ws.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update recurring' })
  @ApiParam({ name: 'id', description: 'ID recurring transaction' })
  @ApiResponse({
    status: 200,
    description: 'Recurring berhasil diupdate',
    type: RecurringResponse,
  })
  update(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Param('id') id: string,
    @Body() dto: UpdateRecurringDto,
  ) {
    return this.service.update(ws.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus recurring' })
  @ApiParam({ name: 'id', description: 'ID recurring transaction' })
  @ApiResponse({ status: 204, description: 'Berhasil dihapus' })
  remove(@CurrentWorkspace() ws: WorkspaceContext, @Param('id') id: string) {
    return this.service.remove(ws.id, id);
  }
}
