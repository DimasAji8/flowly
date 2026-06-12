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
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponse } from './dto/category-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator';
import type { WorkspaceContext } from '../../common/types/workspace';

@ApiTags('categories')
@ApiBearerAuth('access-token')
@ApiSecurity('workspace-id')
@Controller('categories')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List kategori (opsional filter by type)' })
  @ApiQuery({
    name: 'type',
    enum: TransactionType,
    required: false,
    description: 'Filter income atau expense',
  })
  @ApiResponse({ status: 200, type: CategoryResponse, isArray: true })
  list(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Query('type') type?: TransactionType,
  ) {
    return this.service.list(ws.id, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail kategori' })
  @ApiResponse({ status: 200, type: CategoryResponse })
  findOne(@CurrentWorkspace() ws: WorkspaceContext, @Param('id') id: string) {
    return this.service.findById(ws.id, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat kategori baru' })
  @ApiResponse({ status: 201, type: CategoryResponse })
  create(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.service.create(ws.id, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update kategori (rename / recolor — type tidak bisa diubah)',
  })
  @ApiResponse({ status: 200, type: CategoryResponse })
  update(
    @CurrentWorkspace() ws: WorkspaceContext,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.service.update(ws.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus kategori' })
  @ApiResponse({ status: 204 })
  @ApiResponse({
    status: 409,
    description: 'Kategori masih dipakai oleh transaksi',
  })
  remove(@CurrentWorkspace() ws: WorkspaceContext, @Param('id') id: string) {
    return this.service.remove(ws.id, id);
  }
}
