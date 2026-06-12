import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ListTransactionsQuery } from './dto/list-transactions.query';
import {
  serializeTransaction,
  serializeTransactionWithRefs,
  SerializedTransaction,
} from './transactions.serializer';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(workspaceId: string, query: ListTransactionsQuery) {
    const where: Prisma.TransactionWhereInput = {
      workspaceId,
      ...(query.type ? { type: query.type } : {}),
      ...(query.walletId ? { walletId: query.walletId } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.from || query.to
        ? {
            transactionDate: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true,
              group: true,
            },
          },
          wallet: { select: { id: true, name: true } },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: items.map(serializeTransactionWithRefs),
      meta: { page, limit, total },
    };
  }

  async findById(workspaceId: string, id: string) {
    const tx = await this.prisma.transaction.findFirst({
      where: { id, workspaceId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            group: true,
          },
        },
        wallet: { select: { id: true, name: true } },
      },
    });
    if (!tx) throw new NotFoundException('Transaksi tidak ditemukan');
    return serializeTransactionWithRefs(tx);
  }

  async create(
    workspaceId: string,
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<SerializedTransaction> {
    await this.assertCategoryAndWalletBelong(workspaceId, dto);

    const created = await this.prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          workspaceId,
          userId,
          type: dto.type,
          amount: new Prisma.Decimal(dto.amount),
          categoryId: dto.categoryId,
          walletId: dto.walletId,
          note: dto.note,
          transactionDate: new Date(dto.transactionDate),
        },
      });
      await this.applyBalanceDelta(
        tx,
        dto.walletId,
        dto.type,
        new Prisma.Decimal(dto.amount),
      );
      return created;
    });

    return serializeTransaction(created);
  }

  async update(
    workspaceId: string,
    id: string,
    dto: UpdateTransactionDto,
  ): Promise<SerializedTransaction> {
    const existing = await this.prisma.transaction.findFirst({
      where: { id, workspaceId },
    });
    if (!existing) throw new NotFoundException('Transaksi tidak ditemukan');

    if (dto.categoryId || dto.walletId || dto.type) {
      await this.assertCategoryAndWalletBelong(workspaceId, {
        categoryId: dto.categoryId ?? existing.categoryId,
        walletId: dto.walletId ?? existing.walletId,
        type: dto.type ?? existing.type,
      });
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // Reverse efek lama
      await this.applyBalanceDelta(
        tx,
        existing.walletId,
        existing.type,
        existing.amount,
        true,
      );

      const newType = dto.type ?? existing.type;
      const newWalletId = dto.walletId ?? existing.walletId;
      const newAmount =
        dto.amount !== undefined
          ? new Prisma.Decimal(dto.amount)
          : existing.amount;

      const updated = await tx.transaction.update({
        where: { id: existing.id },
        data: {
          ...(dto.type !== undefined ? { type: dto.type } : {}),
          ...(dto.amount !== undefined
            ? { amount: new Prisma.Decimal(dto.amount) }
            : {}),
          ...(dto.categoryId !== undefined
            ? { categoryId: dto.categoryId }
            : {}),
          ...(dto.walletId !== undefined ? { walletId: dto.walletId } : {}),
          ...(dto.note !== undefined ? { note: dto.note } : {}),
          ...(dto.transactionDate !== undefined
            ? { transactionDate: new Date(dto.transactionDate) }
            : {}),
        },
      });

      // Apply efek baru
      await this.applyBalanceDelta(tx, newWalletId, newType, newAmount);

      return updated;
    });

    return serializeTransaction(updated);
  }

  async remove(workspaceId: string, id: string): Promise<void> {
    const existing = await this.prisma.transaction.findFirst({
      where: { id, workspaceId },
    });
    if (!existing) throw new NotFoundException('Transaksi tidak ditemukan');

    await this.prisma.$transaction(async (tx) => {
      await this.applyBalanceDelta(
        tx,
        existing.walletId,
        existing.type,
        existing.amount,
        true,
      );
      await tx.transaction.delete({ where: { id: existing.id } });
    });
  }

  // =========================================================
  // Summary (untuk dashboard)
  // =========================================================

  async monthlySummary(workspaceId: string, year: number, month: number) {
    // month: 1..12
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const grouped = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        workspaceId,
        transactionDate: {
          gte: start,
          lt: end,
        },
      },
      _sum: { amount: true },
    });

    const income =
      grouped.find((g) => g.type === TransactionType.income)?._sum.amount ??
      new Prisma.Decimal(0);
    const expense =
      grouped.find((g) => g.type === TransactionType.expense)?._sum.amount ??
      new Prisma.Decimal(0);
    const net = income.minus(expense);

    return {
      period: { year, month },
      income: income.toString(),
      expense: expense.toString(),
      net: net.toString(),
    };
  }

  /**
   * Daily summary untuk calendar view: total income & expense per tanggal
   * di rentang [start, end). Return: array of { date: 'YYYY-MM-DD', income, expense }.
   */
  async dailySummary(workspaceId: string, year: number, month: number) {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const grouped = await this.prisma.transaction.groupBy({
      by: ['transactionDate', 'type'],
      where: {
        workspaceId,
        transactionDate: { gte: start, lt: end },
      },
      _sum: { amount: true },
    });

    const map = new Map<
      string,
      { income: Prisma.Decimal; expense: Prisma.Decimal }
    >();

    for (const g of grouped) {
      const key = g.transactionDate.toISOString().slice(0, 10);
      const entry = map.get(key) ?? {
        income: new Prisma.Decimal(0),
        expense: new Prisma.Decimal(0),
      };
      if (g.type === TransactionType.income) {
        entry.income = (g._sum.amount ?? new Prisma.Decimal(0)).plus(
          entry.income,
        );
      } else {
        entry.expense = (g._sum.amount ?? new Prisma.Decimal(0)).plus(
          entry.expense,
        );
      }
      map.set(key, entry);
    }

    const days: { date: string; income: string; expense: string }[] = [];
    for (const [date, v] of map.entries()) {
      days.push({
        date,
        income: v.income.toString(),
        expense: v.expense.toString(),
      });
    }
    days.sort((a, b) => a.date.localeCompare(b.date));

    return { period: { year, month }, days };
  }

  // =========================================================
  // helpers
  // =========================================================

  private async assertCategoryAndWalletBelong(
    workspaceId: string,
    payload: { categoryId: string; walletId: string; type: TransactionType },
  ) {
    const [category, wallet] = await Promise.all([
      this.prisma.category.findFirst({
        where: { id: payload.categoryId, workspaceId },
        select: { id: true, type: true },
      }),
      this.prisma.wallet.findFirst({
        where: { id: payload.walletId, workspaceId },
        select: { id: true },
      }),
    ]);

    if (!category) {
      throw new BadRequestException('Kategori tidak ditemukan');
    }
    if (!wallet) {
      throw new BadRequestException('Dompet tidak ditemukan');
    }
    if (category.type !== payload.type) {
      throw new BadRequestException(
        'Jenis kategori tidak sesuai dengan jenis transaksi',
      );
    }
  }

  private async applyBalanceDelta(
    tx: Prisma.TransactionClient,
    walletId: string,
    type: TransactionType,
    amount: Prisma.Decimal,
    reverse = false,
  ) {
    const sign =
      type === TransactionType.income ? (reverse ? -1 : 1) : reverse ? 1 : -1;
    const delta = amount.mul(sign);
    await tx.wallet.update({
      where: { id: walletId },
      data: { balance: { increment: delta } },
    });
  }
}
