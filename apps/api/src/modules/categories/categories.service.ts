import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  list(workspaceId: string, type?: TransactionType) {
    return this.prisma.category.findMany({
      where: {
        workspaceId,
        ...(type ? { type } : {}),
      },
      orderBy: [{ type: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findById(workspaceId: string, id: string) {
    const cat = await this.prisma.category.findFirst({
      where: { id, workspaceId },
    });
    if (!cat) throw new NotFoundException('Kategori tidak ditemukan');
    return cat;
  }

  create(workspaceId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        workspaceId,
        name: dto.name,
        type: dto.type,
        color: (dto.color ?? '#6E6E73').toUpperCase(),
        icon: dto.icon ?? '📦',
        group: dto.group ?? null,
      },
    });
  }

  async update(workspaceId: string, id: string, dto: UpdateCategoryDto) {
    await this.findById(workspaceId, id);
    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.color !== undefined ? { color: dto.color.toUpperCase() } : {}),
        ...(dto.icon !== undefined ? { icon: dto.icon } : {}),
        ...(dto.group !== undefined ? { group: dto.group } : {}),
      },
    });
  }

  async remove(workspaceId: string, id: string): Promise<void> {
    await this.findById(workspaceId, id);
    try {
      await this.prisma.category.delete({ where: { id } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2003'
      ) {
        throw new ConflictException(
          'Category still has transactions. Move or delete them first.',
        );
      }
      throw e;
    }
  }
}
