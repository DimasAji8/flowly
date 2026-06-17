import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeveloperGuard } from '../../common/guards/developer.guard';
import { DeveloperOnly } from '../../common/decorators/developer-only.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.query';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /** Public: submit a review */
  @Post()
  @ApiOperation({ summary: 'Kirim review baru (publik)' })
  @ApiResponse({ status: 201, description: 'Review berhasil dikirim' })
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
  }

  /** Public: get shown reviews for landing page */
  @Get('shown')
  @ApiOperation({ summary: 'Ambil review yang ditampilkan di landing page' })
  @ApiResponse({ status: 200, description: 'List review' })
  getShown() {
    return this.reviewsService.getShown();
  }

  /** Developer: list all reviews (paginated) */
  @Get()
  @UseGuards(JwtAuthGuard, DeveloperGuard)
  @DeveloperOnly()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Semua review (developer only)' })
  @ApiResponse({ status: 200, description: 'List semua review' })
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.reviewsService.findAll(pagination);
  }

  /** Developer: toggle show/hide */
  @Post(':id/toggle')
  @UseGuards(JwtAuthGuard, DeveloperGuard)
  @DeveloperOnly()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Toggle tampilkan/sembunyikan review' })
  @ApiResponse({ status: 200, description: 'Review diupdate' })
  toggleShow(@Param('id') id: string) {
    return this.reviewsService.toggleShow(id);
  }

  /** Developer: delete */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, DeveloperGuard)
  @DeveloperOnly()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Hapus review (developer only)' })
  @ApiResponse({ status: 200, description: 'Review dihapus' })
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}
