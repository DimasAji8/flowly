import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

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

  /** Developer: list all reviews */
  async findAll() {
    return this.prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
    });
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
