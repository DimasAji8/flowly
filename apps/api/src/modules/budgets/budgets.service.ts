import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(workspaceId: string, dto: CreateBudgetDto) {
    // Validasi kategori
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category || category.workspaceId !== workspaceId) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    if (category.type !== 'expense') {
      throw new BadRequestException(
        'Anggaran hanya dapat dibuat untuk kategori pengeluaran',
      );
    }

    // Upsert budget
    return this.prisma.budget.upsert({
      where: {
        workspaceId_categoryId_period: {
          workspaceId,
          categoryId: dto.categoryId,
          period: dto.period,
        },
      },
      update: {
        amount: dto.amount,
      },
      create: {
        workspaceId,
        categoryId: dto.categoryId,
        period: dto.period,
        amount: dto.amount,
      },
    });
  }

  async getSummary(workspaceId: string, period: string) {
    // Mengambil semua kategori pengeluaran di workspace
    const categories = await this.prisma.category.findMany({
      where: {
        workspaceId,
        type: 'expense',
      },
    });

    // Mengambil semua budget di workspace untuk periode ini
    const budgets = await this.prisma.budget.findMany({
      where: {
        workspaceId,
        period,
      },
    });

    // Rentang tanggal untuk periode (bulan berjalan)
    const year = parseInt(period.split('-')[0], 10);
    const month = parseInt(period.split('-')[1], 10);
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    // Mengambil total pengeluaran per kategori pada periode berjalan
    const spentAggregations = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        workspaceId,
        type: 'expense',
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Memetakan pengeluaran aktual
    const spentMap = new Map<string, number>(
      spentAggregations.map((agg) => [
        agg.categoryId,
        Number(agg._sum.amount || 0),
      ]),
    );

    // Memetakan budget target
    const budgetMap = new Map(budgets.map((b) => [b.categoryId, b]));

    // Membangun rangkuman (summary)
    return categories.map((cat) => {
      const budgetRecord = budgetMap.get(cat.id);
      const spent = spentMap.get(cat.id) || 0;
      const limit = budgetRecord ? Number(budgetRecord.amount) : null;
      const remaining = limit !== null ? limit - spent : null;
      const percentage = limit && limit > 0 ? (spent / limit) * 100 : 0;

      return {
        id: budgetRecord?.id || null,
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        categoryColor: cat.color,
        categoryGroup: cat.group,
        limit,
        spent,
        remaining,
        percentage,
        period,
      };
    });
  }

  async remove(workspaceId: string, id: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
    });

    if (!budget || budget.workspaceId !== workspaceId) {
      throw new NotFoundException('Anggaran tidak ditemukan');
    }

    await this.prisma.budget.delete({
      where: { id },
    });

    return { success: true };
  }
}
