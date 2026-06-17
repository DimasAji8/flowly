import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.query';
import {
  PaginatedResponse,
  buildPaginatedResponse,
} from '../../common/types/pagination';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /** User submission — create a review */
  async create(dto: CreateReviewDto) {
    return this.prisma.review.create({
      data: {
        name: dto.name,
        rating: dto.rating,
        content: dto.content,
      },
    });
  }

  /** Get all reviews that are shown on landing page */
  async getShown() {
    return this.prisma.review.findMany({
      where: { isShown: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Developer: list all reviews (paginated) */
  async findAll(pagination: PaginationQueryDto): Promise<
    PaginatedResponse<{
      id: string;
      name: string;
      rating: number;
      content: string;
      isShown: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>
  > {
    const page = pagination.page ?? 1;
    const pageSize = pagination.pageSize ?? 50;

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.review.count(),
    ]);

    return buildPaginatedResponse(data, total, page, pageSize);
  }

  /** Developer: toggle isShown */
  async toggleShow(id: string) {
    const review = await this.prisma.review.findUniqueOrThrow({
      where: { id },
    });
    return this.prisma.review.update({
      where: { id },
      data: { isShown: !review.isShown },
    });
  }

  /** Developer: delete a review */
  async remove(id: string) {
    await this.prisma.review.findUniqueOrThrow({ where: { id } });
    return this.prisma.review.delete({ where: { id } });
  }
}
